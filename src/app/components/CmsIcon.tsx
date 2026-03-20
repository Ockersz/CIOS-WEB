import type { LucideIcon, LucideProps } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";

type CmsIconProps = Omit<LucideProps, "ref"> & {
  name?: string | null;
  fallback?: LucideIcon;
};

function normalizeCmsIconName(name?: string | null) {
  if (!name) return "";

  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

export function CmsIcon({
  name,
  fallback: Fallback,
  ...props
}: CmsIconProps) {
  const normalizedName = normalizeCmsIconName(name);
  const FallbackIcon = Fallback ? () => <Fallback {...props} /> : undefined;

  if (!normalizedName) {
    return Fallback ? <Fallback {...props} /> : null;
  }

  return (
    <DynamicIcon
      name={normalizedName as never}
      fallback={FallbackIcon}
      {...props}
    />
  );
}
