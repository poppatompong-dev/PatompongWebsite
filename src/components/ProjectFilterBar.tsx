"use client";

import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface ProjectFilterOption {
  value: string;
  label: string;
  color?: string | null;
}

interface ProjectFilterBarProps {
  categories: ProjectFilterOption[];
  clients: ProjectFilterOption[];
  initialCategoryId: string;
  initialClientId: string;
  initialQuery: string;
  initialStatus: string;
  initialType: string;
  resultCount: number;
  totalCount: number;
  types: ProjectFilterOption[];
}

const statusOptions: ProjectFilterOption[] = [
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "in_progress", label: "กำลังดำเนิน" },
  { value: "planning", label: "วางแผน" },
];

export default function ProjectFilterBar({
  categories,
  clients,
  initialCategoryId,
  initialClientId,
  initialQuery,
  initialStatus,
  initialType,
  resultCount,
  totalCount,
  types,
}: ProjectFilterBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const replaceSearch = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams?.toString() || "");

      for (const [key, value] of Object.entries(updates)) {
        const trimmedValue = value.trim();
        if (trimmedValue) {
          params.set(key, trimmedValue);
        } else {
          params.delete(key);
        }
      }

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query !== initialQuery) {
        replaceSearch({ q: query });
      }
    }, 320);

    return () => window.clearTimeout(timer);
  }, [initialQuery, query, replaceSearch]);

  const activeFilterCount = useMemo(
    () => [initialClientId, initialCategoryId, initialType, initialStatus, initialQuery].filter(Boolean).length,
    [initialCategoryId, initialClientId, initialQuery, initialStatus, initialType],
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; param: string; label: string }[] = [];
    if (initialQuery) chips.push({ key: "q", param: "q", label: `"${initialQuery}"` });
    if (initialClientId) {
      const c = clients.find((cl) => cl.value === initialClientId);
      chips.push({ key: "clientId", param: "clientId", label: c?.label || initialClientId });
    }
    if (initialCategoryId) {
      const c = categories.find((cat) => cat.value === initialCategoryId);
      chips.push({ key: "categoryId", param: "categoryId", label: c?.label || initialCategoryId });
    }
    if (initialType) chips.push({ key: "type", param: "type", label: initialType });
    if (initialStatus) {
      const s = statusOptions.find((st) => st.value === initialStatus);
      chips.push({ key: "status", param: "status", label: s?.label || initialStatus });
    }
    return chips;
  }, [initialQuery, initialClientId, initialCategoryId, initialType, initialStatus, clients, categories]);

  return (
    <section className="card-retro overflow-hidden p-4 sm:p-5">
      <div className="flex flex-col gap-3">
        {/* Row 1: Search + controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-cream-300 bg-white px-3 py-2 transition-colors focus-within:border-gold-400">
            <Search className="h-4 w-4 shrink-0 text-ink-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาโครงการ... (ชื่อ, ประเภท, คำอธิบาย, tag)"
              className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-300"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} className="shrink-0 text-ink-300 hover:text-ink-500">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${filtersOpen ? "border-gold-400 bg-gold-50 text-gold-700" : "border-cream-300 bg-white text-ink-500 hover:border-gold-400"}`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              ตัวกรอง
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-gold-500 px-1.5 py-0.5 text-[10px] leading-none text-white">{activeFilterCount}</span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className="inline-flex items-center gap-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-xs font-semibold text-ink-500 transition-colors hover:border-red-300 hover:text-red-500"
              >
                <RotateCcw className="h-3 w-3" />
                ล้าง
              </button>
            )}

            <span className="ml-auto text-xs text-ink-400 sm:ml-2">
              <span className="font-semibold text-ink-700">{resultCount}</span>/{totalCount}
            </span>
          </div>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <span key={chip.key} className="inline-flex items-center gap-1 rounded-full border border-gold-300/50 bg-gold-50 px-2.5 py-1 text-[11px] font-semibold text-gold-700">
                {chip.label}
                <button type="button" onClick={() => replaceSearch({ [chip.param]: "" })} className="ml-0.5 rounded-full hover:text-red-500">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Expandable filter panel */}
        {filtersOpen && (
          <div className="grid gap-3 rounded-xl border border-cream-200 bg-cream-50/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">หน่วยงาน</span>
              <select
                value={initialClientId}
                onChange={(event) => replaceSearch({ clientId: event.target.value })}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-ink-700 outline-none transition-colors focus:border-gold-400"
              >
                <option value="">ทั้งหมด</option>
                {clients.map((client) => (
                  <option key={client.value} value={client.value}>{client.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">หมวดหมู่</span>
              <select
                value={initialCategoryId}
                onChange={(event) => replaceSearch({ categoryId: event.target.value })}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-ink-700 outline-none transition-colors focus:border-gold-400"
              >
                <option value="">ทั้งหมด</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">ประเภทระบบ</span>
              <select
                value={initialType}
                onChange={(event) => replaceSearch({ type: event.target.value })}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-ink-700 outline-none transition-colors focus:border-gold-400"
              >
                <option value="">ทั้งหมด</option>
                {types.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-500">สถานะ</span>
              <select
                value={initialStatus}
                onChange={(event) => replaceSearch({ status: event.target.value })}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm text-ink-700 outline-none transition-colors focus:border-gold-400"
              >
                <option value="">ทั้งหมด</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Quick type tag cloud */}
        {types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => {
              const isActive = initialType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => replaceSearch({ type: isActive ? "" : t.value })}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${isActive ? "border-gold-500 bg-gold-500 text-white shadow-sm" : "border-cream-300 bg-white text-ink-500 hover:border-gold-400 hover:text-gold-600"}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
