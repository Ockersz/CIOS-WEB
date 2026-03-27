import { lazy, Suspense, useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CircleDot,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  LoaderCircle,
  Palette,
  Settings2,
  ShieldCheck,
  SquareStack,
} from "lucide-react";
import {
  AdminBootstrap,
  BlogPost,
  CmsPage,
  ImageAsset,
  ImageAssetUsage,
  SiteSettings,
  ServiceDetail,
  adminLogin,
  adminLogout,
  changeAdminPassword,
  createAdminBlogPost,
  createAdminService,
  deleteAdminImage,
  deleteAdminBlogPost,
  deleteAdminService,
  exportAdminBackup,
  getAdminBootstrap,
  getAdminImageUsage,
  importAdminBackup,
  importExistingAdminImages,
  renameAdminImage,
  reorderAdminBlogPosts,
  reorderAdminServices,
  saveAdminBlogPost,
  saveAdminPage,
  saveAdminService,
  saveAdminSettings,
  uploadAdminImage,
} from "../../lib/api";
import { normalizeHomeBeforeAfterSection } from "../../lib/homeContent";
import { applyThemeColors, getThemeColors, TYPOGRAPHY_PRESETS } from "../../lib/theme";
import { CmsIcon } from "../CmsIcon";

const TOKEN_KEY = "cios_admin_token";
const HEX_COLOR_PATTERN = /^#([0-9a-f]{6})$/i;

type AdminSection = "global" | "styles" | "pages" | "services" | "blog" | "images" | "backups" | "password";
type GlobalPanel = "business" | "contact" | "trust" | "footer";

type PreviewLink = {
  label: string;
  path?: string;
  disabledReason?: string;
};

type WorkspaceGuide = {
  title: string;
  description: string;
  hints: string[];
  links: PreviewLink[];
  note?: string;
};

type ImageDeleteDialogState = {
  asset: ImageAsset;
  usages: ImageAssetUsage[];
  loading: boolean;
  deleting: boolean;
  selectedReplacementId: number | null;
  error: string | null;
};

const ADMIN_SECTION_META: Record<
  AdminSection,
  {
    title: string;
    description: string;
    shortLabel: string;
  }
> = {
  global: {
    title: "Site Settings",
    shortLabel: "Site Settings",
    description: "Update the business details, contact info, trust signals, and footer content used throughout the website.",
  },
  styles: {
    title: "Styles",
    shortLabel: "Styles",
    description: "Choose the site colors and typography without touching code. Helper shades are generated automatically.",
  },
  pages: {
    title: "Page Content",
    shortLabel: "Pages",
    description: "Edit the main content blocks for the core website pages in plain language.",
  },
  services: {
    title: "Services",
    shortLabel: "Services",
    description: "Add, reorder, and update service pages along with their images and detailed points.",
  },
  blog: {
    title: "Blog Posts",
    shortLabel: "Blog",
    description: "Manage the blog cards shown on the website, including ordering and visibility details.",
  },
  images: {
    title: "Image Library",
    shortLabel: "Images",
    description: "Upload, rename, and reuse website images from one central media library.",
  },
  backups: {
    title: "Backups",
    shortLabel: "Backups",
    description: "Export or restore a full site backup, including uploaded images and CMS data.",
  },
  password: {
    title: "Security",
    shortLabel: "Password",
    description: "Update the admin password used to sign in to this CMS.",
  },
};

const ADMIN_NAV_GROUPS: Array<{
  title: string;
  icon: typeof Settings2;
  items: AdminSection[];
}> = [
  {
    title: "Website Setup",
    icon: Settings2,
    items: ["global", "styles"],
  },
  {
    title: "Website Content",
    icon: LayoutGrid,
    items: ["pages", "services", "blog"],
  },
  {
    title: "Library & Security",
    icon: ShieldCheck,
    items: ["images", "backups", "password"],
  },
];

const GLOBAL_PANEL_META: Record<
  GlobalPanel,
  {
    label: string;
    description: string;
  }
> = {
  business: {
    label: "Business Info",
    description: "Name, phone, email, and the short business summary used across the site.",
  },
  contact: {
    label: "Contact Details",
    description: "Address lines, opening hours, and contact cards shown on the contact page.",
  },
  trust: {
    label: "Clients & Trust",
    description: "Client logos, accreditations, and compliance content that builds credibility.",
  },
  footer: {
    label: "Footer",
    description: "Short service names shown in the footer area.",
  },
};

const PAGE_PUBLIC_PATHS: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  blog: "/blog",
  contact: "/contact",
  "get-quote": "/get-quote",
  "join-team": "/join-team",
};

const LazyAdminIconPickerModalContent = lazy(() =>
  import("./AdminIconPickerModal").then((module) => ({ default: module.AdminIconPickerModalContent })),
);

function normalizeAdminSettings(settings: SiteSettings): SiteSettings {
  const theme = getThemeColors(settings?.styles);

  return {
    ...settings,
    styles: {
      brandBrown: theme.brandBrown,
      brandAccent: theme.brandAccent,
      brandCanvas: theme.brandCanvas,
      brandSurface: theme.brandSurface,
      typographyPreset: theme.typographyPreset,
      ecoGreen: settings.styles?.ecoGreen || "",
      footerBackground: settings.styles?.footerBackground || "",
      heroOverlay: settings.styles?.heroOverlay || "",
    },
    clients: {
      ...settings.clients,
      items: normalizeClientItems(settings.clients?.items),
    },
    contactCards: (settings.contactCards || []).map((card) => ({
      icon: card.icon || "MapPin",
      title: card.title || "",
      details: card.details || [],
    })),
  };
}

function normalizeClientItems(
  items: Array<string | { name?: string; logo?: string }> | undefined,
) {
  return (items || []).map((item) =>
    typeof item === "string" ? { name: item, logo: "" } : { name: item?.name || "", logo: item?.logo || "" },
  );
}

function toLinkName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-[var(--brand-surface)] rounded-3xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--brand-border)] bg-[var(--brand-surface-soft)]/55">
        <h3 className="text-xl mb-1">{title}</h3>
        {description ? <p className="text-sm text-[var(--brand-text-muted)]">{description}</p> : null}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SectionIntro({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="eyebrow-label text-[var(--brand-text-soft)] mb-2">Admin Workspace</div>
          <h2 className="section-title text-3xl text-[var(--brand-text)] mb-2">{title}</h2>
          <p className="body-copy text-sm text-[var(--brand-text-muted)]">{description}</p>
        </div>
        {accent ? <div className="shrink-0">{accent}</div> : null}
      </div>
    </div>
  );
}

function SegmentedTabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (value: T) => void;
  items: Array<{ value: T; label: string; description?: string }>;
}) {
  return (
    <div className="rounded-[28px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-2">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`rounded-2xl px-4 py-4 text-left transition-colors ${
                active
                  ? "bg-[var(--brand-brown)] text-white shadow-sm"
                  : "bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-secondary-fill-hover)]"
              }`}
            >
              <div className="font-semibold">{item.label}</div>
              {item.description ? (
                <div className={`mt-1 text-sm ${active ? "text-white/80" : "text-[var(--brand-text-muted)]"}`}>
                  {item.description}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectionPanel({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="bg-[var(--brand-surface)] rounded-3xl border border-[var(--brand-border)] shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--brand-border)] bg-[var(--brand-surface-soft)]/55">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold">{title}</div>
            <div className="text-sm text-[var(--brand-text-muted)] mt-1">{description}</div>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function WorkspaceGuideCard({
  title,
  description,
  hints,
  links,
  note,
}: WorkspaceGuide) {
  const previewableLinks = links.filter((link) => Boolean(link.path) && !link.disabledReason);
  const [inlinePreviewPath, setInlinePreviewPath] = useState<string | null>(null);
  const activePreviewPath = inlinePreviewPath || previewableLinks[0]?.path || null;

  return (
    <SectionCard title={title} description={description}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)]/65 px-4 py-4 lg:max-w-md">
          <div className="eyebrow-label text-[var(--brand-text-soft)] mb-2">Where This Appears</div>
          <div className="space-y-2">
            {hints.map((hint) => (
              <div key={hint} className="text-sm text-[var(--brand-text-muted)]">
                {hint}
              </div>
            ))}
          </div>
          {note ? (
            <div className="mt-4 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-sm text-[var(--brand-text-muted)]">
              {note}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-3 lg:min-w-[280px]">
          {links.map((link) =>
            link.path ? (
              <button
                key={`${link.label}-${link.path}`}
                type="button"
                onClick={() => window.open(link.path, "_blank", "noopener,noreferrer")}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-left hover:bg-[var(--brand-secondary-fill-hover)]"
              >
                <div>
                  <div className="font-semibold text-[var(--brand-text)]">{link.label}</div>
                  <div className="mt-1 text-sm text-[var(--brand-text-muted)]">{link.path}</div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <div
                key={`${link.label}-disabled`}
                className="rounded-2xl border border-dashed border-[var(--brand-border-strong)] bg-[var(--brand-surface)] px-4 py-3"
              >
                <div className="font-semibold text-[var(--brand-text)]">{link.label}</div>
                <div className="mt-1 text-sm text-[var(--brand-text-muted)]">{link.disabledReason}</div>
              </div>
            ),
          )}

          {activePreviewPath ? (
            <button
              type="button"
              onClick={() => setInlinePreviewPath((current) => (current ? null : activePreviewPath))}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-brown)] px-4 py-3 text-white"
            >
              {inlinePreviewPath ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {inlinePreviewPath ? "Hide Inline Preview" : "Show Inline Preview"}
            </button>
          ) : null}
        </div>
      </div>

      {inlinePreviewPath ? (
        <div className="mt-6 overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--brand-border)] bg-[var(--brand-surface-soft)]/65 px-4 py-3">
            <div>
              <div className="font-semibold text-[var(--brand-text)]">Saved Public Page Preview</div>
              <div className="text-sm text-[var(--brand-text-muted)]">{inlinePreviewPath}</div>
            </div>
            <button
              type="button"
              onClick={() => window.open(inlinePreviewPath, "_blank", "noopener,noreferrer")}
              className="rounded-xl bg-[var(--brand-secondary-fill)] px-4 py-2 text-sm text-[var(--brand-text)]"
            >
              Open Full Page
            </button>
          </div>
          <iframe
            src={inlinePreviewPath}
            title={`${title} preview`}
            loading="lazy"
            className="h-[720px] w-full bg-white"
          />
        </div>
      ) : null}
    </SectionCard>
  );
}

function CollapsibleEditorCard({
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  title: string;
  summary?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="font-semibold text-[var(--brand-text)]">{title}</div>
          {summary ? <div className="mt-1 text-sm text-[var(--brand-text-muted)]">{summary}</div> : null}
        </div>
        <ChevronDown className={`mt-0.5 h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="border-t border-[var(--brand-border)] px-4 py-4 space-y-3">{children}</div> : null}
    </div>
  );
}

function getEditorSummary(
  values: Array<string | number | null | undefined>,
  fallback: string,
) {
  const firstValue = values
    .map((value) => `${value ?? ""}`.trim())
    .find((value) => Boolean(value));

  if (!firstValue) return fallback;
  return firstValue.length > 96 ? `${firstValue.slice(0, 93)}...` : firstValue;
}

function normalizeComparableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeComparableValue(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .reduce<Record<string, unknown>>((result, [key, entryValue]) => {
        result[key] = normalizeComparableValue(entryValue);
        return result;
      }, {});
  }

  return value;
}

function stableSerialize(value: unknown) {
  return JSON.stringify(normalizeComparableValue(value));
}

function stripStylesFromSettings(settings: SiteSettings) {
  const normalizedSettings = normalizeAdminSettings(settings);
  const { styles, ...siteSettings } = normalizedSettings;
  return siteSettings;
}

function getPageEditorDescription(slug: string) {
  const descriptions: Record<string, string> = {
    home: "Update the homepage hero, stats, testimonials, and careers preview blocks.",
    about: "Edit the company story, values, proof points, and call-to-action sections.",
    services: "Control the services page header, highlight badges, and final call-to-action.",
    blog: "Show or hide the blog page and the homepage blog preview section.",
    contact: "Manage the contact page header, map section, and FAQ answers.",
    "get-quote": "Edit the quote page intro, form options, and the next-step explainer.",
    "join-team": "Update the careers page header, benefits, perks, and job options.",
  };

  return descriptions[slug] || "Edit the content blocks shown on this website page.";
}

function getPageEditorHints(slug: string) {
  const hints: Record<string, string[]> = {
    home: [
      "Hero text appears at the top of the homepage.",
      "Stats, testimonials, and careers content appear further down the same page.",
      "Use the homepage preview to check image balance and section spacing together.",
    ],
    about: [
      "Story, values, and reasons blocks all appear on the About page.",
      "This page is best reviewed on desktop and mobile after saving.",
      "Long paragraphs and cards here affect readability more than any other page.",
    ],
    services: [
      "The top hero and highlight badges appear on the Services page.",
      "Service cards themselves are edited in the Services section, not here.",
      "The final call-to-action is near the bottom of the public Services page.",
    ],
    blog: [
      "This page controls blog visibility and the main blog page header.",
      "Turning blog visibility off also removes the homepage blog preview section.",
      "Use the homepage and blog page preview links to check both locations.",
    ],
    contact: [
      "Map heading appears in the middle of the Contact page.",
      "FAQs appear near the bottom of the Contact page.",
      "Shared contact cards are edited under Site Settings, not here.",
    ],
    "get-quote": [
      "Quote features and service options appear above the enquiry form.",
      "The next-steps list appears after the form to explain the process.",
      "Use the public quote page to check form wording and list order.",
    ],
    "join-team": [
      "Benefits cards appear near the top of the Careers page.",
      "Perks and job options help shape the application form experience.",
      "Preview the public Careers page to check whether the page still feels inviting.",
    ],
  };

  return hints[slug] || ["Use the public page preview to confirm how these saved changes look on the website."];
}

function buildWorkspaceGuide({
  section,
  globalPanel,
  selectedPage,
  selectedService,
  selectedPost,
  isNewService,
  isNewPost,
}: {
  section: AdminSection;
  globalPanel: GlobalPanel;
  selectedPage: CmsPage<any> | null;
  selectedService: ServiceDetail | null;
  selectedPost: (BlogPost & { sortOrder: number }) | null;
  isNewService: boolean;
  isNewPost: boolean;
}): WorkspaceGuide | null {
  if (section === "global") {
    if (globalPanel === "business") {
      return {
        title: "Website Guide",
        description: "These details are reused across the public site, so it helps to know where they surface.",
        hints: [
          "Business name, phone, and location show in the main navigation and footer contact areas.",
          "Short business description also feeds SEO and shared brand messaging.",
          "This is site-wide data, so one change can affect several pages at once.",
        ],
        links: [
          { label: "Open Homepage", path: "/" },
          { label: "Open Contact Page", path: "/contact" },
        ],
        note: "The inline preview shows saved website content. Unsaved changes appear there after you save.",
      };
    }

    if (globalPanel === "contact") {
      return {
        title: "Contact Info Guide",
        description: "Use this area when the public contact details or support cards need updating.",
        hints: [
          "Contact cards appear near the top of the Contact page.",
          "Address lines and hours also feed the navigation and footer contact areas.",
          "This is the best place to update operational details without touching page copy.",
        ],
        links: [
          { label: "Open Contact Page", path: "/contact" },
          { label: "Open Homepage", path: "/" },
        ],
        note: "Check both pages after saving because shared business details appear in more than one place.",
      };
    }

    if (globalPanel === "trust") {
      return {
        title: "Trust Content Guide",
        description: "Clients and accreditation groups mainly support your credibility blocks on the public site.",
        hints: [
          "Client logos and accreditation content appear in the homepage trust area.",
          "Short names and icons matter because these cards are scanned quickly.",
          "After saving, check the homepage for spacing and logo consistency.",
        ],
        links: [{ label: "Open Homepage", path: "/" }],
        note: "If a logo feels too small or awkward, it is usually worth checking the homepage preview immediately.",
      };
    }

    return {
      title: "Footer Guide",
      description: "Footer service names are lightweight support links shown on every public page.",
      hints: [
        "This list appears in the footer site-wide, not on the main Services page grid.",
        "Keep names short so the footer stays tidy on smaller screens.",
        "Check any public page after saving to confirm the footer still reads cleanly.",
      ],
      links: [
        { label: "Open Homepage", path: "/" },
        { label: "Open Contact Page", path: "/contact" },
      ],
      note: "Footer edits are global, so they will affect every public route.",
    };
  }

  if (section === "styles") {
    return {
      title: "Style Preview Guide",
      description: "Colors and typography affect the whole brand system across the site and this CMS.",
      hints: [
        "Homepage previews are best for checking hero contrast and button visibility.",
        "An inner page helps confirm body text, spacing, and card surfaces.",
        "The admin panel itself updates too, so you can judge whether the theme still feels professional.",
      ],
      links: [
        { label: "Open Homepage", path: "/" },
        { label: "Open About Page", path: "/about" },
      ],
      note: "Save styles first, then use the preview links to confirm contrast and readability on real pages.",
    };
  }

  if (section === "pages" && selectedPage) {
    const pagePath = PAGE_PUBLIC_PATHS[selectedPage.slug] || "/";
    const pageLinks: PreviewLink[] = [{ label: "Open Public Page", path: pagePath }];

    if (selectedPage.slug === "blog") {
      pageLinks.push({ label: "Open Homepage Blog Area", path: "/" });
    }

    return {
      title: `${getPageTitle(selectedPage.slug)} Guide`,
      description: getPageEditorDescription(selectedPage.slug),
      hints: getPageEditorHints(selectedPage.slug),
      links: pageLinks,
      note: "The preview shows saved public content only, so use the save button first when checking fresh edits.",
    };
  }

  if (section === "services" && selectedService) {
    return {
      title: "Service Page Guide",
      description: "A service edit can affect the services listing, the service detail page, and the homepage selector.",
      hints: [
        "Preview image, short title, and summary show on the /services grid.",
        "Hero image, detail image, and service detail items appear on the service detail page.",
        "The homepage toggle controls whether this service appears in the landing-page selector.",
      ],
      links: [
        isNewService
          ? {
              label: "Open Service Detail Page",
              disabledReason: "Save this new service first to preview its public detail page.",
            }
          : { label: "Open Service Detail Page", path: `/services/${selectedService.id}` },
        { label: "Open Services Page", path: "/services" },
        { label: "Open Homepage Selector", path: "/" },
      ],
      note: "For existing services, it is worth checking both the card view and the detail page after saving.",
    };
  }

  if (section === "blog" && selectedPost) {
    return {
      title: "Blog Listing Guide",
      description: "Each blog editor item controls one card on the blog page and, when enabled, the homepage blog preview.",
      hints: [
        "Title, category, date, and excerpt appear as a blog card on the /blog page.",
        "The homepage shows only a smaller preview of the latest posts when blog visibility is on.",
        "Because there is no individual blog-post page yet, the listing page is the main public check.",
      ],
      links: [
        { label: "Open Blog Page", path: "/blog" },
        { label: "Open Homepage Blog Area", path: "/" },
      ],
      note: isNewPost
        ? "Save the new blog card first, then use the preview links to confirm the card layout on the website."
        : "After saving, check the blog page to confirm the card still reads clearly with the updated excerpt length.",
    };
  }

  return null;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm text-[var(--brand-text-muted)] mb-2">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)] disabled:opacity-60"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const normalizedValue = HEX_COLOR_PATTERN.test(value) ? value : "#000000";

  return (
    <label className="block">
      <div className="text-sm text-[var(--brand-text-muted)] mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizedValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-16 rounded-xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)] p-1 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
        />
      </div>
    </label>
  );
}

function OptionalColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const previewValue = HEX_COLOR_PATTERN.test(value) ? value : "#000000";

  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-sm text-[var(--brand-text-muted)]">{label}</div>
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs px-3 py-1 rounded-full bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]"
        >
          Use Derived
        </button>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={previewValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-16 rounded-xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)] p-1 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Leave blank to derive"
          className="flex-1 px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
        />
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm text-[var(--brand-text-muted)] mb-2">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)] resize-y"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-sm text-[var(--brand-text-muted)] mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function LineListEditor({
  title,
  description,
  items,
  onChange,
  addLabel,
}: {
  title: string;
  description?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
}) {
  function moveItem(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  }

  return (
    <SectionCard title={title} description={description}>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-3">
            <input
              value={item}
              onChange={(e) =>
                onChange(items.map((current, i) => (i === index ? e.target.value : current)))
              }
              className="flex-1 px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
            />
            <button
              type="button"
              onClick={() => moveItem(index, index - 1)}
              disabled={index === 0}
              className="px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)] disabled:opacity-50"
            >
              Up
            </button>
            <button
              type="button"
              onClick={() => moveItem(index, index + 1)}
              disabled={index === items.length - 1}
              className="px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)] disabled:opacity-50"
            >
              Down
            </button>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white"
      >
        {addLabel}
      </button>
    </SectionCard>
  );
}

function ContactCardsEditor({
  cards,
  onChange,
  openIconPicker,
}: {
  cards: SiteSettings["contactCards"];
  onChange: (cards: SiteSettings["contactCards"]) => void;
  openIconPicker: (title: string, currentValue: string, onSelect: (value: string) => void) => void;
}) {
  return (
    <SectionCard title="Contact Cards" description="Edit the cards shown at the top of the Contact Us page.">
      <div className="space-y-4">
        {cards.map((card, index) => (
          <CollapsibleEditorCard
            key={`contact-card-${index}`}
            title={card.title?.trim() || `Contact Card ${index + 1}`}
            summary={getEditorSummary(card.details || [], "Open to edit the lines shown inside this contact card.")}
            defaultOpen={index === 0}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IconPickerField
                label="Icon"
                value={card.icon || "MapPin"}
                onPick={() => {
                  openIconPicker("Choose contact card icon", card.icon || "MapPin", (value) => {
                    onChange(
                      cards.map((current, currentIndex) =>
                        currentIndex === index ? { ...current, icon: value } : current,
                      ),
                    );
                  });
                }}
              />
              <Field
                label="Card Title"
                value={card.title}
                onChange={(value) =>
                  onChange(
                    cards.map((current, currentIndex) =>
                      currentIndex === index ? { ...current, title: value } : current,
                    ),
                  )
                }
              />
            </div>
            <LineListEditor
              title={`Card Lines ${index + 1}`}
              description="Each line will be shown inside this contact card."
              items={card.details || []}
              onChange={(items) =>
                onChange(
                  cards.map((current, currentIndex) =>
                    currentIndex === index ? { ...current, details: items } : current,
                  ),
                )
              }
              addLabel="Add Card Line"
            />
            <button
              type="button"
              onClick={() => onChange(cards.filter((_, currentIndex) => currentIndex !== index))}
              className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]"
            >
              Remove Contact Card
            </button>
          </CollapsibleEditorCard>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          onChange([
            ...cards,
            {
              icon: "MapPin",
              title: "",
              details: [""],
            },
          ])
        }
        className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white"
      >
        Add Contact Card
      </button>
    </SectionCard>
  );
}

function formatBytes(value: number) {
  if (!value) return "0 KB";
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/45 px-4 py-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto bg-[var(--brand-surface)] rounded-3xl border border-[var(--brand-border)] shadow-2xl">
        <div className="sticky top-0 bg-[var(--brand-surface)] rounded-t-3xl border-b border-[var(--brand-border)] px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl">{title}</h3>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]">
            Close
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function IconPickerField({
  label,
  value,
  onPick,
}: {
  label: string;
  value: string;
  onPick: () => void;
}) {
  return (
    <button type="button" onClick={onPick} className="block text-left w-full">
      <div className="text-sm text-[var(--brand-text-muted)] mb-2">{label}</div>
      <div className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center">
          <CmsIcon name={value} fallback={CircleDot} className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium">{value || "Choose icon"}</div>
          <div className="text-sm text-[var(--brand-text-muted)]">Click to browse icons</div>
        </div>
      </div>
    </button>
  );
}

function ImagePickerField({
  label,
  value,
  onPick,
}: {
  label: string;
  value: string;
  onPick: () => void;
}) {
  return (
    <button type="button" onClick={onPick} className="block text-left w-full">
      <div className="text-sm text-[var(--brand-text-muted)] mb-2">{label}</div>
      <div className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)] flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--brand-surface)] border border-[var(--brand-border)] shrink-0">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[var(--brand-text-soft)]">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium">{value ? "Image selected" : "Choose image"}</div>
          <div className="text-sm text-[var(--brand-text-muted)] truncate">
            {value || "Open the image library or upload a new image"}
          </div>
        </div>
      </div>
    </button>
  );
}

function ImagePickerModalContent({
  assets,
  currentValue,
  onSelect,
  onUpload,
}: {
  assets?: ImageAsset[];
  currentValue: string;
  onSelect: (value: string) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const safeAssets = assets || [];
  const filteredAssets = safeAssets.filter((asset) =>
    `${asset.name} ${asset.storedName}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[260px]">
          <Field label="Search Images" value={search} onChange={setSearch} placeholder="Search image names" />
        </div>
        <label className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white cursor-pointer">
          Upload New Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = event.target.files?.[0];
              if (!file) return;
              try {
                await onUpload(file);
              } catch (error) {
                alert(error instanceof Error ? error.message : "Failed to upload image");
              } finally {
                input.value = "";
              }
            }}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full text-sm text-[var(--brand-text-muted)] px-1 py-4">
            No images yet. Upload one to add it to the library.
          </div>
        ) : null}
        {filteredAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset.url)}
            className={`rounded-2xl border p-3 text-left ${
              currentValue === asset.url ? "border-[var(--brand-brown)] bg-[var(--brand-canvas-soft)]" : "border-[var(--brand-border)] bg-[var(--brand-surface)]"
            }`}
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--brand-surface)] border border-[var(--brand-border)] mb-3">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-medium truncate">{asset.name}</div>
            <div className="text-sm text-[var(--brand-text-muted)]">{formatBytes(asset.sizeBytes)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function getImageUsageTypeLabel(resourceType: ImageAssetUsage["resourceType"]) {
  const labels: Record<ImageAssetUsage["resourceType"], string> = {
    settings: "Site Settings",
    page: "Page",
    service: "Service",
    blog: "Blog Post",
  };
  return labels[resourceType];
}

function ImageDeleteModalContent({
  asset,
  usages,
  loading,
  deleting,
  error,
  replacementAssets,
  selectedReplacementId,
  onSelectReplacement,
  onUploadReplacement,
  onDelete,
}: {
  asset: ImageAsset;
  usages: ImageAssetUsage[];
  loading: boolean;
  deleting: boolean;
  error: string | null;
  replacementAssets: ImageAsset[];
  selectedReplacementId: number | null;
  onSelectReplacement: (id: number) => void;
  onUploadReplacement: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const requiresReplacement = usages.length > 0;
  const filteredReplacementAssets = replacementAssets.filter((candidate) =>
    `${candidate.name} ${candidate.storedName}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const canDelete =
    !loading &&
    !deleting &&
    !error &&
    (!requiresReplacement || selectedReplacementId !== null);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] p-4 space-y-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--brand-text-soft)]">
            Selected Image
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--brand-surface)] border border-[var(--brand-border)]">
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-medium text-lg">{asset.name}</div>
            <div className="text-sm text-[var(--brand-text-muted)] break-all mt-1">
              {asset.url}
            </div>
            <div className="text-sm text-[var(--brand-text-muted)] mt-2">
              {formatBytes(asset.sizeBytes)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] p-5 text-sm text-[var(--brand-text-muted)] flex items-center gap-3">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Checking where this image is used...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : requiresReplacement ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <div className="text-sm font-medium text-amber-900">
                This image is currently used in {usages.length} place{usages.length === 1 ? "" : "s"}.
              </div>
              <div className="text-sm text-amber-800 mt-1">
                Pick another image below and the CMS will replace every usage before deleting this file.
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="text-sm font-medium text-emerald-900">
                This image is not being used anywhere in the CMS.
              </div>
              <div className="text-sm text-emerald-800 mt-1">
                You can delete it safely.
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-lg font-medium">Usage List</div>
                <div className="text-sm text-[var(--brand-text-muted)]">
                  Every place that currently points to this image.
                </div>
              </div>
              <div className="rounded-full bg-[var(--brand-secondary-fill)] px-3 py-1 text-sm text-[var(--brand-text-muted)]">
                {loading ? "Checking..." : `${usages.length} usage${usages.length === 1 ? "" : "s"}`}
              </div>
            </div>

            {loading ? null : usages.length === 0 ? (
              <div className="text-sm text-[var(--brand-text-muted)]">
                No current usages found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {usages.map((usage, index) => (
                  <div
                    key={`${usage.resourceType}-${usage.resourceId}-${usage.path}-${index}`}
                    className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] p-4"
                  >
                    <div className="text-sm font-medium text-[var(--brand-text)]">
                      {getImageUsageTypeLabel(usage.resourceType)}: {usage.resourceLabel}
                    </div>
                    <div className="text-sm text-[var(--brand-text-muted)] mt-1">
                      {usage.path}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
            <div className="flex flex-wrap gap-3 items-end mb-4">
              <div className="flex-1 min-w-[240px]">
                <Field
                  label="Replacement Image Search"
                  value={search}
                  onChange={setSearch}
                  placeholder="Search image names"
                />
              </div>
              <label className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white cursor-pointer">
                Upload Replacement
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const input = event.currentTarget;
                    const file = input.files?.[0];
                    if (!file) return;
                    try {
                      await onUploadReplacement(file);
                    } catch (uploadError) {
                      alert(
                        uploadError instanceof Error
                          ? uploadError.message
                          : "Failed to upload replacement image",
                      );
                    } finally {
                      input.value = "";
                    }
                  }}
                />
              </label>
            </div>

            <div className="text-sm text-[var(--brand-text-muted)] mb-4">
              {requiresReplacement
                ? "Choose the image that should replace the current one everywhere it is used."
                : "Replacement is optional here because this image is not currently used anywhere."}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[320px] overflow-y-auto">
              {filteredReplacementAssets.length === 0 ? (
                <div className="col-span-full text-sm text-[var(--brand-text-muted)]">
                  {replacementAssets.length === 0
                    ? "No other images are available yet. Upload one to use it as the replacement."
                    : "No matching images found."}
                </div>
              ) : null}

              {filteredReplacementAssets.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => onSelectReplacement(candidate.id)}
                  className={`rounded-2xl border p-3 text-left ${
                    selectedReplacementId === candidate.id
                      ? "border-[var(--brand-brown)] bg-[var(--brand-canvas-soft)]"
                      : "border-[var(--brand-border)] bg-[var(--brand-surface)]"
                  }`}
                >
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--brand-surface)] border border-[var(--brand-border)] mb-3">
                    <img
                      src={candidate.url}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-medium truncate">{candidate.name}</div>
                  <div className="text-sm text-[var(--brand-text-muted)]">
                    {formatBytes(candidate.sizeBytes)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canDelete}
          onClick={onDelete}
          className="px-5 py-3 rounded-2xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
        >
          {deleting
            ? "Deleting..."
            : requiresReplacement
              ? "Replace And Delete Image"
              : "Delete Image"}
        </button>
      </div>
    </div>
  );
}

function getPageTitle(slug: string) {
  const titles: Record<string, string> = {
    home: "Home Page",
    about: "About Page",
    services: "Services Page",
    blog: "Blog Page",
    contact: "Contact Page",
    "get-quote": "Quote Page",
    "join-team": "Careers Page",
  };
  return titles[slug] || slug;
}

function renderPageEditor(
  page: CmsPage<any>,
  updatePage: (nextPage: CmsPage<any>) => void,
  openIconPicker: (title: string, currentValue: string, onSelect: (value: string) => void) => void,
  openImagePicker: (title: string, currentValue: string, onSelect: (value: string) => void) => void,
) {
  const content = page.content || {};

  const updateContent = (nextContent: any) => updatePage({ ...page, content: nextContent });

  const renderHeroFields = () => (
    <SectionCard title="Page Header" description="Main heading and intro text shown at the top of this page.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Page Name" value={page.title || ""} onChange={(value) => updatePage({ ...page, title: value })} />
        <Field label="Main Heading" value={page.heroTitle || ""} onChange={(value) => updatePage({ ...page, heroTitle: value })} />
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4">
        <TextAreaField label="Supporting Line" value={page.heroSubtitle || ""} onChange={(value) => updatePage({ ...page, heroSubtitle: value })} rows={3} />
        <TextAreaField label="Extra Intro Text" value={page.heroDescription || ""} onChange={(value) => updatePage({ ...page, heroDescription: value })} rows={3} />
      </div>
    </SectionCard>
  );

  if (page.slug === "blog") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard title="Visibility" description="Control whether the blog page and home page blog preview are shown on the website.">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={content.isVisible !== false}
              onChange={(e) => updateContent({ ...content, isVisible: e.target.checked })}
            />
            Show the blog page and landing page blog section
          </label>
        </SectionCard>
      </div>
    );
  }

  if (page.slug === "services") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard
          title="Hero Image"
          description="Background image shown behind the services page header."
        >
          <div className="max-w-md">
            <ImagePickerField label="Services Hero Background Image" value={content.heroImage || ""} onPick={() => {
              openImagePicker(
                "Choose services hero background image",
                content.heroImage || "",
                (value) => updateContent({ ...content, heroImage: value }),
              );
            }} />
          </div>
        </SectionCard>
        <SectionCard title="Feature Highlights" description="Small highlight badges shown near the top of the services page.">
          <div className="space-y-4">
            {(content.greenFeatures || []).map((item: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={item.title?.trim() || `Highlight ${index + 1}`}
                summary={getEditorSummary(
                  [item.description, item.icon],
                  "Open to edit the title, icon, and short badge text.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <IconPickerField label="Icon" value={item.icon || "Sparkles"} onPick={() => {
                    openIconPicker("Choose highlight icon", item.icon || "Sparkles", (value) => {
                      const next = [...content.greenFeatures];
                      next[index] = { ...next[index], icon: value };
                      updateContent({ ...content, greenFeatures: next });
                    });
                  }} />
                  <Field label="Title" value={item.title || ""} onChange={(value) => {
                    const next = [...content.greenFeatures];
                    next[index] = { ...next[index], title: value };
                    updateContent({ ...content, greenFeatures: next });
                  }} />
                  <Field label="Short Description" value={item.description || ""} onChange={(value) => {
                    const next = [...content.greenFeatures];
                    next[index] = { ...next[index], description: value };
                    updateContent({ ...content, greenFeatures: next });
                  }} />
                </div>
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({
                    ...content,
                    greenFeatures: content.greenFeatures.filter((_: unknown, i: number) => i !== index),
                  });
                }}>
                  Remove Highlight
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({
              ...content,
              greenFeatures: [...(content.greenFeatures || []), { icon: "Sparkles", title: "", description: "" }],
            });
          }}>
            Add Highlight
          </button>
        </SectionCard>
        <SectionCard title="Call To Action" description="Final invitation block shown at the bottom of the page.">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Heading" value={content.cta?.title || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, title: value } })} />
            <TextAreaField label="Description" value={content.cta?.description || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, description: value } })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Primary Button Text" value={content.cta?.primaryLabel || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, primaryLabel: value } })} />
              <Field label="Secondary Button Text" value={content.cta?.secondaryLabel || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, secondaryLabel: value } })} />
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (page.slug === "contact") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard title="Map Area" description="Title and address shown in the map section.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Map Section Title" value={content.map?.title || ""} onChange={(value) => updateContent({ ...content, map: { ...content.map, title: value } })} />
            <Field label="Displayed Address" value={content.map?.address || ""} onChange={(value) => updateContent({ ...content, map: { ...content.map, address: value } })} />
          </div>
        </SectionCard>
        <SectionCard title="Frequently Asked Questions" description="Questions and answers shown at the bottom of the contact page.">
          <div className="space-y-4">
            {(content.faqs || []).map((faq: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={faq.q?.trim() || `FAQ ${index + 1}`}
                summary={getEditorSummary([faq.a], "Open to edit the question and answer shown on the contact page.")}
                defaultOpen={index === 0}
              >
                <Field label="Question" value={faq.q || ""} onChange={(value) => {
                  const next = [...content.faqs];
                  next[index] = { ...next[index], q: value };
                  updateContent({ ...content, faqs: next });
                }} />
                <TextAreaField label="Answer" value={faq.a || ""} onChange={(value) => {
                  const next = [...content.faqs];
                  next[index] = { ...next[index], a: value };
                  updateContent({ ...content, faqs: next });
                }} />
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, faqs: content.faqs.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove FAQ
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, faqs: [...(content.faqs || []), { q: "", a: "" }] });
          }}>
            Add FAQ
          </button>
        </SectionCard>
      </div>
    );
  }

  if (page.slug === "get-quote") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <LineListEditor
          title="Quote Features"
          description="Short benefit lines shown above the quote form."
          items={content.features || []}
          onChange={(items) => updateContent({ ...content, features: items })}
          addLabel="Add Feature"
        />
        <SectionCard title="Service Type Options" description="Options shown in the quote form service dropdown.">
          <div className="space-y-4">
            {(content.serviceTypes || []).map((item: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={item.label?.trim() || item.value?.trim() || `Service Type ${index + 1}`}
                summary={getEditorSummary(
                  [item.value, item.icon],
                  "Open to edit the option label, saved value, and icon.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Field label="Internal Value" value={item.value || ""} onChange={(value) => {
                    const next = [...content.serviceTypes];
                    next[index] = { ...next[index], value };
                    updateContent({ ...content, serviceTypes: next });
                  }} />
                  <Field label="Visible Label" value={item.label || ""} onChange={(value) => {
                    const next = [...content.serviceTypes];
                    next[index] = { ...next[index], label: value };
                    updateContent({ ...content, serviceTypes: next });
                  }} />
                  <IconPickerField label="Icon" value={item.icon || "Home"} onPick={() => {
                    openIconPicker("Choose service type icon", item.icon || "Home", (value) => {
                      const next = [...content.serviceTypes];
                      next[index] = { ...next[index], icon: value };
                      updateContent({ ...content, serviceTypes: next });
                    });
                  }} />
                </div>
                <button className="mt-3 px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, serviceTypes: content.serviceTypes.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Option
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, serviceTypes: [...(content.serviceTypes || []), { value: "", label: "", icon: "Home" }] });
          }}>
            Add Service Type
          </button>
        </SectionCard>
        <LineListEditor title="Visit Frequency Options" items={content.frequencies || []} onChange={(items) => updateContent({ ...content, frequencies: items })} addLabel="Add Frequency" />
        <SectionCard title="What Happens Next" description="Step-by-step items shown after the quote form.">
          <div className="space-y-4">
            {(content.nextSteps || []).map((step: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={step.title?.trim() || `Step ${index + 1}`}
                summary={getEditorSummary(
                  [step.description, step.step],
                  "Open to edit the numbered step shown after the quote form.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Step Number" value={step.step || ""} onChange={(value) => {
                    const next = [...content.nextSteps];
                    next[index] = { ...next[index], step: value };
                    updateContent({ ...content, nextSteps: next });
                  }} />
                  <Field label="Step Title" value={step.title || ""} onChange={(value) => {
                    const next = [...content.nextSteps];
                    next[index] = { ...next[index], title: value };
                    updateContent({ ...content, nextSteps: next });
                  }} />
                </div>
                <TextAreaField label="Step Description" value={step.description || ""} onChange={(value) => {
                  const next = [...content.nextSteps];
                  next[index] = { ...next[index], description: value };
                  updateContent({ ...content, nextSteps: next });
                }} />
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, nextSteps: content.nextSteps.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Step
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, nextSteps: [...(content.nextSteps || []), { step: "", title: "", description: "" }] });
          }}>
            Add Step
          </button>
        </SectionCard>
      </div>
    );
  }

  if (page.slug === "join-team") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard title="Benefits Cards" description="Benefits shown at the top of the careers page.">
          <div className="space-y-4">
            {(content.benefits || []).map((benefit: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={benefit.title?.trim() || `Benefit ${index + 1}`}
                summary={getEditorSummary(
                  [benefit.description, benefit.icon],
                  "Open to edit the benefit card title, description, and icon.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <IconPickerField label="Icon" value={benefit.icon || "Heart"} onPick={() => {
                    openIconPicker("Choose benefit icon", benefit.icon || "Heart", (value) => {
                      const next = [...content.benefits];
                      next[index] = { ...next[index], icon: value };
                      updateContent({ ...content, benefits: next });
                    });
                  }} />
                  <Field label="Title" value={benefit.title || ""} onChange={(value) => {
                    const next = [...content.benefits];
                    next[index] = { ...next[index], title: value };
                    updateContent({ ...content, benefits: next });
                  }} />
                  <TextAreaField label="Description" value={benefit.description || ""} onChange={(value) => {
                    const next = [...content.benefits];
                    next[index] = { ...next[index], description: value };
                    updateContent({ ...content, benefits: next });
                  }} rows={3} />
                </div>
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, benefits: content.benefits.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Benefit
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, benefits: [...(content.benefits || []), { icon: "Heart", title: "", description: "" }] });
          }}>
            Add Benefit Card
          </button>
        </SectionCard>
        <LineListEditor title="Employee Perks" items={content.perks || []} onChange={(items) => updateContent({ ...content, perks: items })} addLabel="Add Perk" />
        <LineListEditor title="Job Position Options" items={content.positions || []} onChange={(items) => updateContent({ ...content, positions: items })} addLabel="Add Position" />
      </div>
    );
  }

  if (page.slug === "about") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard title="Quick Stats" description="Number highlights shown under the hero section.">
          <div className="space-y-4">
            {(content.stats || []).map((stat: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-[var(--brand-border)] p-4">
                <Field label="Number" value={stat.number || ""} onChange={(value) => {
                  const next = [...content.stats];
                  next[index] = { ...next[index], number: value };
                  updateContent({ ...content, stats: next });
                }} />
                <Field label="Label" value={stat.label || ""} onChange={(value) => {
                  const next = [...content.stats];
                  next[index] = { ...next[index], label: value };
                  updateContent({ ...content, stats: next });
                }} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Our Story" description="Main story section content.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Section Label" value={content.story?.eyebrow || ""} onChange={(value) => updateContent({ ...content, story: { ...content.story, eyebrow: value } })} />
            <Field label="Section Title" value={content.story?.title || ""} onChange={(value) => updateContent({ ...content, story: { ...content.story, title: value } })} />
            <ImagePickerField label="Story Image" value={content.story?.image || ""} onPick={() => {
              openImagePicker("Choose story image", content.story?.image || "", (value) =>
                updateContent({ ...content, story: { ...content.story, image: value } }),
              );
            }} />
          </div>
          <div className="mt-4 space-y-4">
            {(content.story?.paragraphs || []).map((paragraph: string, index: number) => (
              <TextAreaField key={index} label={`Paragraph ${index + 1}`} value={paragraph} onChange={(value) => {
                const next = [...content.story.paragraphs];
                next[index] = value;
                updateContent({ ...content, story: { ...content.story, paragraphs: next } });
              }} />
            ))}
            <button className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
              updateContent({
                ...content,
                story: { ...content.story, paragraphs: [...(content.story?.paragraphs || []), ""] },
              });
            }}>
              Add Paragraph
            </button>
          </div>
        </SectionCard>
        <LineListEditor title="Story Bullet Points" items={content.story?.bullets || []} onChange={(items) => updateContent({ ...content, story: { ...content.story, bullets: items } })} addLabel="Add Bullet Point" />
        <SectionCard title="Values Section" description="Mission, values, and commitment cards.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Section Heading" value={content.valuesHeading || ""} onChange={(value) => updateContent({ ...content, valuesHeading: value })} />
            <TextAreaField label="Section Description" value={content.valuesDescription || ""} onChange={(value) => updateContent({ ...content, valuesDescription: value })} rows={3} />
          </div>
          <div className="space-y-4">
            {(content.values || []).map((item: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={item.title?.trim() || `Value Card ${index + 1}`}
                summary={getEditorSummary(
                  [item.description, item.icon],
                  "Open to edit this values section card.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <IconPickerField label="Icon" value={item.icon || "Target"} onPick={() => {
                    openIconPicker("Choose value card icon", item.icon || "Target", (value) => {
                      const next = [...content.values];
                      next[index] = { ...next[index], icon: value };
                      updateContent({ ...content, values: next });
                    });
                  }} />
                  <Field label="Card Title" value={item.title || ""} onChange={(value) => {
                    const next = [...content.values];
                    next[index] = { ...next[index], title: value };
                    updateContent({ ...content, values: next });
                  }} />
                </div>
                <TextAreaField label="Card Description" value={item.description || ""} onChange={(value) => {
                  const next = [...content.values];
                  next[index] = { ...next[index], description: value };
                  updateContent({ ...content, values: next });
                }} />
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, values: content.values.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Card
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, values: [...(content.values || []), { icon: "Target", title: "", description: "" }] });
          }}>
            Add Value Card
          </button>
        </SectionCard>
        <SectionCard title="Why Choose Us" description="Reason cards shown near the bottom of the page.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="Section Heading" value={content.whyChooseUsHeading || ""} onChange={(value) => updateContent({ ...content, whyChooseUsHeading: value })} />
            <TextAreaField label="Section Description" value={content.whyChooseUsDescription || ""} onChange={(value) => updateContent({ ...content, whyChooseUsDescription: value })} rows={3} />
          </div>
          <div className="space-y-4">
            {(content.whyChooseUs || []).map((item: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={item.title?.trim() || `Reason Card ${index + 1}`}
                summary={getEditorSummary(
                  [item.description, item.icon],
                  "Open to edit this reason card.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <IconPickerField label="Icon" value={item.icon || "Users"} onPick={() => {
                    openIconPicker("Choose reason card icon", item.icon || "Users", (value) => {
                      const next = [...content.whyChooseUs];
                      next[index] = { ...next[index], icon: value };
                      updateContent({ ...content, whyChooseUs: next });
                    });
                  }} />
                  <Field label="Card Title" value={item.title || ""} onChange={(value) => {
                    const next = [...content.whyChooseUs];
                    next[index] = { ...next[index], title: value };
                    updateContent({ ...content, whyChooseUs: next });
                  }} />
                </div>
                <TextAreaField label="Card Description" value={item.description || ""} onChange={(value) => {
                  const next = [...content.whyChooseUs];
                  next[index] = { ...next[index], description: value };
                  updateContent({ ...content, whyChooseUs: next });
                }} />
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, whyChooseUs: content.whyChooseUs.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Card
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, whyChooseUs: [...(content.whyChooseUs || []), { icon: "Users", title: "", description: "" }] });
          }}>
            Add Reason Card
          </button>
        </SectionCard>
        <SectionCard title="Call To Action">
          <div className="space-y-4">
            <Field label="Heading" value={content.cta?.title || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, title: value } })} />
            <TextAreaField label="Description" value={content.cta?.description || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, description: value } })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Primary Button Text" value={content.cta?.primaryLabel || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, primaryLabel: value } })} />
              <Field label="Secondary Button Text" value={content.cta?.secondaryLabel || ""} onChange={(value) => updateContent({ ...content, cta: { ...content.cta, secondaryLabel: value } })} />
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  if (page.slug === "home") {
    const beforeAfterSection = normalizeHomeBeforeAfterSection(content.beforeAfterSection);

    const updateBeforeAfterSection = (nextSection: typeof beforeAfterSection) =>
      updateContent({ ...content, beforeAfterSection: nextSection });

    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard
          title="Landing Hero Image"
          description="Background image shown in the main banner at the very top of the home page."
        >
          <div className="max-w-md">
            <ImagePickerField label="Hero Background Image" value={content.heroImage || ""} onPick={() => {
              openImagePicker("Choose home hero background image", content.heroImage || "", (value) =>
                updateContent({ ...content, heroImage: value }),
              );
            }} />
          </div>
        </SectionCard>
        <SectionCard title="Quick Stats" description="Numbers shown under the hero banner.">
          <div className="space-y-4">
            {(content.stats || []).map((stat: any, index: number) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-[var(--brand-border)] p-4">
                <Field label="Number" value={stat.number || ""} onChange={(value) => {
                  const next = [...content.stats];
                  next[index] = { ...next[index], number: value };
                  updateContent({ ...content, stats: next });
                }} />
                <Field label="Label" value={stat.label || ""} onChange={(value) => {
                  const next = [...content.stats];
                  next[index] = { ...next[index], label: value };
                  updateContent({ ...content, stats: next });
                }} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="About Section" description="Intro section with image collage and bullet points.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Section Label" value={content.aboutSection?.eyebrow || ""} onChange={(value) => updateContent({ ...content, aboutSection: { ...content.aboutSection, eyebrow: value } })} />
            <Field label="Section Title" value={content.aboutSection?.title || ""} onChange={(value) => updateContent({ ...content, aboutSection: { ...content.aboutSection, title: value } })} />
            <Field label="Experience Number" value={content.aboutSection?.experienceBadge || ""} onChange={(value) => updateContent({ ...content, aboutSection: { ...content.aboutSection, experienceBadge: value } })} />
            <Field label="Experience Label" value={content.aboutSection?.experienceLabel || ""} onChange={(value) => updateContent({ ...content, aboutSection: { ...content.aboutSection, experienceLabel: value } })} />
          </div>
          <div className="mt-4 space-y-4">
            {(content.aboutSection?.paragraphs || []).map((paragraph: string, index: number) => (
              <TextAreaField key={index} label={`Paragraph ${index + 1}`} value={paragraph} onChange={(value) => {
                const next = [...content.aboutSection.paragraphs];
                next[index] = value;
                updateContent({ ...content, aboutSection: { ...content.aboutSection, paragraphs: next } });
              }} />
            ))}
          </div>
        </SectionCard>
        <LineListEditor title="About Bullet Points" items={content.aboutSection?.bullets || []} onChange={(items) => updateContent({ ...content, aboutSection: { ...content.aboutSection, bullets: items } })} addLabel="Add Bullet Point" />
        <SectionCard title="Image Collage" description="Four image cards shown in the home page about section.">
          <div className="space-y-4">
            {(content.aboutSection?.collageImages || []).map((image: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[var(--brand-border)] p-4 space-y-3">
                <ImagePickerField label="Image" value={image.src || ""} onPick={() => {
                  openImagePicker(`Choose collage image ${index + 1}`, image.src || "", (value) => {
                    const next = [...content.aboutSection.collageImages];
                    next[index] = { ...next[index], src: value };
                    updateContent({ ...content, aboutSection: { ...content.aboutSection, collageImages: next } });
                  });
                }} />
                <Field label="Image Description" value={image.alt || ""} onChange={(value) => {
                  const next = [...content.aboutSection.collageImages];
                  next[index] = { ...next[index], alt: value };
                  updateContent({ ...content, aboutSection: { ...content.aboutSection, collageImages: next } });
                }} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Before & After Comparison" description="Slider section shown on the home page, including the comparison labels and intro text.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Section Label" value={beforeAfterSection.eyebrow} onChange={(value) => updateBeforeAfterSection({ ...beforeAfterSection, eyebrow: value })} />
            <Field label="Drag Hint" value={beforeAfterSection.dragInstruction} onChange={(value) => updateBeforeAfterSection({ ...beforeAfterSection, dragInstruction: value })} />
            <Field label="Before Label" value={beforeAfterSection.beforeLabel} onChange={(value) => updateBeforeAfterSection({ ...beforeAfterSection, beforeLabel: value })} />
            <Field label="After Label" value={beforeAfterSection.afterLabel} onChange={(value) => updateBeforeAfterSection({ ...beforeAfterSection, afterLabel: value })} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Section Title" value={beforeAfterSection.title} onChange={(value) => updateBeforeAfterSection({ ...beforeAfterSection, title: value })} rows={3} />
          </div>
        </SectionCard>
        <SectionCard title="Before & After Feature Points" description="Short feature titles shown around the comparison slider.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beforeAfterSection.features.map((feature, index) => (
              <Field
                key={index}
                label={`Feature ${index + 1} Title`}
                value={feature.title}
                onChange={(value) => {
                  const next = [...beforeAfterSection.features];
                  next[index] = { ...next[index], title: value };
                  updateBeforeAfterSection({ ...beforeAfterSection, features: next });
                }}
              />
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Before & After Images" description="Images and descriptions used in the comparison slider.">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--brand-border)] p-4 space-y-3">
              <ImagePickerField label="Before Image" value={beforeAfterSection.beforeImage.src} onPick={() => {
                openImagePicker("Choose before image", beforeAfterSection.beforeImage.src, (value) => {
                  updateBeforeAfterSection({
                    ...beforeAfterSection,
                    beforeImage: { ...beforeAfterSection.beforeImage, src: value },
                  });
                });
              }} />
              <Field label="Before Image Description" value={beforeAfterSection.beforeImage.alt} onChange={(value) => {
                updateBeforeAfterSection({
                  ...beforeAfterSection,
                  beforeImage: { ...beforeAfterSection.beforeImage, alt: value },
                });
              }} />
            </div>
            <div className="rounded-2xl border border-[var(--brand-border)] p-4 space-y-3">
              <ImagePickerField label="After Image" value={beforeAfterSection.afterImage.src} onPick={() => {
                openImagePicker("Choose after image", beforeAfterSection.afterImage.src, (value) => {
                  updateBeforeAfterSection({
                    ...beforeAfterSection,
                    afterImage: { ...beforeAfterSection.afterImage, src: value },
                  });
                });
              }} />
              <Field label="After Image Description" value={beforeAfterSection.afterImage.alt} onChange={(value) => {
                updateBeforeAfterSection({
                  ...beforeAfterSection,
                  afterImage: { ...beforeAfterSection.afterImage, alt: value },
                });
              }} />
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Testimonials" description="Customer review cards shown on the home page.">
          <div className="space-y-4">
            {(content.testimonials || []).map((item: any, index: number) => (
              <CollapsibleEditorCard
                key={index}
                title={item.name?.trim() || `Testimonial ${index + 1}`}
                summary={getEditorSummary(
                  [item.role, item.text],
                  "Open to edit the customer name, role, rating, and review text.",
                )}
                defaultOpen={index === 0}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Name" value={item.name || ""} onChange={(value) => {
                    const next = [...content.testimonials];
                    next[index] = { ...next[index], name: value };
                    updateContent({ ...content, testimonials: next });
                  }} />
                  <Field label="Role / Company" value={item.role || ""} onChange={(value) => {
                    const next = [...content.testimonials];
                    next[index] = { ...next[index], role: value };
                    updateContent({ ...content, testimonials: next });
                  }} />
                  <Field label="Star Rating" value={item.rating || 5} onChange={(value) => {
                    const next = [...content.testimonials];
                    next[index] = { ...next[index], rating: Number(value || 0) };
                    updateContent({ ...content, testimonials: next });
                  }} />
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ImagePickerField label="Company Logo" value={item.logo || ""} onPick={() => {
                    openImagePicker("Choose testimonial company logo", item.logo || "", (value) => {
                      const next = [...content.testimonials];
                      next[index] = { ...next[index], logo: value };
                      updateContent({ ...content, testimonials: next });
                    });
                  }} />
                  <Field label="Logo Description" value={item.logoAlt || ""} onChange={(value) => {
                    const next = [...content.testimonials];
                    next[index] = { ...next[index], logoAlt: value };
                    updateContent({ ...content, testimonials: next });
                  }} />
                </div>
                <TextAreaField label="Review Text" value={item.text || ""} onChange={(value) => {
                  const next = [...content.testimonials];
                  next[index] = { ...next[index], text: value };
                  updateContent({ ...content, testimonials: next });
                }} />
                <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                  updateContent({ ...content, testimonials: content.testimonials.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Testimonial
                </button>
              </CollapsibleEditorCard>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
            updateContent({ ...content, testimonials: [...(content.testimonials || []), { name: "", role: "", text: "", rating: 5 }] });
          }}>
            Add Testimonial
          </button>
        </SectionCard>
        <SectionCard title="Careers Highlight Section" description="Preview section inviting people to join the team.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Section Label" value={content.careersSection?.eyebrow || ""} onChange={(value) => updateContent({ ...content, careersSection: { ...content.careersSection, eyebrow: value } })} />
            <Field label="Section Title" value={content.careersSection?.title || ""} onChange={(value) => updateContent({ ...content, careersSection: { ...content.careersSection, title: value } })} />
            <Field label="Button Text" value={content.careersSection?.ctaLabel || ""} onChange={(value) => updateContent({ ...content, careersSection: { ...content.careersSection, ctaLabel: value } })} />
            <Field label="Team Count" value={content.careersSection?.staffCount || ""} onChange={(value) => updateContent({ ...content, careersSection: { ...content.careersSection, staffCount: value } })} />
            <Field label="Team Count Label" value={content.careersSection?.staffLabel || ""} onChange={(value) => updateContent({ ...content, careersSection: { ...content.careersSection, staffLabel: value } })} />
          </div>
          <div className="mt-4">
            <TextAreaField label="Section Description" value={content.careersSection?.description || ""} onChange={(value) => updateContent({ ...content, careersSection: { ...content.careersSection, description: value } })} />
          </div>
        </SectionCard>
        <SectionCard title="Careers Images" description="Images shown beside the careers preview section.">
          <div className="space-y-4">
            {(content.careersSection?.images || []).map((image: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[var(--brand-border)] p-4 space-y-3">
                <ImagePickerField label="Image" value={image.src || ""} onPick={() => {
                  openImagePicker(`Choose careers image ${index + 1}`, image.src || "", (value) => {
                    const next = [...content.careersSection.images];
                    next[index] = { ...next[index], src: value };
                    updateContent({ ...content, careersSection: { ...content.careersSection, images: next } });
                  });
                }} />
                <Field label="Image Description" value={image.alt || ""} onChange={(value) => {
                  const next = [...content.careersSection.images];
                  next[index] = { ...next[index], alt: value };
                  updateContent({ ...content, careersSection: { ...content.careersSection, images: next } });
                }} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHeroFields()}
      <SectionCard
        title="Unsupported Editor"
        description="This page type does not have a custom editor yet. Let me know which section you want expanded next and I can add it."
      >
        <div className="text-sm text-[var(--brand-text-muted)]">
          This page currently has no extra editable blocks beyond the page header.
        </div>
      </SectionCard>
    </div>
  );
}

export function Admin() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [section, setSection] = useState<AdminSection>("global");
  const [globalPanel, setGlobalPanel] = useState<GlobalPanel>("business");
  const [bootstrap, setBootstrap] = useState<AdminBootstrap | null>(null);
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null);
  const [pagesDraft, setPagesDraft] = useState<CmsPage[]>([]);
  const [servicesDraft, setServicesDraft] = useState<ServiceDetail[]>([]);
  const [postsDraft, setPostsDraft] = useState<Array<BlogPost & { sortOrder: number }>>([]);
  const [imageAssetsDraft, setImageAssetsDraft] = useState<ImageAsset[]>([]);
  const [selectedPageSlug, setSelectedPageSlug] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedPostSlug, setSelectedPostSlug] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<
    "global" | "styles" | "page" | "service" | "blog" | "password" | null
  >(null);
  const [savingOrder, setSavingOrder] = useState<"services" | "blog" | null>(null);
  const [backupBusy, setBackupBusy] = useState<"export" | "import" | null>(null);
  const [iconPicker, setIconPicker] = useState<{
    title: string;
    currentValue: string;
    onSelect: (value: string) => void;
  } | null>(null);
  const [imagePicker, setImagePicker] = useState<{
    title: string;
    currentValue: string;
    onSelect: (value: string) => void;
  } | null>(null);
  const [imageDeleteDialog, setImageDeleteDialog] = useState<ImageDeleteDialogState | null>(
    null,
  );
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function applyBootstrapData(data: AdminBootstrap) {
    setBootstrap(data);
    setSettingsDraft(normalizeAdminSettings(data.settings));
    setPagesDraft(data.pages);
    setServicesDraft(data.services);
    setPostsDraft(data.blogPosts);
    setImageAssetsDraft(data.imageAssets || []);
    setSelectedPageSlug((current) => current || data.pages[0]?.slug || "");
    setSelectedServiceId((current) => current || data.services[0]?.id || "");
    setSelectedPostSlug((current) => current || data.blogPosts[0]?.slug || "");
  }

  async function refreshAdminData(activeToken = token) {
    if (!activeToken) return;
    setLoading(true);
    try {
      const data = await getAdminBootstrap(activeToken);
      applyBootstrapData(data);
      setAuthError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load admin data";
      setAuthError(message);
      if (message.toLowerCase().includes("unauthorized")) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      refreshAdminData(token);
    }
  }, [token]);

  useEffect(() => {
    applyThemeColors(settingsDraft?.styles);
  }, [settingsDraft?.styles]);

  function flashStatus(message: string) {
    setStatusMessage(message);
    window.setTimeout(() => setStatusMessage(null), 2500);
  }

  function openIconPicker(
    title: string,
    currentValue: string,
    onSelect: (value: string) => void,
  ) {
    setIconPicker({ title, currentValue, onSelect });
  }

  function openImagePicker(
    title: string,
    currentValue: string,
    onSelect: (value: string) => void,
  ) {
    setImagePicker({ title, currentValue, onSelect });
  }

  async function handleImageUpload(file: File, autoSelect?: (asset: ImageAsset) => void) {
    if (!token) return [];
    const uploaded = await uploadAdminImage(token, file);
    setImageAssetsDraft(uploaded);
    const latest = uploaded[0];
    if (latest && autoSelect) {
      autoSelect(latest);
    }
    flashStatus("Image uploaded to library");
    return uploaded;
  }

  async function openImageDeleteDialog(asset: ImageAsset) {
    if (!token) return;

    setImageDeleteDialog({
      asset,
      usages: [],
      loading: true,
      deleting: false,
      selectedReplacementId: null,
      error: null,
    });

    try {
      const usages = await getAdminImageUsage(token, asset.id);
      setImageDeleteDialog((current) =>
        current && current.asset.id === asset.id
          ? {
              ...current,
              usages,
              loading: false,
              error: null,
            }
          : current,
      );
    } catch (error) {
      setImageDeleteDialog((current) =>
        current && current.asset.id === asset.id
          ? {
              ...current,
              loading: false,
              error:
                error instanceof Error ? error.message : "Failed to check where this image is used",
            }
          : current,
      );
    }
  }

  async function handleDeleteImage() {
    if (!token || !imageDeleteDialog) return;
    if (imageDeleteDialog.usages.length > 0 && !imageDeleteDialog.selectedReplacementId) {
      alert("Choose a replacement image before deleting this one.");
      return;
    }

    setImageDeleteDialog((current) =>
      current
        ? {
            ...current,
            deleting: true,
          }
        : current,
    );

    try {
      const result = await deleteAdminImage(
        token,
        imageDeleteDialog.asset.id,
        imageDeleteDialog.selectedReplacementId,
      );
      setImageAssetsDraft(result.imageAssets);
      setImageDeleteDialog(null);
      await refreshAdminData(token);
      flashStatus(
        result.replacedUsageCount > 0
          ? `Image replaced in ${result.replacedUsageCount} place${
              result.replacedUsageCount === 1 ? "" : "s"
            } and deleted`
          : "Image deleted",
      );
    } catch (error) {
      setImageDeleteDialog((current) =>
        current
          ? {
              ...current,
              deleting: false,
            }
          : current,
      );
      alert(error instanceof Error ? error.message : "Failed to delete image");
    }
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      const result = await adminLogin(password);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUsername(result.username);
      setPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (token) {
      try {
        await adminLogout(token);
      } catch {
        // Ignore logout failures and clear state anyway.
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setBootstrap(null);
    setSavingKey(null);
    setStatusMessage(null);
    setImageDeleteDialog(null);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--brand-canvas)] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-[var(--brand-surface)] rounded-3xl shadow-2xl p-8 border border-[var(--brand-border)]">
          <div className="mb-8">
            <div className="eyebrow-label text-[var(--brand-text-soft)] mb-3">CMS Admin</div>
            <h1 className="section-title text-4xl text-[var(--brand-text)] mb-2">Sign In</h1>
            <p className="body-copy text-[var(--brand-text-muted)] text-sm">
              Use the admin password stored in the database. Default username is <code>admin</code>.
            </p>
          </div>
          <Field label="Password" value={password} onChange={setPassword} type="password" />
          {authError ? <div className="text-sm text-red-600 my-4">{authError}</div> : null}
          <button type="submit" disabled={loading} className="button-text mt-4 w-full rounded-2xl bg-[var(--brand-brown)] text-white py-3 disabled:opacity-60">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  const selectedPage = pagesDraft.find((page) => page.slug === selectedPageSlug) || null;
  const selectedService = servicesDraft.find((service) => service.id === selectedServiceId) || null;
  const selectedPost = postsDraft.find((post) => post.slug === selectedPostSlug) || null;
  const isNewService = selectedService ? !bootstrap?.services.some((service) => service.id === selectedService.id) : false;
  const isNewPost = selectedPost ? !bootstrap?.blogPosts.some((post) => post.slug === selectedPost.slug) : false;
  const normalizedBootstrapSettings = bootstrap ? normalizeAdminSettings(bootstrap.settings) : null;
  const bootstrapPage = bootstrap?.pages.find((page) => page.slug === selectedPageSlug) || null;
  const bootstrapService = bootstrap?.services.find((service) => service.id === selectedServiceId) || null;
  const bootstrapPost = bootstrap?.blogPosts.find((post) => post.slug === selectedPostSlug) || null;
  const globalDirty =
    settingsDraft && normalizedBootstrapSettings
      ? stableSerialize(stripStylesFromSettings(settingsDraft)) !== stableSerialize(stripStylesFromSettings(normalizedBootstrapSettings))
      : false;
  const stylesDirty =
    settingsDraft && normalizedBootstrapSettings
      ? stableSerialize(normalizedBootstrapSettings.styles) !== stableSerialize(normalizeAdminSettings(settingsDraft).styles)
      : false;
  const pageDirty =
    selectedPage && bootstrapPage ? stableSerialize(selectedPage) !== stableSerialize(bootstrapPage) : false;
  const serviceDirty = selectedService
    ? isNewService || !bootstrapService || stableSerialize(selectedService) !== stableSerialize(bootstrapService)
    : false;
  const postDirty = selectedPost
    ? isNewPost || !bootstrapPost || stableSerialize(selectedPost) !== stableSerialize(bootstrapPost)
    : false;
  const passwordDirty = Boolean(
    passwordForm.currentPassword.trim() ||
      passwordForm.newPassword.trim() ||
      passwordForm.confirmPassword.trim(),
  );

  let currentContextTitle = ADMIN_SECTION_META[section].title;
  let currentContextDescription = ADMIN_SECTION_META[section].description;
  let currentSaveTarget: "global" | "styles" | "page" | "service" | "blog" | "password" | null = null;
  let currentDirty = false;

  if (section === "global") {
    currentContextTitle = GLOBAL_PANEL_META[globalPanel].label;
    currentContextDescription = GLOBAL_PANEL_META[globalPanel].description;
    currentSaveTarget = "global";
    currentDirty = globalDirty;
  } else if (section === "styles") {
    currentContextTitle = "Brand Styles";
    currentContextDescription = "Control the main website colors and typography presets from one place.";
    currentSaveTarget = "styles";
    currentDirty = stylesDirty;
  } else if (section === "pages" && selectedPage) {
    currentContextTitle = getPageTitle(selectedPage.slug);
    currentContextDescription = getPageEditorDescription(selectedPage.slug);
    currentSaveTarget = "page";
    currentDirty = pageDirty;
  } else if (section === "services" && selectedService) {
    currentContextTitle = selectedService.title || "New Service";
    currentContextDescription = isNewService
      ? "Set up the new service details, images, and supporting points before publishing it."
      : "Edit this service card, detail page, and landing-page visibility in one place.";
    currentSaveTarget = "service";
    currentDirty = serviceDirty;
  } else if (section === "blog" && selectedPost) {
    currentContextTitle = selectedPost.title || "New Blog Post";
    currentContextDescription = isNewPost
      ? "Write the new blog card content and save it when you are ready to publish."
      : "Update the visible blog card details, category, author line, and excerpt.";
    currentSaveTarget = "blog";
    currentDirty = postDirty;
  } else if (section === "password") {
    currentContextTitle = "Admin Password";
    currentContextDescription = "Update the password used to sign in to the CMS.";
    currentSaveTarget = "password";
    currentDirty = passwordDirty;
  }

  const isCurrentSaveRunning = currentSaveTarget ? savingKey === currentSaveTarget : false;
  const contextStateBadge = currentSaveTarget
    ? isCurrentSaveRunning
      ? {
          label: "Saving...",
          className:
            "rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm text-sky-700",
          icon: <LoaderCircle className="h-4 w-4 animate-spin" />,
        }
      : currentDirty
        ? {
            label: "Unsaved changes",
            className:
              "rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800",
            icon: <CircleDot className="h-4 w-4" />,
          }
        : {
            label: "All changes saved",
            className:
              "rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700",
            icon: <CheckCircle2 className="h-4 w-4" />,
          }
    : null;
  const currentGuide = buildWorkspaceGuide({
    section,
    globalPanel,
    selectedPage,
    selectedService,
    selectedPost,
    isNewService,
    isNewPost,
  });

  function moveService(fromId: string, toId: string) {
    if (fromId === toId) return;
    setServicesDraft((current) => {
      const fromIndex = current.findIndex((service) => service.id === fromId);
      const toIndex = current.findIndex((service) => service.id === toId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((service, index) => ({ ...service, sortOrder: index + 1 }));
    });
  }

  function movePost(fromSlug: string, toSlug: string) {
    if (fromSlug === toSlug) return;
    setPostsDraft((current) => {
      const fromIndex = current.findIndex((post) => post.slug === fromSlug);
      const toIndex = current.findIndex((post) => post.slug === toSlug);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next.map((post, index) => ({ ...post, sortOrder: index + 1 }));
    });
  }

  async function handleSaveSettings() {
    if (!token || !settingsDraft) return;
    setSavingKey("global");
    try {
      const saved = await saveAdminSettings(token, settingsDraft);
      setSettingsDraft(normalizeAdminSettings(saved));
      await refreshAdminData(token);
      flashStatus("Site settings saved");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleSaveStyles() {
    if (!token || !settingsDraft) return;
    const brandBrown = settingsDraft.styles?.brandBrown?.trim() || "";
    const brandAccent = settingsDraft.styles?.brandAccent?.trim() || "";
    const brandCanvas = settingsDraft.styles?.brandCanvas?.trim() || "";
    const brandSurface = settingsDraft.styles?.brandSurface?.trim() || "";
    const ecoGreen = settingsDraft.styles?.ecoGreen?.trim() || "";
    const footerBackground = settingsDraft.styles?.footerBackground?.trim() || "";
    const heroOverlay = settingsDraft.styles?.heroOverlay?.trim() || "";

    if (
      !HEX_COLOR_PATTERN.test(brandBrown) ||
      !HEX_COLOR_PATTERN.test(brandAccent) ||
      !HEX_COLOR_PATTERN.test(brandCanvas) ||
      !HEX_COLOR_PATTERN.test(brandSurface) ||
      (ecoGreen && !HEX_COLOR_PATTERN.test(ecoGreen)) ||
      (footerBackground && !HEX_COLOR_PATTERN.test(footerBackground)) ||
      (heroOverlay && !HEX_COLOR_PATTERN.test(heroOverlay))
    ) {
      alert("Main colors must use #RRGGBB, and advanced colors must be blank or use #RRGGBB.");
      return;
    }

    setSavingKey("styles");
    try {
      const saved = await saveAdminSettings(token, settingsDraft);
      setSettingsDraft(normalizeAdminSettings(saved));
      await refreshAdminData(token);
      flashStatus("Styles saved");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save styles");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleSavePage() {
    if (!token || !selectedPage) return;
    setSavingKey("page");
    try {
      await saveAdminPage(token, selectedPage);
      await refreshAdminData(token);
      flashStatus(`${getPageTitle(selectedPage.slug)} saved`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save page");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleSaveService() {
    if (!token || !selectedService) return;
    setSavingKey("service");
    try {
      if (isNewService) {
        await createAdminService(token, selectedService);
      } else {
        await saveAdminService(token, selectedService);
      }
      await refreshAdminData(token);
      flashStatus("Service saved");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save service");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleDeleteService() {
    if (!selectedService) return;
    if (isNewService) {
      setServicesDraft((current) => current.filter((service) => service.id !== selectedService.id));
      setSelectedServiceId(servicesDraft[0]?.id || "");
      return;
    }
    if (!token || !window.confirm(`Delete service "${selectedService.title}"?`)) return;
    try {
      await deleteAdminService(token, selectedService.id);
      await refreshAdminData(token);
      flashStatus("Service deleted");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete service");
    }
  }

  async function handleSavePost() {
    if (!token || !selectedPost) return;
    setSavingKey("blog");
    try {
      if (isNewPost) {
        await createAdminBlogPost(token, selectedPost);
      } else {
        await saveAdminBlogPost(token, selectedPost);
      }
      await refreshAdminData(token);
      flashStatus("Blog post saved");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save post");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleDeletePost() {
    if (!selectedPost) return;
    if (isNewPost) {
      setPostsDraft((current) => current.filter((post) => post.slug !== selectedPost.slug));
      setSelectedPostSlug(postsDraft[0]?.slug || "");
      return;
    }
    if (!token || !window.confirm(`Delete blog post "${selectedPost.title}"?`)) return;
    try {
      await deleteAdminBlogPost(token, selectedPost.slug);
      await refreshAdminData(token);
      flashStatus("Blog post deleted");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete post");
    }
  }

  async function handleUpdatePassword() {
    if (!token) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password confirmation does not match");
      return;
    }
    setSavingKey("password");
    try {
      await changeAdminPassword(token, passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      flashStatus("Password updated");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setSavingKey(null);
    }
  }

  let primaryAction: ReactNode = null;
  let secondaryAction: ReactNode = null;

  if (section === "global" && settingsDraft) {
    primaryAction = (
      <button
        onClick={handleSaveSettings}
        disabled={!globalDirty || savingKey === "global"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {savingKey === "global" ? "Saving..." : `Save ${GLOBAL_PANEL_META[globalPanel].label}`}
      </button>
    );
  } else if (section === "styles" && settingsDraft) {
    primaryAction = (
      <button
        onClick={handleSaveStyles}
        disabled={!stylesDirty || savingKey === "styles"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {savingKey === "styles" ? "Saving..." : "Save Styles"}
      </button>
    );
  } else if (section === "pages" && selectedPage) {
    primaryAction = (
      <button
        onClick={handleSavePage}
        disabled={!pageDirty || savingKey === "page"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {savingKey === "page" ? "Saving..." : `Save ${getPageTitle(selectedPage.slug)}`}
      </button>
    );
  } else if (section === "services" && selectedService) {
    primaryAction = (
      <button
        onClick={handleSaveService}
        disabled={!serviceDirty || savingKey === "service"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {savingKey === "service" ? "Saving..." : isNewService ? "Create Service" : "Save Service"}
      </button>
    );
    secondaryAction = (
      <button
        onClick={handleDeleteService}
        disabled={savingKey === "service"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)] disabled:opacity-60"
      >
        Delete Service
      </button>
    );
  } else if (section === "blog" && selectedPost) {
    primaryAction = (
      <button
        onClick={handleSavePost}
        disabled={!postDirty || savingKey === "blog"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {savingKey === "blog" ? "Saving..." : isNewPost ? "Create Blog Post" : "Save Blog Post"}
      </button>
    );
    secondaryAction = (
      <button
        onClick={handleDeletePost}
        disabled={savingKey === "blog"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)] disabled:opacity-60"
      >
        Delete Blog Post
      </button>
    );
  } else if (section === "password") {
    primaryAction = (
      <button
        onClick={handleUpdatePassword}
        disabled={!passwordDirty || savingKey === "password"}
        className="px-5 py-2.5 rounded-xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
      >
        {savingKey === "password" ? "Updating..." : "Update Password"}
      </button>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[var(--brand-canvas)] text-[var(--brand-text)] flex flex-col">
      <div className="border-b border-[var(--brand-border)] bg-[var(--brand-surface)]/92 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <div className="min-w-0">
          <div className="eyebrow-label text-[var(--brand-text-soft)]">
            CIOS CMS • {ADMIN_SECTION_META[section].shortLabel}
          </div>
          <h1 className="section-title text-3xl">Editing: {currentContextTitle}</h1>
          <p className="body-copy text-sm text-[var(--brand-text-muted)] mt-1">
            {currentContextDescription}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {contextStateBadge ? (
            <div className={`${contextStateBadge.className} flex items-center gap-2`}>
              {contextStateBadge.icon}
              <span>{contextStateBadge.label}</span>
            </div>
          ) : null}
          {secondaryAction}
          {primaryAction}
          {statusMessage ? (
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700 border border-emerald-200">
              {statusMessage}
            </div>
          ) : null}
          <div className="rounded-full bg-[var(--brand-secondary-fill)] px-4 py-2 text-sm text-[var(--brand-text-muted)]">
            Signed in as {username}
          </div>
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-[var(--brand-brown)] text-white">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[300px_minmax(0,1fr)] flex-1 min-h-0 overflow-hidden">
        <aside className="border-r border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 overflow-y-auto">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] p-5">
              <div className="eyebrow-label text-[var(--brand-text-soft)] mb-2">Navigation</div>
              <h2 className="text-xl text-[var(--brand-text)]">Choose What You Want To Edit</h2>
              <p className="body-copy text-sm text-[var(--brand-text-muted)] mt-2">
                Settings are grouped by task so a non-technical editor can find things faster.
              </p>
            </div>

            <nav className="space-y-4">
              {ADMIN_NAV_GROUPS.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.title} className="rounded-[28px] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]">
                        <GroupIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--brand-text)]">{group.title}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-[var(--brand-text-soft)]">
                          {group.items.length} sections
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      {group.items.map((value) => (
                        <button
                          key={value}
                          onClick={() => setSection(value)}
                          className={`w-full rounded-2xl px-4 py-3 text-left transition-colors ${
                            section === value
                              ? "bg-[var(--brand-brown)] text-white shadow-sm"
                              : "bg-[var(--brand-surface)] text-[var(--brand-text)] hover:bg-[var(--brand-secondary-fill-hover)]"
                          }`}
                        >
                          <div className="font-medium">{ADMIN_SECTION_META[value].shortLabel}</div>
                          <div className={`mt-1 text-sm ${section === value ? "text-white/80" : "text-[var(--brand-text-muted)]"}`}>
                            {ADMIN_SECTION_META[value].description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="p-6 overflow-y-auto">
          {loading && !bootstrap ? <div>Loading admin data...</div> : null}
          {authError ? <div className="text-red-600 mb-4">{authError}</div> : null}

          {section === "global" && settingsDraft ? (
            <div className="space-y-6">
              <SectionIntro
                title={ADMIN_SECTION_META.global.title}
                description={ADMIN_SECTION_META.global.description}
                accent={
                  <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-secondary-fill)]">
                        <Settings2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">One place for site-wide details</div>
                        <div className="text-sm text-[var(--brand-text-muted)]">Use the tabs below to keep this manageable.</div>
                      </div>
                    </div>
                  </div>
                }
              />
              <SegmentedTabs
                value={globalPanel}
                onChange={setGlobalPanel}
                items={(Object.entries(GLOBAL_PANEL_META) as Array<[GlobalPanel, (typeof GLOBAL_PANEL_META)[GlobalPanel]]>).map(
                  ([value, meta]) => ({
                    value,
                    label: meta.label,
                    description: meta.description,
                  }),
                )}
              />
              {currentGuide ? (
                <WorkspaceGuideCard
                  key={`guide-${section}-${globalPanel}`}
                  title={currentGuide.title}
                  description={currentGuide.description}
                  hints={currentGuide.hints}
                  links={currentGuide.links}
                  note={currentGuide.note}
                />
              ) : null}

              {globalPanel === "business" ? (
                <SectionCard title="Business Basics" description="These details are reused across the whole website.">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Business Name" value={settingsDraft.business.name} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, name: value } })} />
                    <Field label="Phone Number" value={settingsDraft.business.phoneDisplay} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, phoneDisplay: value } })} />
                    <Field label="Phone Link" value={settingsDraft.business.phoneHref} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, phoneHref: value } })} />
                    <Field label="Email Address" value={settingsDraft.business.email} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, email: value } })} />
                    <Field label="Map / Location Label" value={settingsDraft.business.locationLabel} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, locationLabel: value } })} />
                    <Field label="LinkedIn Link" value={settingsDraft.business.linkedinUrl} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, linkedinUrl: value } })} />
                    <Field label="Copyright Name" value={settingsDraft.business.copyrightName} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, copyrightName: value } })} />
                  </div>
                  <div className="mt-4">
                    <TextAreaField label="Short Business Description" value={settingsDraft.business.shortDescription} onChange={(value) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, shortDescription: value } })} />
                  </div>
                </SectionCard>
              ) : null}

              {globalPanel === "contact" ? (
                <>
                  <LineListEditor title="Address Lines" description="Shown in contact areas and shared site sections." items={settingsDraft.business.addressLines} onChange={(items) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, addressLines: items } })} addLabel="Add Address Line" />
                  <LineListEditor title="Opening Hours" description="Shared business hours used around the website." items={settingsDraft.business.hours} onChange={(items) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, hours: items } })} addLabel="Add Opening Hour" />
                  <ContactCardsEditor
                    cards={settingsDraft.contactCards || []}
                    onChange={(contactCards) => setSettingsDraft({ ...settingsDraft, contactCards })}
                    openIconPicker={openIconPicker}
                  />
                </>
              ) : null}

              {globalPanel === "footer" ? (
                <LineListEditor title="Footer Service Names" description="Short service list shown in the footer." items={settingsDraft.footer.services} onChange={(items) => setSettingsDraft({ ...settingsDraft, footer: { ...settingsDraft.footer, services: items } })} addLabel="Add Footer Service" />
              ) : null}

              {globalPanel === "trust" ? (
                <>
                  <SectionCard title="Clients" description="Trusted clients shown on the website.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Field label="Section Label" value={settingsDraft.clients.eyebrow} onChange={(value) => setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, eyebrow: value } })} />
                  <Field label="Section Title" value={settingsDraft.clients.title} onChange={(value) => setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, title: value } })} />
                </div>
                <TextAreaField label="Section Description" value={settingsDraft.clients.description} onChange={(value) => setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, description: value } })} />
                <div className="mt-4 space-y-4">
                  {settingsDraft.clients.items.map((client, index) => (
                    <CollapsibleEditorCard
                      key={`client-${index}`}
                      title={client.name?.trim() || `Client ${index + 1}`}
                      summary={getEditorSummary(
                        [client.logo],
                        "Open to edit the client name and logo.",
                      )}
                      defaultOpen={index === 0}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                          label="Client Name"
                          value={client.name}
                          onChange={(value) => {
                            const next = [...settingsDraft.clients.items];
                            next[index] = { ...next[index], name: value };
                            setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, items: next } });
                          }}
                        />
                        <ImagePickerField
                          label="Client Logo"
                          value={client.logo}
                          onPick={() => {
                            openImagePicker("Choose client logo", client.logo || "", (value) => {
                              const next = [...settingsDraft.clients.items];
                              next[index] = { ...next[index], logo: value };
                              setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, items: next } });
                            });
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsDraft({
                            ...settingsDraft,
                            clients: {
                              ...settingsDraft.clients,
                              items: settingsDraft.clients.items.filter((_, itemIndex) => itemIndex !== index),
                            },
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]"
                      >
                        Remove Client
                      </button>
                    </CollapsibleEditorCard>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setSettingsDraft({
                        ...settingsDraft,
                        clients: {
                          ...settingsDraft.clients,
                          items: [...settingsDraft.clients.items, { name: "", logo: "" }],
                        },
                      })
                    }
                    className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white"
                  >
                    Add Client
                  </button>
                </div>
              </SectionCard>

                  <SectionCard title="Accreditations" description="Certificates, memberships, and compliance items shown on the site.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Field label="Section Label" value={settingsDraft.accreditations.eyebrow} onChange={(value) => setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, eyebrow: value } })} />
                  <Field label="Section Title" value={settingsDraft.accreditations.title} onChange={(value) => setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, title: value } })} />
                </div>
                <TextAreaField label="Section Description" value={settingsDraft.accreditations.description} onChange={(value) => setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, description: value } })} />
                <div className="mt-4 space-y-4">
                  {settingsDraft.accreditations.groups.map((group: any, index: number) => {
                    const mode = group.memberships ? "memberships" : "items";
                    return (
                      <CollapsibleEditorCard
                        key={index}
                        title={group.title?.trim() || `Accreditation Group ${index + 1}`}
                        summary={getEditorSummary(
                          [
                            mode === "memberships"
                              ? group.memberships?.[0]?.full || group.memberships?.[0]?.name
                              : group.items?.[0],
                            group.icon,
                          ],
                          "Open to edit the group title, icon, and accreditation items.",
                        )}
                        defaultOpen={index === 0}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <IconPickerField label="Icon" value={group.icon || "Award"} onPick={() => {
                            openIconPicker("Choose accreditation icon", group.icon || "Award", (value) => {
                              const next = [...settingsDraft.accreditations.groups];
                              next[index] = { ...next[index], icon: value };
                              setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                            });
                          }} />
                          <Field label="Group Title" value={group.title || ""} onChange={(value) => {
                            const next = [...settingsDraft.accreditations.groups];
                            next[index] = { ...next[index], title: value };
                            setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                          }} />
                          <SelectField label="Content Type" value={mode} options={["items", "memberships"]} onChange={(value) => {
                            const next = [...settingsDraft.accreditations.groups];
                            next[index] =
                              value === "memberships"
                                ? { icon: group.icon, title: group.title, memberships: group.memberships || [{ name: "", full: "" }] }
                                : { icon: group.icon, title: group.title, items: group.items || [""] };
                            setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                          }} />
                        </div>

                        {mode === "items" ? (
                          <div className="space-y-3">
                            {(group.items || []).map((item: string, itemIndex: number) => (
                              <div key={itemIndex} className="flex gap-3">
                                <input
                                  value={item}
                                  onChange={(e) => {
                                    const next = [...settingsDraft.accreditations.groups];
                                    const items = [...(next[index].items || [])];
                                    items[itemIndex] = e.target.value;
                                    next[index] = { ...next[index], items };
                                    setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                                  }}
                                  className="flex-1 px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
                                />
                                <button className="px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                                  const next = [...settingsDraft.accreditations.groups];
                                  next[index] = {
                                    ...next[index],
                                    items: next[index].items.filter((_: unknown, i: number) => i !== itemIndex),
                                  };
                                  setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                                }}>
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
                              const next = [...settingsDraft.accreditations.groups];
                              next[index] = { ...next[index], items: [...(next[index].items || []), ""] };
                              setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                            }}>
                              Add Bullet
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(group.memberships || []).map((membership: any, memberIndex: number) => (
                              <div key={memberIndex} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3">
                                <input
                                  value={membership.name || ""}
                                  onChange={(e) => {
                                    const next = [...settingsDraft.accreditations.groups];
                                    const memberships = [...(next[index].memberships || [])];
                                    memberships[memberIndex] = { ...memberships[memberIndex], name: e.target.value };
                                    next[index] = { ...next[index], memberships };
                                    setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                                  }}
                                  placeholder="Short Name"
                                  className="px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
                                />
                                <input
                                  value={membership.full || ""}
                                  onChange={(e) => {
                                    const next = [...settingsDraft.accreditations.groups];
                                    const memberships = [...(next[index].memberships || [])];
                                    memberships[memberIndex] = { ...memberships[memberIndex], full: e.target.value };
                                    next[index] = { ...next[index], memberships };
                                    setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                                  }}
                                  placeholder="Full Organization Name"
                                  className="px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
                                />
                                <button className="px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                                  const next = [...settingsDraft.accreditations.groups];
                                  next[index] = {
                                    ...next[index],
                                    memberships: next[index].memberships.filter((_: unknown, i: number) => i !== memberIndex),
                                  };
                                  setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                                }}>
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
                              const next = [...settingsDraft.accreditations.groups];
                              next[index] = {
                                ...next[index],
                                memberships: [...(next[index].memberships || []), { name: "", full: "" }],
                              };
                              setSettingsDraft({ ...settingsDraft, accreditations: { ...settingsDraft.accreditations, groups: next } });
                            }}>
                              Add Membership
                            </button>
                          </div>
                        )}

                        <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                          setSettingsDraft({
                            ...settingsDraft,
                            accreditations: {
                              ...settingsDraft.accreditations,
                              groups: settingsDraft.accreditations.groups.filter((_, i) => i !== index),
                            },
                          });
                        }}>
                          Remove Group
                        </button>
                      </CollapsibleEditorCard>
                    );
                  })}
                </div>
                <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
                  setSettingsDraft({
                    ...settingsDraft,
                    accreditations: {
                      ...settingsDraft.accreditations,
                      groups: [...settingsDraft.accreditations.groups, { icon: "Award", title: "", items: [""] }],
                    },
                  });
                }}>
                  Add Accreditation Group
                </button>
              </SectionCard>
                </>
              ) : null}

            </div>
          ) : null}

          {section === "styles" && settingsDraft ? (
            <div className="space-y-6">
              <SectionIntro
                title={ADMIN_SECTION_META.styles.title}
                description={ADMIN_SECTION_META.styles.description}
                accent={
                  <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-secondary-fill)]">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div className="text-sm text-[var(--brand-text-muted)]">
                        Change only the key brand choices. Hover, soft, and helper colors are derived for you.
                      </div>
                    </div>
                  </div>
                }
              />
              {currentGuide ? (
                <WorkspaceGuideCard
                  key={`guide-${section}`}
                  title={currentGuide.title}
                  description={currentGuide.description}
                  hints={currentGuide.hints}
                  links={currentGuide.links}
                  note={currentGuide.note}
                />
              ) : null}
              <SectionCard title="Styles" description="Pick up to four main colors. Hover, soft, border, and helper shades are generated automatically from these values.">
                <div className="mb-6">
                  <label className="block">
                    <div className="text-sm text-[var(--brand-text-muted)] mb-2">Typography Preset</div>
                    <select
                      value={settingsDraft.styles.typographyPreset || "classic-editorial"}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          styles: { ...settingsDraft.styles, typographyPreset: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
                    >
                      {Object.entries(TYPOGRAPHY_PRESETS).map(([value, preset]) => (
                        <option key={value} value={value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="mt-3 text-sm text-[var(--brand-text-muted)] body-copy">
                    Display: {TYPOGRAPHY_PRESETS[(settingsDraft.styles.typographyPreset || "classic-editorial") as keyof typeof TYPOGRAPHY_PRESETS]?.display}
                    <br />
                    Body: {TYPOGRAPHY_PRESETS[(settingsDraft.styles.typographyPreset || "classic-editorial") as keyof typeof TYPOGRAPHY_PRESETS]?.body}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ColorField
                    label="Main Brown"
                    value={settingsDraft.styles.brandBrown}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, brandBrown: value },
                      })
                    }
                  />
                  <ColorField
                    label="Main Accent"
                    value={settingsDraft.styles.brandAccent}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, brandAccent: value },
                      })
                    }
                  />
                  <ColorField
                    label="Canvas Background"
                    value={settingsDraft.styles.brandCanvas}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, brandCanvas: value },
                      })
                    }
                  />
                  <ColorField
                    label="Surface / Card"
                    value={settingsDraft.styles.brandSurface}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, brandSurface: value },
                      })
                    }
                  />
                </div>

                {(() => {
                  const preview = getThemeColors(settingsDraft.styles);
                  return (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-3xl p-6 md:col-span-2" style={{ background: preview.brandSurface, border: `1px solid ${preview.brandBorder}` }}>
                        <div className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: preview.brandTextMuted }}>Typography Preview</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div style={{ fontFamily: preview.fontDisplay, color: preview.brandText }} className="text-5xl leading-none">
                              Premium Cleaning That Feels Considered
                            </div>
                          </div>
                          <div>
                            <p style={{ fontFamily: preview.fontBody, color: preview.brandTextMuted }} className="text-base leading-8">
                              This preview shows how the selected display and body fonts will look across the public website and admin panel.
                            </p>
                            <button
                              type="button"
                              className="mt-4 px-5 py-3 rounded-full text-black"
                              style={{ background: preview.brandAccent, fontFamily: preview.fontBody, fontWeight: 800 }}
                            >
                              Preview Button
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl p-6 text-white" style={{ background: preview.brandBrown }}>
                        <div className="text-sm uppercase tracking-[0.2em] opacity-80 mb-3">Brown Preview</div>
                        <div className="text-2xl font-semibold" style={{ fontFamily: preview.fontDisplay }}>Brand Surface</div>
                        <div className="mt-4 h-12 rounded-2xl border border-white/20" style={{ background: preview.brandBrownSoft }} />
                      </div>
                      <div className="rounded-3xl p-6" style={{ background: preview.brandSurface, border: `2px solid ${preview.brandAccent}` }}>
                        <div className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: preview.brandTextMuted }}>Accent Preview</div>
                        <button
                          type="button"
                          className="px-6 py-3 rounded-full font-semibold text-black"
                          style={{ background: preview.brandAccent }}
                        >
                          Primary Button
                        </button>
                        <div className="mt-4 h-12 rounded-2xl" style={{ background: preview.brandAccentSoft }} />
                      </div>
                      <div className="rounded-3xl p-6" style={{ background: preview.brandCanvas }}>
                        <div className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: preview.brandTextMuted }}>Canvas Preview</div>
                        <div className="rounded-2xl p-4" style={{ background: preview.brandSurface, border: `1px solid ${preview.brandBorder}` }}>
                          <div className="text-3xl" style={{ color: preview.brandText, fontFamily: preview.fontDisplay }}>Card On Canvas</div>
                          <div className="text-sm mt-1" style={{ color: preview.brandTextMuted, fontFamily: preview.fontBody }}>
                            This is how the admin and light website surfaces will feel.
                          </div>
                        </div>
                      </div>
                      <div className="rounded-3xl p-6" style={{ background: preview.brandSurface, border: `1px solid ${preview.brandBorder}` }}>
                        <div className="text-sm uppercase tracking-[0.2em] mb-3" style={{ color: preview.brandTextMuted }}>Derived Colors</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl h-12" style={{ background: preview.brandAccentHover }} />
                          <div className="rounded-2xl h-12" style={{ background: preview.brandSecondaryFill }} />
                          <div className="rounded-2xl h-12" style={{ background: preview.brandCanvasSoft }} />
                          <div className="rounded-2xl h-12" style={{ background: preview.brandSurfaceSoft, border: `1px solid ${preview.brandBorder}` }} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </SectionCard>

              <SectionCard title="Advanced Colors" description="Optional overrides for special theme areas. Leave these blank to keep using the derived defaults from your main four colors.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <OptionalColorField
                    label="Eco Green"
                    value={settingsDraft.styles.ecoGreen || ""}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, ecoGreen: value },
                      })
                    }
                  />
                  <OptionalColorField
                    label="Footer Background"
                    value={settingsDraft.styles.footerBackground || ""}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, footerBackground: value },
                      })
                    }
                  />
                  <OptionalColorField
                    label="Hero Overlay"
                    value={settingsDraft.styles.heroOverlay || ""}
                    onChange={(value) =>
                      setSettingsDraft({
                        ...settingsDraft,
                        styles: { ...settingsDraft.styles, heroOverlay: value },
                      })
                    }
                  />
                </div>

                {(() => {
                  const preview = getThemeColors(settingsDraft.styles);
                  return (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="rounded-3xl p-6 text-white" style={{ background: preview.brandEco }}>
                        <div className="text-sm uppercase tracking-[0.2em] opacity-80 mb-3">Eco</div>
                        <div className="font-semibold">Eco surfaces and badges</div>
                      </div>
                      <div className="rounded-3xl p-6 text-white" style={{ background: preview.brandFooterBackground }}>
                        <div className="text-sm uppercase tracking-[0.2em] opacity-80 mb-3">Footer</div>
                        <div className="font-semibold">Footer and dark utility sections</div>
                      </div>
                      <div className="rounded-3xl p-6 text-white relative overflow-hidden" style={{ background: preview.brandBrown }}>
                        <div className="absolute inset-0" style={{ background: preview.brandBrownOverlay }} />
                        <div className="relative z-10">
                          <div className="text-sm uppercase tracking-[0.2em] opacity-80 mb-3">Overlay</div>
                          <div className="font-semibold">Image hero overlay tint</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </SectionCard>

            </div>
          ) : null}

          {section === "pages" ? (
            <div className="grid grid-cols-[280px_1fr] gap-6">
              <div className="md:col-span-2">
                <SectionIntro
                  title={ADMIN_SECTION_META.pages.title}
                  description={ADMIN_SECTION_META.pages.description}
                  accent={
                    <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-secondary-fill)]">
                          <SquareStack className="h-5 w-5" />
                        </div>
                        <div className="text-sm text-[var(--brand-text-muted)]">
                          Pick a page from the left, then edit just that page’s content on the right.
                        </div>
                      </div>
                    </div>
                  }
                />
              </div>
              <SelectionPanel
                title="Page List"
                description="Choose a website page to edit."
              >
                {pagesDraft.map((page) => (
                  <button
                    key={page.slug}
                    onClick={() => setSelectedPageSlug(page.slug)}
                    className={`w-full text-left px-4 py-3 rounded-2xl ${
                      selectedPageSlug === page.slug ? "bg-[var(--brand-brown)] text-white" : "bg-[var(--brand-surface)]"
                    }`}
                  >
                    {getPageTitle(page.slug)}
                  </button>
                ))}
              </SelectionPanel>

              {selectedPage ? (
                <div className="space-y-6">
                  {currentGuide ? (
                    <WorkspaceGuideCard
                      key={`guide-${section}-${selectedPage.slug}`}
                      title={currentGuide.title}
                      description={currentGuide.description}
                      hints={currentGuide.hints}
                      links={currentGuide.links}
                      note={currentGuide.note}
                    />
                  ) : null}
                  {renderPageEditor(
                    selectedPage,
                    (nextPage) => {
                      setPagesDraft((current) =>
                        current.map((page) => (page.slug === nextPage.slug ? nextPage : page)),
                      );
                    },
                    openIconPicker,
                    openImagePicker,
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "services" ? (
            <div className="grid grid-cols-[280px_1fr] gap-6">
              <div className="md:col-span-2">
                <SectionIntro
                  title={ADMIN_SECTION_META.services.title}
                  description={ADMIN_SECTION_META.services.description}
                  accent={
                    <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs text-sm text-[var(--brand-text-muted)]">
                      Drag services in the left column to reorder them, then save the order once you are happy.
                    </div>
                  }
                />
              </div>
              <SelectionPanel
                title="Service List"
                description="Choose a service to edit, or add a new one."
                actions={
                  <button
                    onClick={() => {
                      const linkName = `service-${Date.now()}`;
                      const fresh: ServiceDetail = {
                        id: linkName,
                        sortOrder: servicesDraft.length + 1,
                        label: "New Service",
                        title: "New Service",
                        description: "",
                        image: "",
                        heroImage: "",
                        detailImage: "",
                        isEcoFriendly: true,
                        showOnHome: true,
                        items: [],
                      };
                      setServicesDraft((current) => [...current, fresh]);
                      setSelectedServiceId(fresh.id);
                    }}
                    className="px-4 py-2 rounded-2xl bg-[var(--brand-secondary-fill)] text-left text-sm"
                  >
                    + Add
                  </button>
                }
              >
                <div className="px-1 pb-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-text-soft)]">
                  Reorder services
                </div>
                {servicesDraft.map((service) => (
                  <button
                    key={service.id}
                    draggable
                    onClick={() => setSelectedServiceId(service.id)}
                    onDragStart={(event) => event.dataTransfer.setData("text/service-id", service.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      moveService(event.dataTransfer.getData("text/service-id"), service.id);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl ${
                      selectedServiceId === service.id ? "bg-[var(--brand-brown)] text-white" : "bg-[var(--brand-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{service.title}</span>
                      <GripVertical className="w-4 h-4 opacity-70 shrink-0" />
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!token || savingOrder === "services"}
                  onClick={async () => {
                    if (!token) return;
                    setSavingOrder("services");
                    try {
                      const saved = await reorderAdminServices(token, servicesDraft.map((service) => service.id));
                      setServicesDraft(saved);
                      flashStatus("Service order saved");
                    } catch (error) {
                      alert(error instanceof Error ? error.message : "Failed to save service order");
                    } finally {
                      setSavingOrder(null);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
                >
                  {savingOrder === "services" ? "Saving Order..." : "Save Service Order"}
                </button>
              </SelectionPanel>

              {selectedService ? (
                <div className="space-y-6">
                  {currentGuide ? (
                    <WorkspaceGuideCard
                      key={`guide-${section}-${selectedService.id}`}
                      title={currentGuide.title}
                      description={currentGuide.description}
                      hints={currentGuide.hints}
                      links={currentGuide.links}
                      note={currentGuide.note}
                    />
                  ) : null}
                  <SectionCard title="Service Details" description="Basic details for this service card and detail page. The link name is created automatically for new services, and you can change it if needed.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Link Name" value={selectedService.id} disabled={!isNewService} onChange={(value) => {
                        setServicesDraft((current) =>
                          current.map((service) =>
                            service.id === selectedService.id ? { ...service, id: toLinkName(value) } : service,
                          ),
                        );
                        if (selectedServiceId === selectedService.id) {
                          setSelectedServiceId(toLinkName(value));
                        }
                      }} />
                      <Field label="Short Menu Label" value={selectedService.label} onChange={(value) => {
                        setServicesDraft((current) =>
                          current.map((service) => service.id === selectedService.id ? { ...service, label: value } : service),
                        );
                      }} />
                      <Field label="Service Title" value={selectedService.title} onChange={(value) => {
                        setServicesDraft((current) =>
                          current.map((service) => {
                            if (service.id !== selectedService.id) return service;
                            const nextLinkName =
                              isNewService && (!service.id || service.id.startsWith("service-"))
                                ? toLinkName(value) || service.id
                                : service.id;
                            return { ...service, title: value, id: nextLinkName };
                          }),
                        );
                        if (
                          isNewService &&
                          selectedServiceId === selectedService.id &&
                          (!selectedService.id || selectedService.id.startsWith("service-"))
                        ) {
                          setSelectedServiceId(toLinkName(value) || selectedService.id);
                        }
                      }} />
                    </div>
                    <div className="mt-4">
                      <TextAreaField label="Service Description" value={selectedService.description} onChange={(value) => {
                        setServicesDraft((current) =>
                          current.map((service) => service.id === selectedService.id ? { ...service, description: value } : service),
                        );
                      }} rows={5} />
                    </div>
                    <label className="flex items-center gap-3 mt-4">
                      <input
                        type="checkbox"
                        checked={selectedService.isEcoFriendly}
                        onChange={(e) =>
                          setServicesDraft((current) =>
                            current.map((service) =>
                              service.id === selectedService.id ? { ...service, isEcoFriendly: e.target.checked } : service,
                            ),
                          )
                        }
                      />
                      Eco-friendly service
                    </label>
                    <label className="flex items-center gap-3 mt-4">
                      <input
                        type="checkbox"
                        checked={selectedService.showOnHome !== false}
                        onChange={(e) =>
                          setServicesDraft((current) =>
                            current.map((service) =>
                              service.id === selectedService.id ? { ...service, showOnHome: e.target.checked } : service,
                            ),
                          )
                        }
                      />
                      Show this service on the landing page selector
                    </label>
                  </SectionCard>

                  <SectionCard
                    title="Service Images"
                    description="Choose the images used for the service card, the top hero area, and the inner detail section."
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ImagePickerField label="Preview Image" value={selectedService.image} onPick={() => {
                        openImagePicker("Choose service preview image", selectedService.image, (value) => {
                          setServicesDraft((current) =>
                            current.map((service) => service.id === selectedService.id ? { ...service, image: value } : service),
                          );
                        });
                      }} />
                      <ImagePickerField label="Hero Image" value={selectedService.heroImage} onPick={() => {
                        openImagePicker("Choose service hero image", selectedService.heroImage, (value) => {
                          setServicesDraft((current) =>
                            current.map((service) => service.id === selectedService.id ? { ...service, heroImage: value } : service),
                          );
                        });
                      }} />
                      <ImagePickerField label="Detail Image" value={selectedService.detailImage} onPick={() => {
                        openImagePicker("Choose service detail image", selectedService.detailImage, (value) => {
                          setServicesDraft((current) =>
                            current.map((service) => service.id === selectedService.id ? { ...service, detailImage: value } : service),
                          );
                        });
                      }} />
                    </div>
                  </SectionCard>

                  <SectionCard title="Service Detail Items" description="Detailed points shown inside the service detail page.">
                    <div className="space-y-4">
                      {selectedService.items.map((item, index) => (
                        <CollapsibleEditorCard
                          key={index}
                          title={item.title?.trim() || `Detail Item ${index + 1}`}
                          summary={getEditorSummary(
                            [item.description],
                            "Open to edit this service detail item.",
                          )}
                          defaultOpen={index === 0}
                        >
                          <Field label="Item Title" value={item.title} onChange={(value) => {
                            setServicesDraft((current) =>
                              current.map((service) =>
                                service.id === selectedService.id
                                  ? {
                                      ...service,
                                      items: service.items.map((currentItem, itemIndex) =>
                                        itemIndex === index ? { ...currentItem, title: value } : currentItem,
                                      ),
                                    }
                                  : service,
                              ),
                            );
                          }} />
                          <TextAreaField label="Item Description" value={item.description} onChange={(value) => {
                            setServicesDraft((current) =>
                              current.map((service) =>
                                service.id === selectedService.id
                                  ? {
                                      ...service,
                                      items: service.items.map((currentItem, itemIndex) =>
                                        itemIndex === index ? { ...currentItem, description: value } : currentItem,
                                      ),
                                    }
                                  : service,
                              ),
                            );
                          }} />
                          <button className="px-4 py-2 rounded-xl bg-[var(--brand-secondary-fill)]" onClick={() => {
                            setServicesDraft((current) =>
                              current.map((service) =>
                                service.id === selectedService.id
                                  ? { ...service, items: service.items.filter((_, itemIndex) => itemIndex !== index) }
                                  : service,
                              ),
                            );
                          }}>
                            Remove Item
                          </button>
                        </CollapsibleEditorCard>
                      ))}
                    </div>
                    <button className="mt-4 px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white" onClick={() => {
                      setServicesDraft((current) =>
                        current.map((service) =>
                          service.id === selectedService.id
                            ? { ...service, items: [...service.items, { title: "", description: "" }] }
                            : service,
                        ),
                      );
                    }}>
                      Add Service Item
                    </button>
                  </SectionCard>

                </div>
              ) : null}
            </div>
          ) : null}

          {section === "blog" ? (
            <div className="grid grid-cols-[280px_1fr] gap-6">
              <div className="md:col-span-2">
                <SectionIntro
                  title={ADMIN_SECTION_META.blog.title}
                  description={ADMIN_SECTION_META.blog.description}
                  accent={
                    <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs text-sm text-[var(--brand-text-muted)]">
                      Keep this area simple: each post here controls one blog card on the public site.
                    </div>
                  }
                />
              </div>
              <SelectionPanel
                title="Blog Post List"
                description="Choose a post card to edit, or add a new one."
                actions={
                  <button
                    onClick={() => {
                      const linkName = `post-${Date.now()}`;
                      const fresh = {
                        slug: linkName,
                        title: "New Post",
                        image: "",
                        excerpt: "",
                        category: "General",
                        dateLabel: new Date().toLocaleDateString(),
                        author: "Admin",
                        readTime: "5 min read",
                        sortOrder: postsDraft.length + 1,
                      };
                      setPostsDraft((current) => [...current, fresh]);
                      setSelectedPostSlug(fresh.slug);
                    }}
                    className="px-4 py-2 rounded-2xl bg-[var(--brand-secondary-fill)] text-left text-sm"
                  >
                    + Add
                  </button>
                }
              >
                <div className="px-1 pb-2 text-xs uppercase tracking-[0.2em] text-[var(--brand-text-soft)]">
                  Reorder blog posts
                </div>
                {postsDraft.map((post) => (
                  <button
                    key={post.slug}
                    draggable
                    onClick={() => setSelectedPostSlug(post.slug)}
                    onDragStart={(event) => event.dataTransfer.setData("text/post-slug", post.slug)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      movePost(event.dataTransfer.getData("text/post-slug"), post.slug);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl ${
                      selectedPostSlug === post.slug ? "bg-[var(--brand-brown)] text-white" : "bg-[var(--brand-surface)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span>{post.title}</span>
                      <GripVertical className="w-4 h-4 opacity-70 shrink-0" />
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!token || savingOrder === "blog"}
                  onClick={async () => {
                    if (!token) return;
                    setSavingOrder("blog");
                    try {
                      const saved = await reorderAdminBlogPosts(token, postsDraft.map((post) => post.slug));
                      setPostsDraft(saved);
                      flashStatus("Blog post order saved");
                    } catch (error) {
                      alert(error instanceof Error ? error.message : "Failed to save blog order");
                    } finally {
                      setSavingOrder(null);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
                >
                  {savingOrder === "blog" ? "Saving Order..." : "Save Blog Order"}
                </button>
              </SelectionPanel>

              {selectedPost ? (
                <div className="space-y-6">
                  {currentGuide ? (
                    <WorkspaceGuideCard
                      key={`guide-${section}-${selectedPost.slug}`}
                      title={currentGuide.title}
                      description={currentGuide.description}
                      hints={currentGuide.hints}
                      links={currentGuide.links}
                      note={currentGuide.note}
                    />
                  ) : null}
                  <SectionCard title="Blog Post Details" description="Edit the visible details and cover image for this blog card. The page link name is created automatically for new posts.">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Page Link Name" value={selectedPost.slug} disabled={!isNewPost} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, slug: toLinkName(value) } : post),
                        );
                        if (selectedPostSlug === selectedPost.slug) {
                          setSelectedPostSlug(toLinkName(value));
                        }
                      }} />
                      <Field label="Title" value={selectedPost.title} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => {
                            if (post.slug !== selectedPost.slug) return post;
                            const nextLinkName =
                              isNewPost && (!post.slug || post.slug.startsWith("post-"))
                                ? toLinkName(value) || post.slug
                                : post.slug;
                            return { ...post, title: value, slug: nextLinkName };
                          }),
                        );
                        if (
                          isNewPost &&
                          selectedPostSlug === selectedPost.slug &&
                          (!selectedPost.slug || selectedPost.slug.startsWith("post-"))
                        ) {
                          setSelectedPostSlug(toLinkName(value) || selectedPost.slug);
                        }
                      }} />
                      <Field label="Category" value={selectedPost.category} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, category: value } : post),
                        );
                      }} />
                      <Field label="Displayed Date" value={selectedPost.dateLabel} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, dateLabel: value } : post),
                        );
                      }} />
                      <Field label="Author Name" value={selectedPost.author} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, author: value } : post),
                        );
                      }} />
                      <Field label="Reading Time" value={selectedPost.readTime} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, readTime: value } : post),
                        );
                      }} />
                      <Field label="Order on Page" value={selectedPost.sortOrder} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, sortOrder: Number(value || 0) } : post),
                        );
                      }} />
                    </div>
                    <div className="mt-4 max-w-md">
                      <ImagePickerField label="Blog Card Image" value={selectedPost.image || ""} onPick={() => {
                        openImagePicker("Choose blog card image", selectedPost.image || "", (value) => {
                          setPostsDraft((current) =>
                            current.map((post) => post.slug === selectedPost.slug ? { ...post, image: value } : post),
                          );
                        });
                      }} />
                    </div>
                    <div className="mt-4">
                      <TextAreaField label="Short Summary / Excerpt" value={selectedPost.excerpt} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, excerpt: value } : post),
                        );
                      }} rows={6} />
                    </div>
                  </SectionCard>

                </div>
              ) : null}
            </div>
          ) : null}

          {section === "images" ? (
            <div className="space-y-6">
              <SectionIntro
                title={ADMIN_SECTION_META.images.title}
                description={ADMIN_SECTION_META.images.description}
                accent={
                  <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs">
                    <div className="flex items-center gap-3 text-sm text-[var(--brand-text-muted)]">
                      <ImageIcon className="h-5 w-5" />
                      Reuse one image library everywhere instead of uploading the same image repeatedly.
                    </div>
                  </div>
                }
              />
              <SectionCard
                title="Image Library"
                description="Upload, rename, and reuse images across the website. These images are available in every image picker."
              >
                <div className="flex flex-wrap gap-3">
                  <label className="px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white cursor-pointer">
                    Upload Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (event) => {
                        const files = Array.from(event.target.files || []);
                        try {
                          for (const file of files) {
                            await handleImageUpload(file);
                          }
                        } catch (error) {
                          alert(error instanceof Error ? error.message : "Failed to upload image");
                        } finally {
                          event.currentTarget.value = "";
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!token) return;
                      try {
                        const imported = await importExistingAdminImages(token);
                        setImageAssetsDraft(imported);
                        await refreshAdminData(token);
                        flashStatus("Existing website images imported");
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Failed to import existing images");
                      }
                    }}
                    className="px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]"
                  >
                    Import Existing Website Images
                  </button>
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {imageAssetsDraft.map((asset) => (
                  <div key={asset.id} className="bg-[var(--brand-surface)] rounded-3xl border border-[var(--brand-border)] p-4 space-y-4">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--brand-canvas)] border border-[var(--brand-border)]">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--brand-text-soft)] mb-1">Image Name</div>
                      <input
                        value={asset.name}
                        onChange={(event) =>
                          setImageAssetsDraft((current) =>
                            current.map((item) =>
                              item.id === asset.id ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
                      />
                    </div>
                    <div className="text-sm text-[var(--brand-text-muted)] break-all">{asset.url}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[var(--brand-text-soft)]">
                      {formatBytes(asset.sizeBytes)}
                    </div>
                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!token) return;
                          try {
                            const renamed = await renameAdminImage(token, asset.id, asset.name);
                            setImageAssetsDraft(renamed);
                            flashStatus("Image name updated");
                          } catch (error) {
                            alert(error instanceof Error ? error.message : "Failed to rename image");
                          }
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-[var(--brand-brown)] text-white"
                      >
                        Save Image Name
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openImageDeleteDialog(asset);
                        }}
                        className="w-full px-4 py-3 rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)]"
                      >
                        Delete Or Replace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {section === "backups" ? (
            <div className="space-y-6">
              <SectionIntro
                title={ADMIN_SECTION_META.backups.title}
                description={ADMIN_SECTION_META.backups.description}
                accent={
                  <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs text-sm text-[var(--brand-text-muted)]">
                    Use exports before making major changes so you always have a restore point.
                  </div>
                }
              />
              <SectionCard
                title="Export Backup"
                description="Create a zip archive containing the SQL dump and all uploaded images."
              >
                <button
                  type="button"
                  disabled={!token || backupBusy !== null}
                  onClick={async () => {
                    if (!token) return;
                    setBackupBusy("export");
                    try {
                      const backup = await exportAdminBackup(token);
                      const url = URL.createObjectURL(backup.blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = backup.fileName;
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      URL.revokeObjectURL(url);
                      flashStatus("Backup exported");
                    } catch (error) {
                      alert(error instanceof Error ? error.message : "Failed to export backup");
                    } finally {
                      setBackupBusy(null);
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-[var(--brand-brown)] text-white disabled:opacity-60"
                >
                  {backupBusy === "export" ? "Preparing Backup..." : "Export Backup Zip"}
                </button>
              </SectionCard>

              <SectionCard
                title="Import Backup"
                description="Restore the SQL dump and uploaded images from a backup zip. This will overwrite current CMS data and image library contents."
              >
                <label className="inline-flex px-6 py-3 rounded-2xl bg-[var(--brand-secondary-fill)] text-[var(--brand-text)] cursor-pointer">
                  {backupBusy === "import" ? "Importing Backup..." : "Choose Backup Zip"}
                  <input
                    type="file"
                    accept=".zip,application/zip"
                    className="hidden"
                    disabled={!token || backupBusy !== null}
                    onChange={async (event) => {
                      const input = event.currentTarget;
                      const file = input.files?.[0];
                      if (!file || !token) return;
                      if (!window.confirm("Importing a backup will replace the current database content and uploaded images. Continue?")) {
                        input.value = "";
                        return;
                      }
                      setBackupBusy("import");
                      try {
                        const restored = await importAdminBackup(token, file);
                        applyBootstrapData(restored);
                        flashStatus("Backup imported");
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Failed to import backup");
                      } finally {
                        setBackupBusy(null);
                        input.value = "";
                      }
                    }}
                  />
                </label>
                <p className="text-sm text-[var(--brand-text-muted)] mt-4">
                  Expected archive contents: <code>backup.sql</code>, <code>manifest.json</code>, and an <code>uploads/</code> folder.
                </p>
              </SectionCard>
            </div>
          ) : null}

          {section === "password" ? (
            <div className="space-y-6">
              <SectionIntro
                title={ADMIN_SECTION_META.password.title}
                description={ADMIN_SECTION_META.password.description}
                accent={
                  <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface-soft)] px-5 py-4 max-w-xs">
                    <div className="flex items-center gap-3 text-sm text-[var(--brand-text-muted)]">
                      <Lock className="h-5 w-5" />
                      Keep this password memorable for staff, but strong enough to protect the CMS.
                    </div>
                  </div>
                }
              />
              <div className="max-w-xl bg-[var(--brand-surface)] rounded-3xl border border-[var(--brand-border)] p-6 shadow-sm">
                <h2 className="text-2xl mb-5">Change Admin Password</h2>
                <div className="space-y-4">
                  <Field label="Current Password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} type="password" />
                  <Field label="New Password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} type="password" />
                  <Field label="Confirm New Password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} type="password" />
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {iconPicker ? (
        <ModalShell title={iconPicker.title} onClose={() => setIconPicker(null)}>
          <Suspense fallback={<div className="text-sm text-[var(--brand-text-muted)]">Loading icon library...</div>}>
            <LazyAdminIconPickerModalContent
              currentValue={iconPicker.currentValue}
              onSelect={(value) => {
                iconPicker.onSelect(value);
                setIconPicker(null);
              }}
            />
          </Suspense>
        </ModalShell>
      ) : null}

      {imagePicker ? (
        <ModalShell title={imagePicker.title} onClose={() => setImagePicker(null)}>
          <ImagePickerModalContent
            assets={imageAssetsDraft}
            currentValue={imagePicker.currentValue}
            onSelect={(value) => {
              imagePicker.onSelect(value);
              setImagePicker(null);
            }}
            onUpload={async (file) => {
              await handleImageUpload(file, (asset) => {
                imagePicker.onSelect(asset.url);
                setImagePicker(null);
              });
            }}
          />
        </ModalShell>
      ) : null}

      {imageDeleteDialog ? (
        <ModalShell
          title={`Delete Or Replace: ${imageDeleteDialog.asset.name}`}
          onClose={() => {
            if (!imageDeleteDialog.deleting) {
              setImageDeleteDialog(null);
            }
          }}
        >
          <ImageDeleteModalContent
            key={imageDeleteDialog.asset.id}
            asset={imageDeleteDialog.asset}
            usages={imageDeleteDialog.usages}
            loading={imageDeleteDialog.loading}
            deleting={imageDeleteDialog.deleting}
            error={imageDeleteDialog.error}
            replacementAssets={imageAssetsDraft.filter(
              (asset) => asset.id !== imageDeleteDialog.asset.id,
            )}
            selectedReplacementId={imageDeleteDialog.selectedReplacementId}
            onSelectReplacement={(id) => {
              setImageDeleteDialog((current) =>
                current
                  ? {
                      ...current,
                      selectedReplacementId: id,
                    }
                  : current,
              );
            }}
            onUploadReplacement={async (file) => {
              await handleImageUpload(file, (asset) => {
                setImageDeleteDialog((current) =>
                  current
                    ? {
                        ...current,
                        selectedReplacementId: asset.id,
                      }
                    : current,
                );
              });
            }}
            onDelete={handleDeleteImage}
          />
        </ModalShell>
      ) : null}
    </div>
  );
}
