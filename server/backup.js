import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";
import { getAdminBootstrap, getDatabaseConfig, initializeDatabase, resetDatabasePool } from "./db.js";
import { ensureUploadDirectory, UPLOAD_DIR } from "./media.js";

const execFileAsync = promisify(execFile);

function getMysqlArgs(config) {
  return ["-h", config.host, "-P", String(config.port), "-u", config.user, `-p${config.password}`];
}

async function makeTempDir(prefix) {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function copyUploadsTo(targetDir) {
  await ensureUploadDirectory();
  const targetUploadsDir = path.join(targetDir, "uploads");
  await fs.mkdir(targetUploadsDir, { recursive: true });
  await fs.cp(UPLOAD_DIR, targetUploadsDir, { recursive: true, force: true });
}

function buildBackupFileName() {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(
    now.getMinutes(),
  ).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
  return `cios-backup-${stamp}.zip`;
}

async function createSqlDump(outputPath) {
  const config = getDatabaseConfig();
  const args = [
    ...getMysqlArgs(config),
    "--single-transaction",
    "--skip-lock-tables",
    "--routines",
    "--events",
    "--triggers",
    "--no-tablespaces",
    config.dbName,
  ];
  const { stdout } = await execFileAsync("mysqldump", args, { maxBuffer: 1024 * 1024 * 200 });
  await fs.writeFile(outputPath, stdout);
}

async function createBackupManifest(targetDir) {
  const config = getDatabaseConfig();
  await fs.writeFile(
    path.join(targetDir, "manifest.json"),
    JSON.stringify(
      {
        type: "cios-backup",
        version: 1,
        dbName: config.dbName,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

export async function exportCmsBackup() {
  const tempDir = await makeTempDir("cios-backup-export-");
  const archiveName = buildBackupFileName();
  const archivePath = path.join(tempDir, archiveName);

  try {
    await createSqlDump(path.join(tempDir, "backup.sql"));
    await createBackupManifest(tempDir);
    await copyUploadsTo(tempDir);
    await execFileAsync("zip", ["-rq", archivePath, "backup.sql", "manifest.json", "uploads"], {
      cwd: tempDir,
    });

    return {
      fileName: archiveName,
      contentType: "application/zip",
      buffer: await fs.readFile(archivePath),
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function validateBackupEntries(zipPath) {
  const { stdout } = await execFileAsync("unzip", ["-Z1", zipPath], {
    maxBuffer: 1024 * 1024 * 20,
  });
  const entries = stdout
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const entry of entries) {
    if (entry.startsWith("/") || entry.includes("..")) {
      throw new Error("Invalid backup archive contents");
    }
  }

  if (!entries.includes("backup.sql")) {
    throw new Error("Backup archive is missing backup.sql");
  }

  if (!entries.some((entry) => entry === "uploads/" || entry.startsWith("uploads/"))) {
    throw new Error("Backup archive is missing the uploads folder");
  }

  return entries;
}

async function restoreUploadsFrom(extractedDir) {
  const extractedUploadsDir = path.join(extractedDir, "uploads");
  await fs.rm(UPLOAD_DIR, { recursive: true, force: true });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.cp(extractedUploadsDir, UPLOAD_DIR, { recursive: true, force: true });
}

async function importSqlDump(sqlPath) {
  const config = getDatabaseConfig();
  const sqlContent = await fs.readFile(sqlPath);
  const args = [...getMysqlArgs(config), config.dbName];

  await new Promise((resolve, reject) => {
    const child = execFile("mysql", args, { maxBuffer: 1024 * 1024 * 200 }, (error) => {
      if (error) reject(error);
      else resolve(undefined);
    });

    child.stdin?.write(sqlContent);
    child.stdin?.end();
  });
}

export async function importCmsBackupZip(buffer) {
  if (!buffer || !buffer.byteLength) {
    throw new Error("Invalid backup archive");
  }

  const tempDir = await makeTempDir("cios-backup-import-");
  const zipPath = path.join(tempDir, "backup.zip");
  const extractedDir = path.join(tempDir, "extracted");

  try {
    await fs.writeFile(zipPath, buffer);
    await validateBackupEntries(zipPath);
    await fs.mkdir(extractedDir, { recursive: true });
    await execFileAsync("unzip", ["-q", zipPath, "-d", extractedDir], {
      maxBuffer: 1024 * 1024 * 100,
    });

    await resetDatabasePool();
    await importSqlDump(path.join(extractedDir, "backup.sql"));
    await restoreUploadsFrom(extractedDir);
    await initializeDatabase();

    return getAdminBootstrap();
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
