import mysql from "mysql2/promise";
import crypto from "node:crypto";
import { seedContent } from "./seedContent.js";
import {
  downloadRemoteImage,
  ensureUploadDirectory,
  inferImageNameFromUrl,
  saveBinaryImage,
  saveDataUrlImage,
  sanitizeDisplayName,
} from "./media.js";

const DB_NAME = process.env.DB_NAME || "cios_cms";

const connectionConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "1234",
  multipleStatements: true,
};

let pool;
const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const IMAGE_KEYS = new Set(["image", "heroImage", "detailImage", "src"]);

function parseJson(value) {
  if (!value) return null;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function isRemoteImageUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function collectRemoteImageUrls(value, trail = [], output = new Set()) {
  if (!value) return output;

  if (Array.isArray(value)) {
    value.forEach((item) => collectRemoteImageUrls(item, trail, output));
    return output;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      collectRemoteImageUrls(child, [...trail, key], output);
    });
    return output;
  }

  if (
    typeof value === "string" &&
    isRemoteImageUrl(value) &&
    trail.some((key) => IMAGE_KEYS.has(key))
  ) {
    output.add(value);
  }

  return output;
}

function replaceRemoteImageUrls(value, urlMap, trail = []) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceRemoteImageUrls(item, urlMap, trail));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        replaceRemoteImageUrls(child, urlMap, [...trail, key]),
      ]),
    );
  }

  if (
    typeof value === "string" &&
    trail.some((key) => IMAGE_KEYS.has(key)) &&
    urlMap.has(value)
  ) {
    return urlMap.get(value);
  }

  return value;
}

async function ensureColumnExists(db, tableName, columnName, definition) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [DB_NAME, tableName, columnName],
  );

  if (rows[0]?.count) return;
  await db.query(`ALTER TABLE \`${tableName}\` ADD COLUMN ${columnName} ${definition}`);
}

function buildContactCards(settings) {
  const business = settings.business || {};
  return [
    {
      icon: "MapPin",
      title: "Visit Us",
      details: business.addressLines || [],
    },
    {
      icon: "Phone",
      title: "Call Us",
      details: [
        business.phoneDisplay,
        business.phoneDisplay,
        business.hours?.[0] || "",
      ].filter(Boolean),
    },
    {
      icon: "Mail",
      title: "Email Us",
      details: [business.email, business.email, "24/7 Response"].filter(Boolean),
    },
    {
      icon: "Clock",
      title: "Working Hours",
      details: business.hours || [],
    },
  ];
}

function normalizeSiteSettings(rawValue) {
  const defaults = seedContent.siteSettings;
  const raw = rawValue || {};
  const normalizeClientItems = (items) =>
    (items || defaults.clients.items).map((item) =>
      typeof item === "string" ? { name: item, logo: "" } : { name: item?.name || "", logo: item?.logo || "" },
    );

  if (raw.business) {
    const normalized = {
      business: { ...defaults.business, ...raw.business },
      footer: {
        ...defaults.footer,
        ...raw.footer,
        services: raw.footer?.services || defaults.footer.services,
      },
      clients: {
        ...defaults.clients,
        ...raw.clients,
        items: normalizeClientItems(raw.clients?.items),
      },
      accreditations: {
        ...defaults.accreditations,
        ...raw.accreditations,
        groups: raw.accreditations?.groups || defaults.accreditations.groups,
      },
    };

    return {
      ...normalized,
      contactCards: buildContactCards(normalized),
    };
  }

  const migrated = {
    business: {
      ...defaults.business,
      name: raw.businessName || defaults.business.name,
      shortDescription: raw.shortDescription || defaults.business.shortDescription,
      addressLines: raw.addressLines || defaults.business.addressLines,
      locationLabel:
        raw.locationLabel ||
        (raw.addressLines ? raw.addressLines.join(", ") : defaults.business.locationLabel),
      phoneDisplay: raw.phoneDisplay || defaults.business.phoneDisplay,
      phoneHref: raw.phoneHref || defaults.business.phoneHref,
      email: raw.email || defaults.business.email,
      hours: raw.hours || defaults.business.hours,
      linkedinUrl: raw.linkedinUrl || defaults.business.linkedinUrl,
      copyrightName: raw.copyrightName || defaults.business.copyrightName,
    },
    footer: {
      services: raw.footerServices || defaults.footer.services,
    },
    clients: defaults.clients,
    accreditations: defaults.accreditations,
  };

  return {
    ...migrated,
    clients: {
      ...defaults.clients,
      items: normalizeClientItems(raw.clients?.items || defaults.clients.items),
    },
    contactCards: buildContactCards(migrated),
  };
}

