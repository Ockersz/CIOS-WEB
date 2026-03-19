import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export interface CmsPage<T = any> {
  slug: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  content: T;
}

export interface SiteSettings {
  business: {
    name: string;
    shortDescription: string;
    addressLines: string[];
    locationLabel: string;
    phoneDisplay: string;
    phoneHref: string;
    email: string;
    hours: string[];
    linkedinUrl: string;
    copyrightName: string;
  };
  footer: {
    services: string[];
  };
  clients: {
    eyebrow: string;
    title: string;
    description: string;
    items: {
      name: string;
      logo: string;
    }[];
  };
  accreditations: {
    eyebrow: string;
    title: string;
    description: string;
    groups: any[];
  };
  contactCards: {
    icon: string;
    title: string;
    details: string[];
  }[];
}

export interface ServiceSummary {
  id: string;
  sortOrder?: number;
  label: string;
  title: string;
  description: string;
  image: string;
  heroImage: string;
  detailImage: string;
  isEcoFriendly: boolean;
}

export interface ServiceDetail extends ServiceSummary {
  items: { title: string; description: string }[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  dateLabel: string;
  author: string;
  readTime: string;
}

export interface ImageAsset {
  id: number;
  name: string;
  storedName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore body parsing failures and keep the fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export function useCmsResource<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    fetchJson<T>(path)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [enabled, path]);

  return { data, loading, error };
}

export function useSiteSettings() {
  return useCmsResource<SiteSettings>("/settings/global");
}

export function useCmsPage<T = any>(slug: string) {
  return useCmsResource<CmsPage<T>>(`/pages/${slug}`);
}

export function useServices() {
  return useCmsResource<ServiceSummary[]>("/services");
}

export function useService(id?: string) {
  return useCmsResource<ServiceDetail>(`/services/${id}`, Boolean(id));
}

export function useBlogPosts() {
  return useCmsResource<BlogPost[]>("/blog-posts");
}

export interface AdminBootstrap {
  settings: SiteSettings;
  pages: CmsPage[];
  services: ServiceDetail[];
  blogPosts: Array<BlogPost & { sortOrder: number }>;
  imageAssets: ImageAsset[];
}

export async function adminLogin(password: string) {
  return apiRequest<{ token: string; username: string }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function adminLogout(token: string) {
  return apiRequest<{ ok: true }>("/admin/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminBootstrap(token: string) {
  return apiRequest<AdminBootstrap>("/admin/bootstrap", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function saveAdminSettings(token: string, settings: SiteSettings) {
  return apiRequest<SiteSettings>("/admin/settings/global", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
}

export async function saveAdminPage(token: string, page: CmsPage) {
  return apiRequest<CmsPage>(`/admin/pages/${page.slug}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(page),
  });
}

export async function createAdminService(token: string, service: ServiceDetail) {
  return apiRequest<ServiceDetail>("/admin/services", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(service),
  });
}

export async function saveAdminService(token: string, service: ServiceDetail) {
  return apiRequest<ServiceDetail>(`/admin/services/${service.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(service),
  });
}

export async function deleteAdminService(token: string, id: string) {
  return apiRequest<{ ok: true }>(`/admin/services/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function reorderAdminServices(token: string, ids: string[]) {
  return apiRequest<ServiceDetail[]>("/admin/services/reorder", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ids }),
  });
}

export async function createAdminBlogPost(
  token: string,
  post: BlogPost & { sortOrder: number },
) {
  return apiRequest<{ ok: true }>("/admin/blog-posts", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(post),
  });
}

export async function saveAdminBlogPost(
  token: string,
  post: BlogPost & { sortOrder: number },
) {
  return apiRequest<{ ok: true }>(`/admin/blog-posts/${post.slug}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(post),
  });
}

export async function deleteAdminBlogPost(token: string, slug: string) {
  return apiRequest<{ ok: true }>(`/admin/blog-posts/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function reorderAdminBlogPosts(token: string, slugs: string[]) {
  return apiRequest<Array<BlogPost & { sortOrder: number }>>("/admin/blog-posts/reorder", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slugs }),
  });
}

export async function changeAdminPassword(
  token: string,
  currentPassword: string,
  newPassword: string,
) {
  return apiRequest<{ ok: true }>("/admin/change-password", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getAdminImages(token: string) {
  return apiRequest<ImageAsset[]>("/admin/images", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function uploadAdminImage(token: string, file: File) {
  const response = await fetch(`${API_BASE}/admin/images/upload-binary`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
      "X-File-Name": file.name,
      "X-File-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore body parsing failures and keep the fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<ImageAsset[]>;
}

export async function renameAdminImage(token: string, id: number, name: string) {
  return apiRequest<ImageAsset[]>(`/admin/images/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
}

export async function importExistingAdminImages(token: string) {
  return apiRequest<ImageAsset[]>("/admin/images/import-existing", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function exportAdminBackup(token: string) {
  const response = await fetch(`${API_BASE}/admin/backups/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore body parsing failures and keep the fallback message.
    }
    throw new Error(message);
  }

  return {
    blob: await response.blob(),
    fileName:
      response.headers
        .get("Content-Disposition")
        ?.match(/filename="([^"]+)"/)?.[1] || "cios-backup.zip",
  };
}

export async function importAdminBackup(token: string, file: File) {
  const response = await fetch(`${API_BASE}/admin/backups/import-binary`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": file.type || "application/zip",
    },
    body: file,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // Ignore body parsing failures and keep the fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<AdminBootstrap>;
}
