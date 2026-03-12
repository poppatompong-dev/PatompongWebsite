"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Save,
  Search,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from "lucide-react";
import {
  getProjects,
  getProjectClients,
  getProjectCategories,
  createProject,
  updateProject,
  deleteProject,
} from "@/app/admin/(protected)/actions";

interface ProjectRow {
  id: string;
  projectId: string;
  projectNumber: number;
  projectName: string;
  slug: string;
  clientId: string;
  client: { clientId: string; clientName: string };
  categoryId: string;
  category: { categoryId: string; name: string; color: string | null };
  type: string;
  subcategory: string;
  url: string | null;
  description: string | null;
  tags: string | null;
  keywords: string | null;
  status: string;
  startDate: string | null;
  completedDate: string | null;
}

interface ClientOption {
  clientId: string;
  clientName: string;
}

interface CategoryOption {
  categoryId: string;
  name: string;
  color: string | null;
}

const STATUS_OPTIONS = [
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "in_progress", label: "กำลังพัฒนา" },
  { value: "planning", label: "วางแผน" },
];

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function toDateInput(val: string | null | Date) {
  if (!val) return "";
  const d = typeof val === "string" ? new Date(val) : val;
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    projectName: "",
    slug: "",
    clientId: "",
    categoryId: "",
    type: "",
    subcategory: "",
    description: "",
    url: "",
    tags: "",
    keywords: "",
    status: "completed",
    startDate: "",
    completedDate: "",
  });

  async function loadData() {
    setLoading(true);
    try {
      const [p, c, cat] = await Promise.all([
        getProjects(),
        getProjectClients(),
        getProjectCategories(),
      ]);
      setProjects(p as unknown as ProjectRow[]);
      setClients(c);
      setCategories(cat);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm({
      projectName: "",
      slug: "",
      clientId: clients[0]?.clientId || "",
      categoryId: categories[0]?.categoryId || "",
      type: "",
      subcategory: "",
      description: "",
      url: "",
      tags: "",
      keywords: "",
      status: "completed",
      startDate: "",
      completedDate: "",
    });
    setEditingId(null);
  }

  function startEdit(p: ProjectRow) {
    setForm({
      projectName: p.projectName,
      slug: p.slug,
      clientId: p.clientId,
      categoryId: p.categoryId,
      type: p.type,
      subcategory: p.subcategory,
      description: p.description || "",
      url: p.url || "",
      tags: p.tags || "",
      keywords: p.keywords || "",
      status: p.status,
      startDate: toDateInput(p.startDate),
      completedDate: toDateInput(p.completedDate),
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    if (editingId) {
      await updateProject(editingId, fd);
    } else {
      await createProject(fd);
    }
    resetForm();
    setShowForm(false);
    await loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบโครงการนี้? การกระทำนี้ย้อนกลับไม่ได้")) return;
    await deleteProject(id);
    await loadData();
  }

  const filtered = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase()) ||
      p.client.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls =
    "w-full bg-ink-900 border border-ink-600 text-cream-100 text-sm px-3 py-2 focus:border-gold-500 focus:outline-none transition-colors";
  const labelCls = "block text-[10px] font-code text-ink-400 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-gold-400" />
          <h2 className="font-heading text-lg font-bold text-cream-100">
            จัดการโครงการ ({projects.length})
          </h2>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gold-600 hover:bg-gold-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          เพิ่มโครงการ
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
        <input
          type="text"
          placeholder="ค้นหาชื่อโครงการ, ประเภท, หน่วยงาน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-ink-800 border border-ink-700 text-cream-100 pl-10 pr-4 py-2.5 text-sm focus:border-gold-500 focus:outline-none"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-ink-800 border border-ink-700 p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-code text-sm text-gold-400 uppercase tracking-wider">
              {editingId ? "แก้ไขโครงการ" : "เพิ่มโครงการใหม่"}
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-ink-400 hover:text-cream-100" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>ชื่อโครงการ *</label>
              <input
                required
                value={form.projectName}
                onChange={(e) => {
                  setForm({
                    ...form,
                    projectName: e.target.value,
                    slug: editingId ? form.slug : toSlug(e.target.value),
                  });
                }}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Slug *</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>หน่วยงาน *</label>
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className={inputCls}
              >
                <option value="">เลือก...</option>
                {clients.map((c) => (
                  <option key={c.clientId} value={c.clientId}>
                    {c.clientName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>หมวดหมู่ *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className={inputCls}
              >
                <option value="">เลือก...</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>สถานะ</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputCls}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>ประเภทระบบ *</label>
              <input
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="React/Vercel, AppSheet, Google Earth Map..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Subcategory *</label>
              <input
                required
                value={form.subcategory}
                onChange={(e) =>
                  setForm({ ...form, subcategory: e.target.value })
                }
                placeholder="Meeting Management, KPI..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>URL ระบบ</label>
              <input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>คำอธิบาย</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tags (JSON array หรือ comma-separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder='["react","vercel"] หรือ react,vercel'
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Keywords</label>
              <input
                value={form.keywords}
                onChange={(e) =>
                  setForm({ ...form, keywords: e.target.value })
                }
                placeholder='["keyword1","keyword2"]'
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>วันเริ่มต้น</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>วันแล้วเสร็จ</label>
              <input
                type="date"
                value={form.completedDate}
                onChange={(e) =>
                  setForm({ ...form, completedDate: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gold-600 hover:bg-gold-500 text-white text-sm font-semibold transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingId ? "บันทึกการแก้ไข" : "สร้างโครงการ"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-ink-600 text-ink-300 hover:text-cream-100 text-sm transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {/* Project List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-400 mx-auto mb-2" />
          <p className="font-code text-xs text-ink-400">กำลังโหลด...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-ink-800 border border-ink-700 hover:border-ink-600 transition-colors"
            >
              {/* Row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="font-code text-xs text-ink-500 w-8 shrink-0">
                  #{String(p.projectNumber).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-cream-100 truncate">
                    {p.projectName}
                  </p>
                  <p className="text-[10px] font-code text-ink-400 truncate">
                    {p.client.clientName} · {p.type} · {p.category.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    p.status === "completed"
                      ? "bg-emerald-900/40 text-emerald-400 border border-emerald-700"
                      : p.status === "in_progress"
                      ? "bg-sky-900/40 text-sky-400 border border-sky-700"
                      : "bg-amber-900/40 text-amber-400 border border-amber-700"
                  }`}
                >
                  {STATUS_OPTIONS.find((s) => s.value === p.status)?.label || p.status}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === p.id ? null : p.id)
                    }
                    className="p-1.5 text-ink-400 hover:text-cream-100 transition-colors"
                    title="ดูรายละเอียด"
                  >
                    {expandedId === p.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 text-ink-400 hover:text-gold-400 transition-colors"
                    title="แก้ไข"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-ink-400 hover:text-red-400 transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === p.id && (
                <div className="border-t border-ink-700 px-4 py-3 bg-ink-900/50 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-code text-[10px] text-ink-500 uppercase">Slug</span>
                    <p className="text-cream-200 font-code">{p.slug}</p>
                  </div>
                  <div>
                    <span className="font-code text-[10px] text-ink-500 uppercase">URL</span>
                    <p className="text-cream-200 font-code truncate">
                      {p.url || "—"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-code text-[10px] text-ink-500 uppercase">คำอธิบาย</span>
                    <p className="text-cream-200">
                      {p.description || "ไม่มีคำอธิบาย"}
                    </p>
                  </div>
                  {p.tags && (
                    <div className="col-span-2">
                      <span className="font-code text-[10px] text-ink-500 uppercase">Tags</span>
                      <p className="text-cream-200 font-code">{p.tags}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-8">
              <p className="font-code text-sm text-ink-400">ไม่พบโครงการ</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
