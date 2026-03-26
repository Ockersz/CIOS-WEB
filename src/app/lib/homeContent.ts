import defaultAfterImage from "../../assets/11216e21214150f3e7991c8dc0ef75882077e7c7.webp";
import defaultBeforeImage from "../../assets/373cecb1e82884e5333e7b3f0bbc95be03484f17.webp";

export type HomeBeforeAfterFeature = {
  title: string;
};

export type HomeBeforeAfterImage = {
  src: string;
  alt: string;
};

export type HomeBeforeAfterSection = {
  eyebrow: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  dragInstruction: string;
  features: HomeBeforeAfterFeature[];
  beforeImage: HomeBeforeAfterImage;
  afterImage: HomeBeforeAfterImage;
};

export const DEFAULT_HOME_BEFORE_AFTER_SECTION: HomeBeforeAfterSection = {
  eyebrow: "DARE TO DAZZLING",
  title: "Amazing Evolution of\nYour Office & Your Home",
  beforeLabel: "Before",
  afterLabel: "After",
  dragInstruction: "Drag to compare",
  features: [
    { title: "Deep Cleaning Magic" },
    { title: "Tailored Solutions" },
    { title: "Sustainable Cleanliness" },
    { title: "Quick and Efficient" },
  ],
  beforeImage: {
    src: defaultBeforeImage,
    alt: "Before cleaning",
  },
  afterImage: {
    src: defaultAfterImage,
    alt: "After cleaning",
  },
};

function normalizeImage(
  input: Partial<HomeBeforeAfterImage> | string | null | undefined,
  fallback: HomeBeforeAfterImage,
): HomeBeforeAfterImage {
  if (typeof input === "string") {
    return {
      src: input.trim() || fallback.src,
      alt: fallback.alt,
    };
  }

  return {
    src:
      typeof input?.src === "string" && input.src.trim()
        ? input.src
        : fallback.src,
    alt: typeof input?.alt === "string" ? input.alt : fallback.alt,
  };
}

export function normalizeHomeBeforeAfterSection(
  input?: Partial<HomeBeforeAfterSection> | null,
): HomeBeforeAfterSection {
  const rawFeatures = Array.isArray(input?.features) ? input.features : [];

  return {
    eyebrow:
      typeof input?.eyebrow === "string"
        ? input.eyebrow
        : DEFAULT_HOME_BEFORE_AFTER_SECTION.eyebrow,
    title:
      typeof input?.title === "string"
        ? input.title
        : DEFAULT_HOME_BEFORE_AFTER_SECTION.title,
    beforeLabel:
      typeof input?.beforeLabel === "string"
        ? input.beforeLabel
        : DEFAULT_HOME_BEFORE_AFTER_SECTION.beforeLabel,
    afterLabel:
      typeof input?.afterLabel === "string"
        ? input.afterLabel
        : DEFAULT_HOME_BEFORE_AFTER_SECTION.afterLabel,
    dragInstruction:
      typeof input?.dragInstruction === "string"
        ? input.dragInstruction
        : DEFAULT_HOME_BEFORE_AFTER_SECTION.dragInstruction,
    features: DEFAULT_HOME_BEFORE_AFTER_SECTION.features.map((feature, index) => ({
      title:
        typeof rawFeatures[index]?.title === "string"
          ? rawFeatures[index].title
          : feature.title,
    })),
    beforeImage: normalizeImage(
      input?.beforeImage,
      DEFAULT_HOME_BEFORE_AFTER_SECTION.beforeImage,
    ),
    afterImage: normalizeImage(
      input?.afterImage,
      DEFAULT_HOME_BEFORE_AFTER_SECTION.afterImage,
    ),
  };
}