async function createDatabaseIfNeeded() {
  const connection = await mysql.createConnection(connectionConfig);
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  } finally {
    await connection.end();
  }
}

export async function getPool() {
  if (pool) return pool;

  await createDatabaseIfNeeded();
  pool = mysql.createPool({
    ...connectionConfig,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });
  return pool;
}

export function getDatabaseConfig() {
  return {
    dbName: DB_NAME,
    host: connectionConfig.host,
    port: connectionConfig.port,
    user: connectionConfig.user,
    password: connectionConfig.password,
  };
}

export async function resetDatabasePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

export async function initializeDatabase() {
  const db = await getPool();
  await ensureUploadDirectory();

  await db.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pages (
      slug VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      hero_title VARCHAR(255) NOT NULL,
      hero_subtitle TEXT,
      hero_description TEXT,
      content JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id VARCHAR(100) PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      image VARCHAR(500),
      hero_image VARCHAR(500),
      detail_image VARCHAR(500),
      is_eco_friendly BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS service_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id VARCHAR(100) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_service_items_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      excerpt TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      date_label VARCHAR(100) NOT NULL,
      author VARCHAR(255) NOT NULL,
      read_time VARCHAR(100) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS image_assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      display_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL UNIQUE,
      url VARCHAR(500) NOT NULL UNIQUE,
      mime_type VARCHAR(100),
      size_bytes INT NOT NULL DEFAULT 0,
      source_url TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await ensureColumnExists(db, "services", "sort_order", "INT NOT NULL DEFAULT 0");
  await ensureServiceSortOrder(db);

  await ensureSiteSettings(db);
  await ensureAdminUser(db);
  await seedIfEmpty(db);
  await importRemoteImagesIntoLibrary();
}

async function ensureSiteSettings(db) {
  const [rows] = await db.query(
    `SELECT setting_value FROM site_settings WHERE setting_key = 'global' LIMIT 1`,
  );
  const existing = parseJson(rows[0]?.setting_value);
  const normalized = normalizeSiteSettings(existing);

  if (rows.length === 0) {
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)`,
      ["global", JSON.stringify(normalized)],
    );
    return;
  }

  await db.query(
    `UPDATE site_settings SET setting_value = ? WHERE setting_key = 'global'`,
    [JSON.stringify(normalized)],
  );
}

async function ensureAdminUser(db) {
  const [rows] = await db.query(
    `SELECT id FROM admin_users WHERE username = ? LIMIT 1`,
    [DEFAULT_ADMIN_USERNAME],
  );

  if (rows.length > 0) return;

  await db.query(
    `INSERT INTO admin_users (username, password_hash) VALUES (?, ?)`,
    [DEFAULT_ADMIN_USERNAME, hashPassword(DEFAULT_ADMIN_PASSWORD)],
  );
}

async function tableHasRows(db, tableName) {
  const [rows] = await db.query(`SELECT COUNT(*) AS count FROM \`${tableName}\``);
  return rows[0].count > 0;
}

async function seedIfEmpty(db) {
  const hasPages = await tableHasRows(db, "pages");
  if (hasPages) return;

  for (const page of seedContent.pages) {
    await db.query(
      `INSERT INTO pages (slug, title, hero_title, hero_subtitle, hero_description, content)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        page.slug,
        page.title,
        page.heroTitle,
        page.heroSubtitle,
        page.heroDescription,
        JSON.stringify(page.content),
      ],
    );
  }

  for (const service of seedContent.services) {
    await db.query(
      `INSERT INTO services (id, label, title, description, sort_order, image, hero_image, detail_image, is_eco_friendly)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        service.id,
        service.label,
        service.title,
        service.description,
        service.sortOrder || 0,
        service.image,
        service.heroImage,
        service.detailImage,
        service.isEcoFriendly ? 1 : 0,
      ],
    );

    for (const [index, item] of service.items.entries()) {
      await db.query(
        `INSERT INTO service_items (service_id, sort_order, title, description)
         VALUES (?, ?, ?, ?)`,
        [service.id, index + 1, item.title, item.description],
      );
    }
  }

  for (const post of seedContent.blogPosts) {
    await db.query(
      `INSERT INTO blog_posts (slug, title, excerpt, category, date_label, author, read_time, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.slug,
        post.title,
        post.excerpt,
        post.category,
        post.dateLabel,
        post.author,
        post.readTime,
        post.sortOrder,
      ],
    );
  }
}

async function ensureServiceSortOrder(db) {
  const [services] = await db.query(
    `SELECT id, sort_order FROM services ORDER BY sort_order ASC, title ASC, id ASC`,
  );

  for (const [index, service] of services.entries()) {
    if (Number(service.sort_order) !== index + 1) {
      await db.query(`UPDATE services SET sort_order = ? WHERE id = ?`, [index + 1, service.id]);
    }
  }
}

export async function getSiteSettings() {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT setting_value FROM site_settings WHERE setting_key = 'global' LIMIT 1`,
  );
  return normalizeSiteSettings(parseJson(rows[0]?.setting_value));
}

