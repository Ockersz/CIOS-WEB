import fs from "node:fs/promises";
import { getPageBySlug, getServiceById, getServices, getSiteSettings } from "./db.js";

const SITE_URL = (process.env.SITE_URL || "https://www.cios.com.au").replace(/\/$/, "");
const DEFAULT_SITE_NAME = "CIOS Cleaning & Detailing";
const DEFAULT_DESCRIPTION =
  "Professional cleaning services for commercial facilities, homes, and vehicles with quality you can trust.";
const DEFAULT_IMAGE_PATH = "/ciosdark.svg";
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";

function collapseWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function trimDescription(value, fallback = DEFAULT_DESCRIPTION) {
  const candidate = collapseWhitespace(value || fallback);
  if (candidate.length <= 160) {
    return candidate;
  }
  return `${candidate.slice(0, 157).trimEnd()}...`;
}

function getBusinessName(settings) {
  return collapseWhitespace(settings?.business?.name || DEFAULT_SITE_NAME);
}

function resolveUrl(pathname = "/") {
  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}`;
}

function resolveImage(image) {
  if (image && /^https?:\/\//i.test(image)) {
    return image;
  }
  return resolveUrl(image || DEFAULT_IMAGE_PATH);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function createLocalBusinessStructuredData(settings, pathName = "/") {
  const business = settings?.business || {};
  const addressLines = (business.addressLines || []).filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: getBusinessName(settings),
    description: trimDescription(business.shortDescription),
    url: resolveUrl(pathName),
    image: resolveImage(),
    telephone: business.phoneDisplay || undefined,
    email: business.email || undefined,
    address: addressLines.length
      ? {
          "@type": "PostalAddress",
          streetAddress: addressLines.join(", "),
          addressCountry: addressLines[addressLines.length - 1] || "Australia",
        }
      : undefined,
    areaServed: business.locationLabel || "Melbourne, Victoria",
    openingHours: (business.hours || []).filter(Boolean),
    sameAs: business.linkedinUrl ? [business.linkedinUrl] : undefined,
  };
}

function createFaqStructuredData(faqs) {
  const mainEntity = (faqs || [])
    .filter((faq) => faq?.q && faq?.a)
    .map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    }));

  if (mainEntity.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

function createServiceStructuredData(service, settings, pathName) {
  if (!service) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: trimDescription(service.description),
    serviceType: service.label || service.title,
    category: service.isEcoFriendly ? "Eco-friendly cleaning service" : "Cleaning service",
    url: resolveUrl(pathName),
    image: resolveImage(service.heroImage || service.image),
    provider: {
      "@type": "LocalBusiness",
      name: getBusinessName(settings),
      telephone: settings?.business?.phoneDisplay || undefined,
      email: settings?.business?.email || undefined,
    },
    areaServed: settings?.business?.locationLabel || "Melbourne, Victoria",
  };
}

function createTitle(section, settings) {
  const siteName = getBusinessName(settings);
  const cleanedSection = collapseWhitespace(section);
  return cleanedSection ? `${cleanedSection} | ${siteName}` : siteName;
}

function buildSeoPayload({
  settings,
  pathName,
  title,
  description,
  image,
  type = "website",
  noIndex = false,
  structuredData,
}) {
  return {
    title,
    description: trimDescription(description, settings?.business?.shortDescription || DEFAULT_DESCRIPTION),
    canonicalUrl: resolveUrl(pathName),
    image: resolveImage(image),
    type,
    robots: noIndex ? "noindex, nofollow" : DEFAULT_ROBOTS,
    structuredData,
  };
}

export async function getSeoPayloadForPath(pathName) {
  const settings = await getSiteSettings();
  const normalizedPath = pathName === "/" ? "/" : pathName.replace(/\/$/, "");

  if (normalizedPath === "/admin") {
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Admin", settings),
      description: "Website administration portal.",
      noIndex: true,
    });
  }

  if (normalizedPath === "/") {
    const page = await getPageBySlug("home");
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Professional Cleaning Services in Dandenong", settings),
      description: page?.heroSubtitle || settings?.business?.shortDescription,
      image: page?.content?.heroImage,
      structuredData: createLocalBusinessStructuredData(settings, normalizedPath),
    });
  }

  if (normalizedPath === "/about") {
    const page = await getPageBySlug("about");
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("About", settings),
      description: page?.heroDescription || page?.heroSubtitle || settings?.business?.shortDescription,
    });
  }

  if (normalizedPath === "/services") {
    const page = await getPageBySlug("services");
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Cleaning Services", settings),
      description: page?.heroSubtitle || page?.heroDescription || settings?.business?.shortDescription,
    });
  }

  if (normalizedPath.startsWith("/services/")) {
    const serviceId = normalizedPath.slice("/services/".length);
    const service = serviceId ? await getServiceById(serviceId) : null;

    if (!service) {
      return buildSeoPayload({
        settings,
        pathName: normalizedPath,
        title: createTitle("Service Not Found", settings),
        description: settings?.business?.shortDescription,
        noIndex: true,
      });
    }

    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle(service.title, settings),
      description: service.description,
      image: service.heroImage || service.image,
      structuredData: createServiceStructuredData(service, settings, normalizedPath),
    });
  }

  if (normalizedPath === "/blog") {
    const page = await getPageBySlug("blog");
    if (page?.content?.isVisible === false) {
      return { redirectTo: "/" };
    }

    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Blog", settings),
      description: page?.heroSubtitle || settings?.business?.shortDescription,
    });
  }

  if (normalizedPath === "/contact") {
    const page = await getPageBySlug("contact");
    const faqStructuredData = createFaqStructuredData(page?.content?.faqs);
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Contact", settings),
      description: page?.heroSubtitle || settings?.business?.shortDescription,
      structuredData: faqStructuredData
        ? [createLocalBusinessStructuredData(settings, normalizedPath), faqStructuredData]
        : createLocalBusinessStructuredData(settings, normalizedPath),
    });
  }

  if (normalizedPath === "/join-team") {
    const page = await getPageBySlug("join-team");
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Careers", settings),
      description: page?.heroSubtitle || settings?.business?.shortDescription,
    });
  }

  if (normalizedPath === "/get-quote") {
    const page = await getPageBySlug("get-quote");
    return buildSeoPayload({
      settings,
      pathName: normalizedPath,
      title: createTitle("Get a Free Quote", settings),
      description: page?.heroSubtitle || settings?.business?.shortDescription,
    });
  }

  return buildSeoPayload({
    settings,
    pathName: normalizedPath,
    title: createTitle("", settings),
    description: settings?.business?.shortDescription,
    noIndex: true,
  });
}

export async function renderSeoHtml(indexHtmlPath, pathName) {
  const template = await fs.readFile(indexHtmlPath, "utf8");
  const seo = await getSeoPayloadForPath(pathName);

  if (seo.redirectTo) {
    return seo;
  }

  const structuredData = seo.structuredData ? escapeJsonLd(seo.structuredData) : "{}";

  return {
    html: template
      .replace(/<title id="meta-title">.*?<\/title>/s, `<title id="meta-title">${escapeHtml(seo.title)}</title>`)
      .replace(/<meta id="meta-description" name="description" content=".*?" \/>/s, `<meta id="meta-description" name="description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta id="meta-og-title" property="og:title" content=".*?" \/>/s, `<meta id="meta-og-title" property="og:title" content="${escapeHtml(seo.title)}" />`)
      .replace(/<meta id="meta-og-description" property="og:description" content=".*?" \/>/s, `<meta id="meta-og-description" property="og:description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta id="meta-og-image" property="og:image" content=".*?" \/>/s, `<meta id="meta-og-image" property="og:image" content="${escapeHtml(seo.image)}" />`)
      .replace(/<meta id="meta-og-type" property="og:type" content=".*?" \/>/s, `<meta id="meta-og-type" property="og:type" content="${escapeHtml(seo.type)}" />`)
      .replace(/<meta id="meta-og-url" property="og:url" content=".*?" \/>/s, `<meta id="meta-og-url" property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />`)
      .replace(/<meta id="meta-twitter-title" name="twitter:title" content=".*?" \/>/s, `<meta id="meta-twitter-title" name="twitter:title" content="${escapeHtml(seo.title)}" />`)
      .replace(/<meta id="meta-twitter-description" name="twitter:description" content=".*?" \/>/s, `<meta id="meta-twitter-description" name="twitter:description" content="${escapeHtml(seo.description)}" />`)
      .replace(/<meta id="meta-twitter-image" name="twitter:image" content=".*?" \/>/s, `<meta id="meta-twitter-image" name="twitter:image" content="${escapeHtml(seo.image)}" />`)
      .replace(/<meta id="meta-twitter-url" name="twitter:url" content=".*?" \/>/s, `<meta id="meta-twitter-url" name="twitter:url" content="${escapeHtml(seo.canonicalUrl)}" />`)
      .replace(/<meta id="meta-robots" name="robots" content=".*?" \/>/s, `<meta id="meta-robots" name="robots" content="${escapeHtml(seo.robots)}" />`)
      .replace(/<link id="canonical-link" rel="canonical" href=".*?" \/>/s, `<link id="canonical-link" rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`)
      .replace(/<script id="seo-structured-data" type="application\/ld\+json">.*?<\/script>/s, `<script id="seo-structured-data" type="application/ld+json">${structuredData}</script>`),
  };
}

export function buildRobotsTxt() {
  return `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createSitemapUrl(pathName, lastmod) {
  return `<url><loc>${escapeXml(resolveUrl(pathName))}</loc><lastmod>${lastmod}</lastmod></url>`;
}

export async function buildSitemapXml() {
  const [services, blogPage] = await Promise.all([getServices(), getPageBySlug("blog")]);
  const lastmod = new Date().toISOString().slice(0, 10);
  const publicPaths = ["/", "/about", "/services", "/contact", "/join-team", "/get-quote"];

  if (blogPage?.content?.isVisible !== false) {
    publicPaths.push("/blog");
  }

  const urls = [...publicPaths, ...services.map((service) => `/services/${service.id}`)].map((pathName) =>
    createSitemapUrl(pathName, lastmod),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}
