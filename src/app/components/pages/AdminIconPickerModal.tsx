import { useState } from "react";
import { iconMap, iconOptions } from "../../lib/iconMap";

export function AdminIconPickerModalContent({
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
      <label className="block">
        <div className="text-sm text-[var(--brand-text-muted)] mb-2">Search Icons</div>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Type an icon name"
          className="w-full px-4 py-3 rounded-2xl border border-[var(--brand-border-strong)] bg-[var(--brand-surface)]"
        />
      </label>
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
                active ? "border-[var(--brand-brown)] bg-[var(--brand-canvas-soft)]" : "border-[var(--brand-border)] bg-[var(--brand-surface)]"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center mb-3">
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