export async function getPageBySlug(slug) {
  const db = await getPool();
  const [rows] = await db.query(`SELECT * FROM pages WHERE slug = ? LIMIT 1`, [slug]);
  const page = rows[0];
  if (!page) return null;

  return {
    slug: page.slug,
    title: page.title,
    heroTitle: page.hero_title,
    heroSubtitle: page.hero_subtitle,
    heroDescription: page.hero_description,
    content: parseJson(page.content) || {},
  };
}

export async function getServices() {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT id, label, title, description, sort_order, image, hero_image, detail_image, is_eco_friendly
     FROM services ORDER BY sort_order ASC, title ASC, id ASC`,
  );

  return rows.map((service) => ({
    id: service.id,
    sortOrder: Number(service.sort_order || 0),
    label: service.label,
    title: service.title,
    description: service.description,
    image: service.image,
    heroImage: service.hero_image,
    detailImage: service.detail_image,
    isEcoFriendly: Boolean(service.is_eco_friendly),
  }));
}

export async function getServiceById(id) {
  const db = await getPool();
  const [services] = await db.query(
    `SELECT id, label, title, description, sort_order, image, hero_image, detail_image, is_eco_friendly
     FROM services WHERE id = ? LIMIT 1`,
    [id],
  );

  const service = services[0];
  if (!service) return null;

  const [items] = await db.query(
    `SELECT title, description FROM service_items WHERE service_id = ? ORDER BY sort_order ASC, id ASC`,
    [id],
  );

  return {
    id: service.id,
    sortOrder: Number(service.sort_order || 0),
    label: service.label,
    title: service.title,
    description: service.description,
    image: service.image,
    heroImage: service.hero_image,
    detailImage: service.detail_image,
    isEcoFriendly: Boolean(service.is_eco_friendly),
    items,
  };
}

export async function getBlogPosts() {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT slug, title, excerpt, category, date_label, author, read_time
     FROM blog_posts ORDER BY sort_order ASC, id ASC`,
  );

  return rows.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    dateLabel: post.date_label,
    author: post.author,
    readTime: post.read_time,
  }));
}

export async function verifyAdminPassword(password) {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1`,
    [DEFAULT_ADMIN_USERNAME],
  );

  const user = rows[0];
  if (!user) return null;
  if (user.password_hash !== hashPassword(password)) return null;

  return {
    id: user.id,
    username: user.username,
  };
}

export async function updateAdminPassword(newPassword) {
  const db = await getPool();
  await db.query(
    `UPDATE admin_users SET password_hash = ? WHERE username = ?`,
    [hashPassword(newPassword), DEFAULT_ADMIN_USERNAME],
  );
}

export async function getAllPages() {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT slug, title, hero_title, hero_subtitle, hero_description, content
     FROM pages ORDER BY slug ASC`,
  );

  return rows.map((page) => ({
    slug: page.slug,
    title: page.title,
    heroTitle: page.hero_title,
    heroSubtitle: page.hero_subtitle,
    heroDescription: page.hero_description,
    content: parseJson(page.content) || {},
  }));
}

export async function getAllServicesWithItems() {
  const db = await getPool();
  const [services] = await db.query(
    `SELECT id, label, title, description, sort_order, image, hero_image, detail_image, is_eco_friendly
     FROM services ORDER BY sort_order ASC, title ASC, id ASC`,
  );

  const output = [];
  for (const service of services) {
    const [items] = await db.query(
      `SELECT title, description FROM service_items WHERE service_id = ? ORDER BY sort_order ASC, id ASC`,
      [service.id],
    );

    output.push({
      id: service.id,
      sortOrder: Number(service.sort_order || 0),
      label: service.label,
      title: service.title,
      description: service.description,
      image: service.image,
      heroImage: service.hero_image,
      detailImage: service.detail_image,
      isEcoFriendly: Boolean(service.is_eco_friendly),
      items,
    });
  }

  return output;
}

