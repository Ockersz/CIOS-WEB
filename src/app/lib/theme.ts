export interface ThemeColors {
  brandBrown: string;
  brandAccent: string;
  brandCanvas: string;
  brandSurface: string;
  typographyPreset?: string;
  ecoGreen?: string;
  footerBackground?: string;
  heroOverlay?: string;
}

export const TYPOGRAPHY_PRESETS = {
  "classic-editorial": {
    label: "Classic Editorial",
    display: '"Cormorant Garamond", serif',
    body: '"Manrope", sans-serif',
  },
  "modern-luxury": {
    label: "Modern Luxury",
    display: '"Fraunces", serif',
    body: '"Instrument Sans", sans-serif',
  },
  "heritage-formal": {
    label: "Heritage Formal",
    display: '"Playfair Display", serif',
    body: '"Source Sans 3", sans-serif',
  },
} as const;

export type TypographyPresetKey = keyof typeof TYPOGRAPHY_PRESETS;

function normalizeTypographyPreset(value?: string): TypographyPresetKey {
  return value && value in TYPOGRAPHY_PRESETS
    ? (value as TypographyPresetKey)
    : "classic-editorial";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(hex: string, fallback: string) {
  return /^#([0-9a-f]{6})$/i.test(hex) ? hex.toLowerCase() : fallback;
}

function normalizeOptionalHex(hex?: string) {
  return /^#([0-9a-f]{6})$/i.test(hex || "") ? String(hex).toLowerCase() : "";
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mix(hex: string, target: string, amount: number) {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  return rgbToHex(
    from.r + (to.r - from.r) * amount,
    from.g + (to.g - from.g) * amount,
    from.b + (to.b - from.b) * amount,
  );
}

function toRgbAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}

export function getThemeColors(input?: Partial<ThemeColors>) {
  const brandBrown = normalizeHex(input?.brandBrown || "", "#2f120c");
  const brandAccent = normalizeHex(input?.brandAccent || "", "#f4c430");
  const brandCanvas = normalizeHex(input?.brandCanvas || "", "#f7f1e7");
  const brandSurface = normalizeHex(input?.brandSurface || "", "#fffaf2");
  const typographyPreset = normalizeTypographyPreset(input?.typographyPreset);
  const typography = TYPOGRAPHY_PRESETS[typographyPreset];
  const ecoGreenOverride = normalizeOptionalHex(input?.ecoGreen);
  const footerBackgroundOverride = normalizeOptionalHex(input?.footerBackground);
  const heroOverlayOverride = normalizeOptionalHex(input?.heroOverlay);
  const ecoGreen = ecoGreenOverride || "#2f7a4a";
  const footerBackground = footerBackgroundOverride || mix(brandBrown, "#000000", 0.3);
  const heroOverlay = heroOverlayOverride || brandBrown;

  return {
    brandBrown,
    brandAccent,
    brandCanvas,
    brandSurface,
    typographyPreset,
    fontDisplay: typography.display,
    fontBody: typography.body,
    ecoGreen: ecoGreenOverride,
    footerBackground: footerBackgroundOverride,
    heroOverlay: heroOverlayOverride,
    brandBrownSoft: mix(brandBrown, "#ffffff", 0.12),
    brandBrownOverlay: toRgbAlpha(heroOverlay, 0.6),
    brandBrownMuted: toRgbAlpha(brandBrown, 0.8),
    brandAccentHover: mix(brandAccent, "#000000", 0.08),
    brandAccentSoft: toRgbAlpha(brandAccent, 0.2),
    brandAccentStrong: toRgbAlpha(brandAccent, 0.9),
    brandCanvasSoft: mix(brandCanvas, "#ffffff", 0.3),
    brandSurfaceSoft: mix(brandSurface, "#ffffff", 0.18),
    brandBorder: mix(brandCanvas, brandBrown, 0.18),
    brandBorderStrong: mix(brandCanvas, brandBrown, 0.28),
    brandText: mix(brandBrown, "#000000", 0.2),
    brandTextMuted: mix(brandBrown, "#ffffff", 0.28),
    brandTextSoft: mix(brandBrown, "#ffffff", 0.42),
    brandSecondaryFill: mix(brandCanvas, brandAccent, 0.38),
    brandSecondaryFillHover: mix(brandCanvas, brandAccent, 0.52),
    brandEco: ecoGreen,
    brandEcoHover: mix(ecoGreen, "#000000", 0.1),
    brandEcoSoft: toRgbAlpha(ecoGreen, 0.18),
    brandEcoStrong: toRgbAlpha(ecoGreen, 0.95),
    brandEcoText: mix(ecoGreen, "#000000", 0.35),
    brandFooterBackground: footerBackground,
  };
}

export function applyThemeColors(themeInput?: Partial<ThemeColors>) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const theme = getThemeColors(themeInput);
  root.style.setProperty("--brand-brown", theme.brandBrown);
  root.style.setProperty("--font-display", theme.fontDisplay);
  root.style.setProperty("--font-body", theme.fontBody);
  root.style.setProperty("--brand-brown-soft", theme.brandBrownSoft);
  root.style.setProperty("--brand-brown-overlay", theme.brandBrownOverlay);
  root.style.setProperty("--brand-brown-muted", theme.brandBrownMuted);
  root.style.setProperty("--brand-accent", theme.brandAccent);
  root.style.setProperty("--brand-accent-hover", theme.brandAccentHover);
  root.style.setProperty("--brand-accent-soft", theme.brandAccentSoft);
  root.style.setProperty("--brand-accent-strong", theme.brandAccentStrong);
  root.style.setProperty("--brand-canvas", theme.brandCanvas);
  root.style.setProperty("--brand-canvas-soft", theme.brandCanvasSoft);
  root.style.setProperty("--brand-surface", theme.brandSurface);
  root.style.setProperty("--brand-surface-soft", theme.brandSurfaceSoft);
  root.style.setProperty("--brand-border", theme.brandBorder);
  root.style.setProperty("--brand-border-strong", theme.brandBorderStrong);
  root.style.setProperty("--brand-text", theme.brandText);
  root.style.setProperty("--brand-text-muted", theme.brandTextMuted);
  root.style.setProperty("--brand-text-soft", theme.brandTextSoft);
  root.style.setProperty("--brand-secondary-fill", theme.brandSecondaryFill);
  root.style.setProperty("--brand-secondary-fill-hover", theme.brandSecondaryFillHover);
  root.style.setProperty("--brand-eco", theme.brandEco);
  root.style.setProperty("--brand-eco-hover", theme.brandEcoHover);
  root.style.setProperty("--brand-eco-soft", theme.brandEcoSoft);
  root.style.setProperty("--brand-eco-strong", theme.brandEcoStrong);
  root.style.setProperty("--brand-eco-text", theme.brandEcoText);
  root.style.setProperty("--brand-footer-background", theme.brandFooterBackground);
}
