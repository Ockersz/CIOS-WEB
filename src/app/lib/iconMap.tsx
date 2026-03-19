import type { ComponentType } from "react";
import * as LucideIcons from "lucide-react";

type IconComponent = ComponentType<{ className?: string; size?: number | string }>;

function isIconExport(value: unknown, key: string): value is IconComponent {
  return (
    !!value &&
    /^[A-Z]/.test(key) &&
    !key.endsWith("Icon") &&
    !key.startsWith("Lucide") &&
    key !== "Icon" &&
    key !== "createLucideIcon"
  );
}

export const iconMap = Object.fromEntries(
  Object.entries(LucideIcons)
    .filter(([key, value]) => isIconExport(value, key))
    .sort(([a], [b]) => a.localeCompare(b)),
) as Record<string, IconComponent>;

export const iconOptions = Object.keys(iconMap);
export const fallbackIconName =
  iconMap.CircleHelp ? "CircleHelp" : iconOptions[0];

export function getIconComponent(name?: string) {
  return iconMap[name || ""] || iconMap[fallbackIconName];
}