export async function getAllBlogPostsAdmin() {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT slug, title, excerpt, category, date_label, author, read_time, sort_order
     FROM blog_posts ORDER BY sort_order ASC, id ASC`,
  );

  return rows.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    dateLabel: post.date_label,
    author: post.author,
    readTime: post.read_time,
    sortOrder: post.sort_order,
  }));
}

export async function getAdminBootstrap() {
  const [settings, pages, services, blogPosts, imageAssets] = await Promise.all([
    getSiteSettings(),
    getAllPages(),
    getAllServicesWithItems(),
    getAllBlogPostsAdmin(),
    getImageAssets(),
  ]);

  return { settings, pages, services, blogPosts, imageAssets };
}

export async function updateSiteSettings(settings) {
  const db = await getPool();
  const normalized = normalizeSiteSettings(settings);
  await db.query(
    `UPDATE site_settings SET setting_value = ? WHERE setting_key = 'global'`,
    [JSON.stringify(normalized)],
  );
  return normalized;
}

export async function updatePage(slug, page) {
  const db = await getPool();
  await db.query(
    `UPDATE pages
     SET title = ?, hero_title = ?, hero_subtitle = ?, hero_description = ?, content = ?
     WHERE slug = ?`,
    [
      page.title,
      page.heroTitle,
      page.heroSubtitle,
      page.heroDescription,
      JSON.stringify(page.content || {}),
      slug,
    ],
  );

  return getPageBySlug(slug);
}

export async function createService(service) {
  const db = await getPool();
  await db.query(
    `INSERT INTO services (id, label, title, description, sort_order, image, hero_image, detail_image, is_eco_friendly)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      service.id,
      service.label,
      service.title,
      service.description,
      Number(service.sortOrder || 0),
      service.image,
      service.heroImage,
      service.detailImage,
      service.isEcoFriendly ? 1 : 0,
    ],
  );

  await replaceServiceItems(db, service.id, service.items || []);
  return getServiceById(service.id);
}

export async function updateService(serviceId, service) {
  const db = await getPool();
  await db.query(
    `UPDATE services
     SET label = ?, title = ?, description = ?, sort_order = ?, image = ?, hero_image = ?, detail_image = ?, is_eco_friendly = ?
     WHERE id = ?`,
    [
      service.label,
      service.title,
      service.description,
      Number(service.sortOrder || 0),
      service.image,
      service.heroImage,
      service.detailImage,
      service.isEcoFriendly ? 1 : 0,
      serviceId,
    ],
  );

  await replaceServiceItems(db, serviceId, service.items || []);
  return getServiceById(serviceId);
}

async function replaceServiceItems(db, serviceId, items) {
  await db.query(`DELETE FROM service_items WHERE service_id = ?`, [serviceId]);
  for (const [index, item] of items.entries()) {
    await db.query(
      `INSERT INTO service_items (service_id, sort_order, title, description) VALUES (?, ?, ?, ?)`,
      [serviceId, index + 1, item.title, item.description],
    );
  }
}

export async function deleteService(serviceId) {
  const db = await getPool();
  await db.query(`DELETE FROM services WHERE id = ?`, [serviceId]);
}

export async function reorderServices(serviceIds) {
  const db = await getPool();
  for (const [index, id] of serviceIds.entries()) {
    await db.query(`UPDATE services SET sort_order = ? WHERE id = ?`, [index + 1, id]);
  }
  return getAllServicesWithItems();
}

