import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { GripVertical } from "lucide-react";
import {
  AdminBootstrap,
  BlogPost,
  CmsPage,
  ImageAsset,
  SiteSettings,
  ServiceDetail,
  adminLogin,
  adminLogout,
  changeAdminPassword,
  createAdminBlogPost,
  createAdminService,
  deleteAdminBlogPost,
  deleteAdminService,
  exportAdminBackup,
  getAdminBootstrap,
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
import { getIconComponent, iconMap, iconOptions } from "../../lib/iconMap";

const TOKEN_KEY = "cios_admin_token";

type AdminSection = "global" | "pages" | "services" | "blog" | "images" | "backups" | "password";

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
    <div className="bg-white rounded-3xl border border-[#e1d3bd] p-6">
      <h3 className="text-xl mb-1">{title}</h3>
      {description ? <p className="text-sm text-[#6a5a49] mb-5">{description}</p> : null}
      {children}
    </div>
  );
}

function StickyActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky top-[88px] z-10 -mt-1">
      <div className="bg-white/95 backdrop-blur-sm border border-[#e1d3bd] rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      </div>
    </div>
  );
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
      <div className="text-sm text-[#6a5a49] mb-2">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2] disabled:opacity-60"
      />
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
      <div className="text-sm text-[#6a5a49] mb-2">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2] resize-y"
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
      <div className="text-sm text-[#6a5a49] mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2]"
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
              className="flex-1 px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2]"
            />
            <button
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="px-4 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12]"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, ""])}
        className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white"
      >
        {addLabel}
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
      <div className="max-w-5xl mx-auto bg-white rounded-3xl border border-[#e1d3bd] shadow-2xl">
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-[#e1d3bd] px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl">{title}</h3>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-[#e8d0aa]">
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
  const Icon = getIconComponent(value);

  return (
    <button type="button" onClick={onPick} className="block text-left w-full">
      <div className="text-sm text-[#6a5a49] mb-2">{label}</div>
      <div className="w-full px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-[#eadbc4] flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium">{value || "Choose icon"}</div>
          <div className="text-sm text-[#6a5a49]">Click to browse icons</div>
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
      <div className="text-sm text-[#6a5a49] mb-2">{label}</div>
      <div className="w-full px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2] flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-[#eadbc4] shrink-0">
          {value ? (
            <img src={value} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-[#8d6940]">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-medium">{value ? "Image selected" : "Choose image"}</div>
          <div className="text-sm text-[#6a5a49] truncate">
            {value || "Open the image library or upload a new image"}
          </div>
        </div>
      </div>
    </button>
  );
}

function IconPickerModalContent({
  currentValue,
  onSelect,
}: {
  currentValue: string;
  onSelect: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const filteredIcons = iconOptions.filter((name) =>
    name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <Field label="Search Icons" value={search} onChange={setSearch} placeholder="Type an icon name" />
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 max-h-[65vh] overflow-y-auto">
        {filteredIcons.map((name) => {
          const Icon = iconMap[name];
          const active = currentValue === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onSelect(name)}
              className={`rounded-2xl border p-4 text-left ${
                active ? "border-[#3d1810] bg-[#f4e7d1]" : "border-[#e1d3bd] bg-[#fffaf2]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#eadbc4] flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-sm break-words">{name}</div>
            </button>
          );
        })}
      </div>
    </div>
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
        <label className="px-4 py-3 rounded-2xl bg-[#3d1810] text-white cursor-pointer">
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
          <div className="col-span-full text-sm text-[#6a5a49] px-1 py-4">
            No images yet. Upload one to add it to the library.
          </div>
        ) : null}
        {filteredAssets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onSelect(asset.url)}
            className={`rounded-2xl border p-3 text-left ${
              currentValue === asset.url ? "border-[#3d1810] bg-[#f4e7d1]" : "border-[#e1d3bd] bg-[#fffaf2]"
            }`}
          >
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#eadbc4] mb-3">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
            </div>
            <div className="font-medium truncate">{asset.name}</div>
            <div className="text-sm text-[#6a5a49]">{formatBytes(asset.sizeBytes)}</div>
          </button>
        ))}
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
    return <div className="space-y-6">{renderHeroFields()}</div>;
  }

  if (page.slug === "services") {
    return (
      <div className="space-y-6">
        {renderHeroFields()}
        <SectionCard title="Feature Highlights" description="Small highlight badges shown near the top of the services page.">
          <div className="space-y-4">
            {(content.greenFeatures || []).map((item: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({
                    ...content,
                    greenFeatures: content.greenFeatures.filter((_: unknown, i: number) => i !== index),
                  });
                }}>
                  Remove Highlight
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, faqs: content.faqs.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove FAQ
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4">
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
                <button className="mt-3 px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, serviceTypes: content.serviceTypes.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Option
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
            updateContent({ ...content, serviceTypes: [...(content.serviceTypes || []), { value: "", label: "", icon: "Home" }] });
          }}>
            Add Service Type
          </button>
        </SectionCard>
        <LineListEditor title="Visit Frequency Options" items={content.frequencies || []} onChange={(items) => updateContent({ ...content, frequencies: items })} addLabel="Add Frequency" />
        <SectionCard title="What Happens Next" description="Step-by-step items shown after the quote form.">
          <div className="space-y-4">
            {(content.nextSteps || []).map((step: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, nextSteps: content.nextSteps.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Step
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, benefits: content.benefits.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Benefit
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-[#e1d3bd] p-4">
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
            <button className="px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, values: content.values.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Card
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, whyChooseUs: content.whyChooseUs.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Card
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-[#e1d3bd] p-4">
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
        <SectionCard title="Testimonials" description="Customer review cards shown on the home page.">
          <div className="space-y-4">
            {(content.testimonials || []).map((item: any, index: number) => (
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                <TextAreaField label="Review Text" value={item.text || ""} onChange={(value) => {
                  const next = [...content.testimonials];
                  next[index] = { ...next[index], text: value };
                  updateContent({ ...content, testimonials: next });
                }} />
                <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
                  updateContent({ ...content, testimonials: content.testimonials.filter((_: unknown, i: number) => i !== index) });
                }}>
                  Remove Testimonial
                </button>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
              <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
        <div className="text-sm text-[#6a5a49]">
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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function applyBootstrapData(data: AdminBootstrap) {
    setBootstrap(data);
    setSettingsDraft({
      ...data.settings,
      clients: {
        ...data.settings.clients,
        items: normalizeClientItems(data.settings.clients?.items),
      },
    });
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

  async function handleImageUpload(file: File, autoSelect?: (url: string) => void) {
    if (!token) return;
    const uploaded = await uploadAdminImage(token, file);
    setImageAssetsDraft(uploaded);
    const latest = uploaded[0];
    if (latest && autoSelect) {
      autoSelect(latest.url);
    }
    flashStatus("Image uploaded to library");
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
    setStatusMessage(null);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f4efe7] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-[#e7d7bd]">
          <div className="mb-8">
            <div className="text-sm uppercase tracking-[0.3em] text-[#8d6940] mb-3">CMS Admin</div>
            <h1 className="text-3xl text-[#2c1d12] mb-2">Sign In</h1>
            <p className="text-[#6a5a49] text-sm">
              Use the admin password stored in the database. Default username is <code>admin</code>.
            </p>
          </div>
          <Field label="Password" value={password} onChange={setPassword} type="password" />
          {authError ? <div className="text-sm text-red-600 my-4">{authError}</div> : null}
          <button type="submit" disabled={loading} className="mt-4 w-full rounded-2xl bg-[#3d1810] text-white py-3 disabled:opacity-60">
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

  return (
    <div className="min-h-screen bg-[#f7f1e7] text-[#2c1d12]">
      <div className="border-b border-[#e1d3bd] bg-white/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#8d6940]">CIOS CMS</div>
          <h1 className="text-2xl">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-3">
          {statusMessage ? <div className="text-sm text-emerald-700">{statusMessage}</div> : null}
          <div className="text-sm text-[#6a5a49]">Signed in as {username}</div>
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl bg-[#3d1810] text-white">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-73px)]">
        <aside className="border-r border-[#e1d3bd] bg-[#fffaf2] p-5">
          <nav className="space-y-2">
            {[
              ["global", "Common Business Data"],
              ["pages", "Website Pages"],
              ["services", "Services"],
              ["blog", "Blog Posts"],
              ["images", "Image Library"],
              ["backups", "Backups"],
              ["password", "Change Password"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSection(value as AdminSection)}
                className={`w-full text-left px-4 py-3 rounded-2xl ${
                  section === value ? "bg-[#3d1810] text-white" : "bg-white hover:bg-[#f3e6d2]"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="p-6">
          {loading && !bootstrap ? <div>Loading admin data...</div> : null}
          {authError ? <div className="text-red-600 mb-4">{authError}</div> : null}

          {section === "global" && settingsDraft ? (
            <div className="space-y-6">
              <StickyActionBar>
                <button
                  onClick={async () => {
                    if (!token || !settingsDraft) return;
                    try {
                      const saved = await saveAdminSettings(token, settingsDraft);
                      setSettingsDraft(saved);
                      await refreshAdminData(token);
                      flashStatus("Common business data saved");
                    } catch (error) {
                      alert(error instanceof Error ? error.message : "Failed to save settings");
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                >
                  Save Common Business Data
                </button>
              </StickyActionBar>
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

              <LineListEditor title="Address Lines" description="Shown in contact areas and shared site sections." items={settingsDraft.business.addressLines} onChange={(items) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, addressLines: items } })} addLabel="Add Address Line" />
              <LineListEditor title="Opening Hours" description="Shared business hours used around the website." items={settingsDraft.business.hours} onChange={(items) => setSettingsDraft({ ...settingsDraft, business: { ...settingsDraft.business, hours: items } })} addLabel="Add Opening Hour" />
              <LineListEditor title="Footer Service Names" description="Short service list shown in the footer." items={settingsDraft.footer.services} onChange={(items) => setSettingsDraft({ ...settingsDraft, footer: { ...settingsDraft.footer, services: items } })} addLabel="Add Footer Service" />

              <SectionCard title="Clients" description="Trusted clients shown on the website.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Field label="Section Label" value={settingsDraft.clients.eyebrow} onChange={(value) => setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, eyebrow: value } })} />
                  <Field label="Section Title" value={settingsDraft.clients.title} onChange={(value) => setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, title: value } })} />
                </div>
                <TextAreaField label="Section Description" value={settingsDraft.clients.description} onChange={(value) => setSettingsDraft({ ...settingsDraft, clients: { ...settingsDraft.clients, description: value } })} />
                <div className="mt-4 space-y-4">
                  {settingsDraft.clients.items.map((client, index) => (
                    <div key={`client-${index}`} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-4">
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
                        className="px-4 py-2 rounded-xl bg-[#e8d0aa] text-[#2c1d12]"
                      >
                        Remove Client
                      </button>
                    </div>
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
                    className="px-4 py-3 rounded-2xl bg-[#3d1810] text-white"
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
                      <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-4">
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
                                  className="flex-1 px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2]"
                                />
                                <button className="px-4 py-3 rounded-2xl bg-[#e8d0aa]" onClick={() => {
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
                            <button className="px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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
                                  className="px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2]"
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
                                  className="px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2]"
                                />
                                <button className="px-4 py-3 rounded-2xl bg-[#e8d0aa]" onClick={() => {
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
                            <button className="px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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

                        <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
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
                      </div>
                    );
                  })}
                </div>
                <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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

              <button
                onClick={async () => {
                  if (!token || !settingsDraft) return;
                  try {
                    const saved = await saveAdminSettings(token, settingsDraft);
                    setSettingsDraft(saved);
                    await refreshAdminData(token);
                    flashStatus("Common business data saved");
                  } catch (error) {
                    alert(error instanceof Error ? error.message : "Failed to save settings");
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
              >
                Save Common Business Data
              </button>
            </div>
          ) : null}

          {section === "pages" ? (
            <div className="grid grid-cols-[280px_1fr] gap-6">
              <div className="bg-white rounded-3xl border border-[#e1d3bd] p-4 space-y-2">
                {pagesDraft.map((page) => (
                  <button
                    key={page.slug}
                    onClick={() => setSelectedPageSlug(page.slug)}
                    className={`w-full text-left px-4 py-3 rounded-2xl ${
                      selectedPageSlug === page.slug ? "bg-[#3d1810] text-white" : "bg-[#fffaf2]"
                    }`}
                  >
                    {getPageTitle(page.slug)}
                  </button>
                ))}
              </div>

              {selectedPage ? (
                <div className="space-y-6">
                  <StickyActionBar>
                    <button
                      onClick={async () => {
                        if (!token || !selectedPage) return;
                        try {
                          await saveAdminPage(token, selectedPage);
                          await refreshAdminData(token);
                          flashStatus(`${getPageTitle(selectedPage.slug)} saved`);
                        } catch (error) {
                          alert(error instanceof Error ? error.message : "Failed to save page");
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                    >
                      Save {getPageTitle(selectedPage.slug)}
                    </button>
                  </StickyActionBar>
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
                  <button
                    onClick={async () => {
                      if (!token || !selectedPage) return;
                      try {
                        await saveAdminPage(token, selectedPage);
                        await refreshAdminData(token);
                        flashStatus(`${getPageTitle(selectedPage.slug)} saved`);
                      } catch (error) {
                        alert(error instanceof Error ? error.message : "Failed to save page");
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                  >
                    Save {getPageTitle(selectedPage.slug)}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "services" ? (
            <div className="grid grid-cols-[280px_1fr] gap-6">
              <div className="bg-white rounded-3xl border border-[#e1d3bd] p-4 space-y-2">
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
                      items: [],
                    };
                    setServicesDraft((current) => [...current, fresh]);
                    setSelectedServiceId(fresh.id);
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-[#e8d0aa] text-left"
                >
                  + Add Service
                </button>
                <div className="px-2 pt-2 text-xs uppercase tracking-[0.2em] text-[#8d6940]">
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
                      selectedServiceId === service.id ? "bg-[#3d1810] text-white" : "bg-[#fffaf2]"
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
                  className="w-full px-4 py-3 rounded-2xl bg-[#3d1810] text-white disabled:opacity-60"
                >
                  {savingOrder === "services" ? "Saving Order..." : "Save Service Order"}
                </button>
              </div>

              {selectedService ? (
                <div className="space-y-6">
                  <StickyActionBar>
                    <button
                      onClick={async () => {
                        if (!token || !selectedService) return;
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
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                    >
                      Save Service
                    </button>
                    <button
                      onClick={async () => {
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
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12]"
                    >
                      Delete Service
                    </button>
                  </StickyActionBar>
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
                        <div key={index} className="rounded-2xl border border-[#e1d3bd] p-4 space-y-3">
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
                          <button className="px-4 py-2 rounded-xl bg-[#e8d0aa]" onClick={() => {
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
                        </div>
                      ))}
                    </div>
                    <button className="mt-4 px-4 py-3 rounded-2xl bg-[#3d1810] text-white" onClick={() => {
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

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!token || !selectedService) return;
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
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                    >
                      Save Service
                    </button>
                    <button
                      onClick={async () => {
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
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12]"
                    >
                      Delete Service
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "blog" ? (
            <div className="grid grid-cols-[280px_1fr] gap-6">
              <div className="bg-white rounded-3xl border border-[#e1d3bd] p-4 space-y-2">
                <button
                  onClick={() => {
                    const linkName = `post-${Date.now()}`;
                    const fresh = {
                      slug: linkName,
                      title: "New Post",
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
                  className="w-full px-4 py-3 rounded-2xl bg-[#e8d0aa] text-left"
                >
                  + Add Blog Post
                </button>
                <div className="px-2 pt-2 text-xs uppercase tracking-[0.2em] text-[#8d6940]">
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
                      selectedPostSlug === post.slug ? "bg-[#3d1810] text-white" : "bg-[#fffaf2]"
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
                  className="w-full px-4 py-3 rounded-2xl bg-[#3d1810] text-white disabled:opacity-60"
                >
                  {savingOrder === "blog" ? "Saving Order..." : "Save Blog Order"}
                </button>
              </div>

              {selectedPost ? (
                <div className="space-y-6">
                  <StickyActionBar>
                    <button
                      onClick={async () => {
                        if (!token || !selectedPost) return;
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
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                    >
                      Save Blog Post
                    </button>
                    <button
                      onClick={async () => {
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
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12]"
                    >
                      Delete Blog Post
                    </button>
                  </StickyActionBar>
                  <SectionCard title="Blog Post Details" description="Edit the visible details for this blog card. The page link name is created automatically for new posts.">
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
                    <div className="mt-4">
                      <TextAreaField label="Short Summary / Excerpt" value={selectedPost.excerpt} onChange={(value) => {
                        setPostsDraft((current) =>
                          current.map((post) => post.slug === selectedPost.slug ? { ...post, excerpt: value } : post),
                        );
                      }} rows={6} />
                    </div>
                  </SectionCard>

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!token || !selectedPost) return;
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
                        }
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                    >
                      Save Blog Post
                    </button>
                    <button
                      onClick={async () => {
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
                      }}
                      className="px-6 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12]"
                    >
                      Delete Blog Post
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {section === "images" ? (
            <div className="space-y-6">
              <SectionCard
                title="Image Library"
                description="Upload, rename, and reuse images across the website. These images are available in every image picker."
              >
                <div className="flex flex-wrap gap-3">
                  <label className="px-4 py-3 rounded-2xl bg-[#3d1810] text-white cursor-pointer">
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
                    className="px-4 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12]"
                  >
                    Import Existing Website Images
                  </button>
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {imageAssetsDraft.map((asset) => (
                  <div key={asset.id} className="bg-white rounded-3xl border border-[#e1d3bd] p-4 space-y-4">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#f7f1e7] border border-[#eadbc4]">
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[#8d6940] mb-1">Image Name</div>
                      <input
                        value={asset.name}
                        onChange={(event) =>
                          setImageAssetsDraft((current) =>
                            current.map((item) =>
                              item.id === asset.id ? { ...item, name: event.target.value } : item,
                            ),
                          )
                        }
                        className="w-full px-4 py-3 rounded-2xl border border-[#d9c4a4] bg-[#fffaf2]"
                      />
                    </div>
                    <div className="text-sm text-[#6a5a49] break-all">{asset.url}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#8d6940]">
                      {formatBytes(asset.sizeBytes)}
                    </div>
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
                      className="w-full px-4 py-3 rounded-2xl bg-[#3d1810] text-white"
                    >
                      Save Image Name
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {section === "backups" ? (
            <div className="space-y-6">
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
                  className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white disabled:opacity-60"
                >
                  {backupBusy === "export" ? "Preparing Backup..." : "Export Backup Zip"}
                </button>
              </SectionCard>

              <SectionCard
                title="Import Backup"
                description="Restore the SQL dump and uploaded images from a backup zip. This will overwrite current CMS data and image library contents."
              >
                <label className="inline-flex px-6 py-3 rounded-2xl bg-[#e8d0aa] text-[#2c1d12] cursor-pointer">
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
                <p className="text-sm text-[#6a5a49] mt-4">
                  Expected archive contents: <code>backup.sql</code>, <code>manifest.json</code>, and an <code>uploads/</code> folder.
                </p>
              </SectionCard>
            </div>
          ) : null}

          {section === "password" ? (
            <div className="space-y-6">
              <StickyActionBar>
                <button
                  onClick={async () => {
                    if (!token) return;
                    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                      alert("New password confirmation does not match");
                      return;
                    }
                    try {
                      await changeAdminPassword(token, passwordForm.currentPassword, passwordForm.newPassword);
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      flashStatus("Password updated");
                    } catch (error) {
                      alert(error instanceof Error ? error.message : "Failed to change password");
                    }
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                >
                  Update Password
                </button>
              </StickyActionBar>
              <div className="max-w-xl bg-white rounded-3xl border border-[#e1d3bd] p-6">
                <h2 className="text-2xl mb-5">Change Admin Password</h2>
                <div className="space-y-4">
                  <Field label="Current Password" value={passwordForm.currentPassword} onChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })} type="password" />
                  <Field label="New Password" value={passwordForm.newPassword} onChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })} type="password" />
                  <Field label="Confirm New Password" value={passwordForm.confirmPassword} onChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })} type="password" />
                </div>
                <button
                  onClick={async () => {
                    if (!token) return;
                    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                      alert("New password confirmation does not match");
                      return;
                    }
                    try {
                      await changeAdminPassword(token, passwordForm.currentPassword, passwordForm.newPassword);
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      flashStatus("Password updated");
                    } catch (error) {
                      alert(error instanceof Error ? error.message : "Failed to change password");
                    }
                  }}
                  className="mt-4 px-6 py-3 rounded-2xl bg-[#3d1810] text-white"
                >
                  Update Password
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>

      {iconPicker ? (
        <ModalShell title={iconPicker.title} onClose={() => setIconPicker(null)}>
          <IconPickerModalContent
            currentValue={iconPicker.currentValue}
            onSelect={(value) => {
              iconPicker.onSelect(value);
              setIconPicker(null);
            }}
          />
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
              await handleImageUpload(file, (url) => {
                imagePicker.onSelect(url);
                setImagePicker(null);
              });
            }}
          />
        </ModalShell>
      ) : null}
    </div>
  );
}
