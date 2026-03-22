import type { ServiceDetail, SiteSettings } from "./api";

const DEFAULT_SITE_NAME = "CIOS Cleaning & Detailing";
const DEFAULT_DESCRIPTION =
  "Professional cleaning services for commercial facilities, homes, and vehicles with quality you can trust.";
const DEFAULT_IMAGE_PATH = "/ciosdark.svg";
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function getBusinessName(settings?: SiteSettings | null) {
  return collapseWhitespace(settings?.business?.name || DEFAULT_SITE_NAME);
}

export function trimSeoDescription(value?: string | null, fallback = DEFAULT_DESCRIPTION) {
  const candidate = collapseWhitespace(value || fallback);
  if (candidate.length <= 160) {
    return candidate;
  }
  return `${candidate.slice(0, 157).trimEnd()}...`;
}

export function buildPageTitle(section: string, settings?: SiteSettings | null) {
  const siteName = getBusinessName(settings);
  const cleanedSection = collapseWhitespace(section);
  return cleanedSection ? `${cleanedSection} | ${siteName}` : siteName;
}

export function resolveSeoUrl(pathname = "/", origin = window.location.origin) {
  if (/^https?:\/\//i.test(pathname)) {
    return pathname;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin.replace(/\/$/, "")}${normalizedPath === "/" ? "/" : normalizedPath}`;
}

export function resolveSeoImage(image?: string | null, origin = window.location.origin) {
  if (image && /^https?:\/\//i.test(image)) {
    return image;
  }

  return resolveSeoUrl(image || DEFAULT_IMAGE_PATH, origin);
}

function setMetaContent(id: string, content: string) {
  const element = document.getElementById(id);
  if (element instanceof HTMLMetaElement) {
    element.setAttribute("content", content);
  }
}

function setLinkHref(id: string, href: string) {
  const element = document.getElementById(id);
  if (element instanceof HTMLLinkElement) {
    element.href = href;
  }
}

function setImagePreload(href?: string | null) {
  const existing = document.getElementById("preload-image");
  if (!href) {
    existing?.remove();
    return;
  }

  const link =
    existing instanceof HTMLLinkElement ? existing : document.createElement("link");
  link.id = "preload-image";
  link.rel = "preload";
  link.as = "image";
  link.href = href;

  if (!(existing instanceof HTMLLinkElement)) {
    document.head.appendChild(link);
  }
}

function setStructuredData(data?: StructuredData | null) {
  const element = document.getElementById("seo-structured-data");
  if (!(element instanceof HTMLScriptElement)) {
    return;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    element.textContent = "{}";
    return;
  }

  const payload = Array.isArray(data) ? data : [data];
  element.textContent = JSON.stringify(payload.length === 1 ? payload[0] : payload);
}

export function applySeoTags({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
  structuredData,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: string;
  noIndex?: boolean;
  structuredData?: StructuredData | null;
}) {
  const canonicalUrl = resolveSeoUrl(path);
  const imageUrl = resolveSeoImage(image);
  const preloadImageUrl = image ? imageUrl : null;
  const robots = noIndex ? "noindex, nofollow" : DEFAULT_ROBOTS;

  document.title = title;
  const titleElement = document.getElementById("meta-title");
  if (titleElement) {
    titleElement.textContent = title;
  }

  setMetaContent("meta-description", description);
  setMetaContent("meta-og-title", title);
  setMetaContent("meta-og-description", description);
  setMetaContent("meta-og-image", imageUrl);
  setMetaContent("meta-og-url", canonicalUrl);
  setMetaContent("meta-og-type", type);
  setMetaContent("meta-twitter-title", title);
  setMetaContent("meta-twitter-description", description);
  setMetaContent("meta-twitter-image", imageUrl);
  setMetaContent("meta-twitter-url", canonicalUrl);
  setMetaContent("meta-robots", robots);
  setLinkHref("canonical-link", canonicalUrl);
  setImagePreload(preloadImageUrl);
  setStructuredData(structuredData);
}

export function createLocalBusinessStructuredData(settings?: SiteSettings | null, path = "/") {
  const business = settings?.business;
  const addressLines = business?.addressLines?.filter(Boolean) || [];

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: getBusinessName(settings),
    description: trimSeoDescription(business?.shortDescription || DEFAULT_DESCRIPTION),
    url: resolveSeoUrl(path),
    image: resolveSeoImage(DEFAULT_IMAGE_PATH),
    telephone: business?.phoneDisplay || undefined,
    email: business?.email || undefined,
    address: addressLines.length
      ? {
          "@type": "PostalAddress",
          streetAddress: addressLines.join(", "),
          addressCountry: addressLines[addressLines.length - 1] || "Australia",
        }
      : undefined,
    areaServed: business?.locationLabel || "Melbourne, Victoria",
    openingHours: business?.hours?.filter(Boolean) || undefined,
    sameAs: business?.linkedinUrl ? [business.linkedinUrl] : undefined,
  };
}

export function createFaqStructuredData(faqs?: Array<{ q?: string; a?: string }> | null) {
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

export function createServiceStructuredData(
  service?: ServiceDetail | null,
  settings?: SiteSettings | null,
  path = "/services",
) {
  if (!service) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: trimSeoDescription(service.description),
    serviceType: service.label || service.title,
    category: service.isEcoFriendly ? "Eco-friendly cleaning service" : "Cleaning service",
    url: resolveSeoUrl(path),
    image: resolveSeoImage(service.heroImage || service.image),
    provider: {
      "@type": "LocalBusiness",
      name: getBusinessName(settings),
      telephone: settings?.business?.phoneDisplay || undefined,
      email: settings?.business?.email || undefined,
    },
    areaServed: settings?.business?.locationLabel || "Melbourne, Victoria",
  };
}
