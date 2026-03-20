import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Award,
  Building2,
  Car,
  CircleHelp,
  Clock,
  Droplets,
  Factory,
  Heart,
  Home,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

const siteIconMap = {
  Award,
  Building2,
  Car,
  Clock,
  Droplets,
  Factory,
  Heart,
  Home,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} satisfies Record<string, LucideIcon>;

export function SiteIcon({
  name,
  fallback: Fallback = CircleHelp,
  ...props
}: Omit<LucideProps, "ref"> & {
  name?: string | null;
  fallback?: LucideIcon;
}) {
  const Icon = siteIconMap[name || ""] || Fallback;
  return <Icon {...props} />;
}