export async function createBlogPost(post) {
  const db = await getPool();
  await db.query(
    `INSERT INTO blog_posts (slug, title, excerpt, category, date_label, author, read_time, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      post.slug,
      post.title,
      post.excerpt,
      post.category,
      post.dateLabel,
      post.author,
      post.readTime,
      Number(post.sortOrder || 0),
    ],
  );
}

export async function updateBlogPost(slug, post) {
  const db = await getPool();
  await db.query(
    `UPDATE blog_posts
     SET title = ?, excerpt = ?, category = ?, date_label = ?, author = ?, read_time = ?, sort_order = ?
     WHERE slug = ?`,
    [
      post.title,
      post.excerpt,
      post.category,
      post.dateLabel,
      post.author,
      post.readTime,
      Number(post.sortOrder || 0),
      slug,
    ],
  );
}

export async function deleteBlogPost(slug) {
  const db = await getPool();
  await db.query(`DELETE FROM blog_posts WHERE slug = ?`, [slug]);
}

export async function reorderBlogPosts(postSlugs) {
  const db = await getPool();
  for (const [index, slug] of postSlugs.entries()) {
    await db.query(`UPDATE blog_posts SET sort_order = ? WHERE slug = ?`, [index + 1, slug]);
  }
  return getAllBlogPostsAdmin();
}

export async function getImageAssets() {
  const db = await getPool();
  const [rows] = await db.query(
    `SELECT id, display_name, stored_name, url, mime_type, size_bytes, created_at
     FROM image_assets ORDER BY created_at DESC, id DESC`,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.display_name,
    storedName: row.stored_name,
    url: row.url,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes || 0),
    createdAt: row.created_at,
  }));
}

async function createImageAssetRecord(db, asset) {
  const [result] = await db.query(
    `INSERT INTO image_assets (display_name, stored_name, url, mime_type, size_bytes, source_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      asset.displayName,
      asset.storedName,
      asset.url,
      asset.mimeType,
      Number(asset.sizeBytes || 0),
      asset.sourceUrl || null,
    ],
  );

  return {
    id: result.insertId,
    name: asset.displayName,
    storedName: asset.storedName,
    url: asset.url,
    mimeType: asset.mimeType,
    sizeBytes: Number(asset.sizeBytes || 0),
  };
}

export async function uploadImageAsset({ name, dataUrl }) {
  const db = await getPool();
  const saved = await saveDataUrlImage(dataUrl, name);
  await createImageAssetRecord(db, saved);
  return getImageAssets();
}

export async function uploadBinaryImageAsset({ name, mimeType, buffer }) {
  const db = await getPool();
  const saved = await saveBinaryImage(buffer, mimeType, name);
  await createImageAssetRecord(db, saved);
  return getImageAssets();
}

export async function renameImageAsset(id, name) {
  const db = await getPool();
  await db.query(`UPDATE image_assets SET display_name = ? WHERE id = ?`, [
    sanitizeDisplayName(name),
    id,
  ]);
  return getImageAssets();
}

async function findImageAssetBySourceUrl(db, sourceUrl) {
  const [rows] = await db.query(
    `SELECT id, display_name, stored_name, url, mime_type, size_bytes
     FROM image_assets WHERE source_url = ? LIMIT 1`,
    [sourceUrl],
  );
  return rows[0] || null;
}

async function importRemoteImageAsset(db, sourceUrl) {
  const existing = await findImageAssetBySourceUrl(db, sourceUrl);
  if (existing) {
    return {
      id: existing.id,
      name: existing.display_name,
      storedName: existing.stored_name,
      url: existing.url,
      mimeType: existing.mime_type,
      sizeBytes: Number(existing.size_bytes || 0),
    };
  }

  const downloaded = await downloadRemoteImage(sourceUrl, inferImageNameFromUrl(sourceUrl));
  return createImageAssetRecord(db, { ...downloaded, sourceUrl });
}

export async function importRemoteImagesIntoLibrary() {
  const db = await getPool();
  const remoteUrls = new Set([
    ...collectRemoteImageUrls(seedContent.siteSettings),
    ...seedContent.pages.flatMap((page) => [...collectRemoteImageUrls(page.content)]),
    ...seedContent.services.flatMap((service) => [...collectRemoteImageUrls(service)]),
  ]);

  const currentSettings = await getSiteSettings();
  const currentPages = await getAllPages();
  const currentServices = await getAllServicesWithItems();

  collectRemoteImageUrls(currentSettings).forEach((url) => remoteUrls.add(url));
  currentPages.forEach((page) => collectRemoteImageUrls(page.content).forEach((url) => remoteUrls.add(url)));
  currentServices.forEach((service) => collectRemoteImageUrls(service).forEach((url) => remoteUrls.add(url)));

  const urlMap = new Map();
  for (const url of remoteUrls) {
    try {
      const asset = await importRemoteImageAsset(db, url);
      urlMap.set(url, asset.url);
    } catch (error) {
      console.warn(`Skipping image import for ${url}`, error instanceof Error ? error.message : error);
    }
  }

  if (!urlMap.size) {
    return getImageAssets();
  }

  const nextSettings = replaceRemoteImageUrls(currentSettings, urlMap);
  await updateSiteSettings(nextSettings);

  for (const page of currentPages) {
    const nextContent = replaceRemoteImageUrls(page.content, urlMap);
    await updatePage(page.slug, { ...page, content: nextContent });
  }

  for (const service of currentServices) {
    const nextService = replaceRemoteImageUrls(service, urlMap);
    await updateService(service.id, nextService);
  }

  return getImageAssets();
}
