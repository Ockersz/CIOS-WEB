import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exportCmsBackup, importCmsBackupZip } from "./backup.js";
import {
  createBlogPost,
  createService,
  deleteBlogPost,
  deleteService,
  getAdminBootstrap,
  getBlogPosts,
  getImageAssets,
  getPageBySlug,
  getServiceById,
  getServices,
  getSiteSettings,
  importRemoteImagesIntoLibrary,
  initializeDatabase,
  renameImageAsset,
  reorderBlogPosts,
  reorderServices,
  uploadBinaryImageAsset,
  uploadImageAsset,
  updateAdminPassword,
  updateBlogPost,
  updatePage,
  updateService,
  updateSiteSettings,
  verifyAdminPassword,
} from "./db.js";

const app = express();
const PORT = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, "..", "dist");
const indexHtmlPath = path.join(distDir, "index.html");
const uploadsDir = path.join(__dirname, "..", "uploads");
const adminSessions = new Map();
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "100mb" }));
app.use(
  "/uploads",
  express.static(uploadsDir, {
    etag: true,
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(
  "/assets",
  express.static(path.join(distDir, "assets"), {
    etag: true,
    immutable: true,
    maxAge: "1y",
  }),
);
app.use(
  express.static(distDir, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    },
  }),
);

function createAdminSession(username) {
  const token = `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  adminSessions.set(token, {
    username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const session = token ? adminSessions.get(token) : null;

  if (!token || !session || session.expiresAt < Date.now()) {
    if (token) {
      adminSessions.delete(token);
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  session.expiresAt = Date.now() + SESSION_TTL_MS;
  req.adminUser = session.username;
  req.adminToken = token;
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/settings/global", async (_req, res, next) => {
  try {
    res.json(await getSiteSettings());
  } catch (error) {
    next(error);
  }
});

app.get("/api/pages/:slug", async (req, res, next) => {
  try {
    const page = await getPageBySlug(req.params.slug);
    if (!page) {
      return res.status(404).json({ message: "Page not found" });
    }

    res.json(page);
  } catch (error) {
    next(error);
  }
});

app.get("/api/services", async (_req, res, next) => {
  try {
    res.json(await getServices());
  } catch (error) {
    next(error);
  }
});

app.get("/api/services/:id", async (req, res, next) => {
  try {
    const service = await getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    next(error);
  }
});

app.get("/api/blog-posts", async (_req, res, next) => {
  try {
    res.json(await getBlogPosts());
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/login", async (req, res, next) => {
  try {
    const password = String(req.body?.password || "");
    const user = await verifyAdminPassword(password);
    if (!user) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = createAdminSession(user.username);
    res.json({ token, username: user.username });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/logout", requireAdmin, (req, res) => {
  adminSessions.delete(req.adminToken);
  res.json({ ok: true });
});

app.get("/api/admin/bootstrap", requireAdmin, async (_req, res, next) => {
  try {
    res.json(await getAdminBootstrap());
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/settings/global", requireAdmin, async (req, res, next) => {
  try {
    res.json(await updateSiteSettings(req.body));
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/pages/:slug", requireAdmin, async (req, res, next) => {
  try {
    const updated = await updatePage(req.params.slug, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Page not found" });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/services", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await createService(req.body));
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/services/reorder", requireAdmin, async (req, res, next) => {
  try {
    res.json(await reorderServices(req.body?.ids || []));
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/services/:id", requireAdmin, async (req, res, next) => {
  try {
    const updated = await updateService(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/services/:id", requireAdmin, async (req, res, next) => {
  try {
    await deleteService(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/blog-posts", requireAdmin, async (req, res, next) => {
  try {
    await createBlogPost(req.body);
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/blog-posts/reorder", requireAdmin, async (req, res, next) => {
  try {
    res.json(await reorderBlogPosts(req.body?.slugs || []));
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/blog-posts/:slug", requireAdmin, async (req, res, next) => {
  try {
    await updateBlogPost(req.params.slug, req.body);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/admin/blog-posts/:slug", requireAdmin, async (req, res, next) => {
  try {
    await deleteBlogPost(req.params.slug);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/change-password", requireAdmin, async (req, res, next) => {
  try {
    const currentPassword = String(req.body?.currentPassword || "");
    const newPassword = String(req.body?.newPassword || "");

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await verifyAdminPassword(currentPassword);
    if (!user) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await updateAdminPassword(newPassword);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/images", requireAdmin, async (_req, res, next) => {
  try {
    res.json(await getImageAssets());
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/admin/images/upload-binary",
  requireAdmin,
  express.raw({ type: "application/octet-stream", limit: "100mb" }),
  async (req, res, next) => {
    try {
      res.status(201).json(
        await uploadBinaryImageAsset({
          name: String(req.headers["x-file-name"] || "uploaded-image"),
          mimeType: String(req.headers["x-file-type"] || "application/octet-stream"),
          buffer: req.body,
        }),
      );
    } catch (error) {
      next(error);
    }
  },
);

app.post("/api/admin/images/upload", requireAdmin, async (req, res, next) => {
  try {
    res.status(201).json(
      await uploadImageAsset({
        name: String(req.body?.name || "uploaded-image"),
        dataUrl: String(req.body?.dataUrl || ""),
      }),
    );
  } catch (error) {
    next(error);
  }
});

app.put("/api/admin/images/:id", requireAdmin, async (req, res, next) => {
  try {
    res.json(await renameImageAsset(req.params.id, String(req.body?.name || "")));
  } catch (error) {
    next(error);
  }
});

app.post("/api/admin/images/import-existing", requireAdmin, async (_req, res, next) => {
  try {
    res.json(await importRemoteImagesIntoLibrary());
  } catch (error) {
    next(error);
  }
});

app.get("/api/admin/backups/export", requireAdmin, async (_req, res, next) => {
  try {
    const backup = await exportCmsBackup();
    res.setHeader("Content-Type", backup.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${backup.fileName}"`);
    res.send(backup.buffer);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/api/admin/backups/import-binary",
  requireAdmin,
  express.raw({ type: ["application/zip", "application/octet-stream"], limit: "500mb" }),
  async (req, res, next) => {
    try {
      res.json(await importCmsBackupZip(req.body));
    } catch (error) {
      next(error);
    }
  },
);

app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  res.setHeader("Cache-Control", "no-cache");
  res.sendFile(indexHtmlPath, (error) => {
    if (error) {
      next(error);
    }
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      message: "Image upload is too large. Please use a smaller image file.",
    });
  }
  res.status(500).json({
    message: "Internal server error",
    detail: error instanceof Error ? error.message : String(error),
  });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API server running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
