"use client";

import { useState, useEffect, useCallback } from "react";
import { Camera, Search, Filter, Tag, Check, X, Image as ImageIcon, Trash2, RefreshCw, Save, Eye, EyeOff, ChevronDown, UploadCloud, ChevronUp } from "lucide-react";
import Image from "next/image";
import { getSavedPhotos, savePhotoMetadata, togglePhotoVisibility, deletePortfolioPhoto, syncGalleryFromDisk } from "@/actions/galleryDb";
import PortfolioUploader from "./PortfolioUploader";

type Photo = {
  id: string;
  url: string;
  category: string;
  description: string | null;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const PORTFOLIO_CATEGORIES = [
  "CCTV & Security",
  "Network & Server",
  "Wireless & Antenna",
  "Fiber Optic",
  "Broadcasting & AV",
  "Field Operations",
  "Drone Survey",
  "Uncategorized",
];

const CATEGORY_COUNTS_EXPECTED: Record<string, number> = {
  "CCTV & Security": 27,
  "Network & Server": 19,
  "Wireless & Antenna": 35,
  "Fiber Optic": 24,
  "Broadcasting & AV": 18,
  "Field Operations": 29,
  "Drone Survey": 4,
};

export default function GalleryManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editForm, setEditForm] = useState({ category: "Uncategorized", description: "", isHidden: false });
  const [showHidden, setShowHidden] = useState(true);
  const [uploadCategory, setUploadCategory] = useState("CCTV & Security");
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedPhotos();
      setPhotos(data as Photo[]);
    } catch (err) {
      console.error("Failed to load photos", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleToggleVisibility = async (id: string, currentIsHidden: boolean) => {
    setSavingId(id);
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, isHidden: !currentIsHidden } : p));
    const result = await togglePhotoVisibility(id, !currentIsHidden);
    if (!result.success) {
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, isHidden: currentIsHidden } : p));
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบรูปภาพนี้ออกจากระบบ? (ไฟล์ใน public/ จะยังอยู่)")) return;
    setSavingId(id);
    await deletePortfolioPhoto(id);
    setPhotos(prev => prev.filter(p => p.id !== id));
    setSavingId(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    setSavingId(editingPhoto.id);
    const result = await savePhotoMetadata({
      id: editingPhoto.id,
      url: editingPhoto.url,
      category: editForm.category,
      description: editForm.description,
      isHidden: editForm.isHidden,
    });
    if (result.success) {
      setPhotos(prev => prev.map(p => p.id === editingPhoto.id ? {
        ...p, category: editForm.category, description: editForm.description, isHidden: editForm.isHidden
      } : p));
      setEditingPhoto(null);
    }
    setSavingId(null);
  };

  const visibleCount = photos.filter(p => !p.isHidden).length;
  const hiddenCount = photos.filter(p => p.isHidden).length;

  const filtered = photos.filter(photo => {
    const matchesCat = activeCategory === "all" || photo.category === activeCategory;
    const matchesSearch = !searchQuery || (photo.description || "").toLowerCase().includes(searchQuery.toLowerCase()) || photo.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVisibility = showHidden ? true : !photo.isHidden;
    return matchesCat && matchesSearch && matchesVisibility;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-cream-100 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-gold-400" />
            จัดการภาพ Portfolio
          </h2>
          <p className="font-code text-sm text-ink-400 mt-1">
            {photos.length} ภาพทั้งหมด · <span className="text-green-400">{visibleCount} แสดงผล</span> · <span className="text-ink-500">{hiddenCount} ซ่อนไว้</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setSyncing(true); setSyncResult(null);
              const res = await syncGalleryFromDisk();
              setSyncResult(res.success ? `ซิงค์สำเร็จ: เพิ่ม ${res.synced} ภาพ (ข้าม ${res.skipped})` : `ผิดพลาด: ${res.error}`);
              await loadPhotos();
              setSyncing(false);
              setTimeout(() => setSyncResult(null), 5000);
            }}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-code text-sm hover:bg-green-500 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "กำลังซิงค์..." : "ซิงค์จาก Disk"}
          </button>
          <button
            onClick={loadPhotos}
            className="flex items-center gap-2 px-4 py-2 border border-ink-600 text-ink-300 font-code text-sm hover:text-gold-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`px-4 py-3 border font-code text-sm ${syncResult.startsWith('ซิงค์สำเร็จ') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {syncResult}
        </div>
      )}

      {/* Upload Panel */}
      <div className="border border-ink-700 overflow-hidden">
        <button
          onClick={() => setUploadPanelOpen(v => !v)}
          className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${uploadPanelOpen ? "bg-gold-500/10 border-b border-ink-700" : "bg-ink-800 hover:bg-ink-700/50"
            }`}
        >
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-gold-400" />
            <span className="font-heading text-sm font-bold text-cream-100">อัปโหลดรูปใหม่</span>
            <span className="font-code text-[10px] text-gold-400 bg-gold-500/10 px-2 py-0.5 border border-gold-500/30">Production Studio Auto-Process</span>
          </div>
          {uploadPanelOpen ? <ChevronUp className="w-4 h-4 text-ink-400" /> : <ChevronDown className="w-4 h-4 text-ink-400" />}
        </button>

        {uploadPanelOpen && (
          <div className="bg-ink-900/60 p-5 space-y-4">
            {/* Enhancement info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                ["🔄", "Auto-rotate EXIF"],
                ["📐", "Resize ≤ 1920px"],
                ["🌟", "WebP @ 88%"],
                ["☀️", "Brightness +5%"],
                ["🎨", "Contrast +8%"],
                ["💎", "Sharpen + Saturation"],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 px-2 py-1.5 bg-ink-800 border border-ink-700 text-[10px] font-code text-ink-300">
                  <span>{icon}</span><span className="truncate">{label}</span>
                </div>
              ))}
            </div>

            {/* Category picker */}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="font-code text-xs text-ink-300 uppercase tracking-wider shrink-0">หมวดหมู่:</label>
              <div className="relative">
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="appearance-none bg-ink-800 border border-ink-600 px-3 py-1.5 pr-8 text-sm text-cream-100 font-sans focus:outline-none focus:border-gold-500"
                >
                  {PORTFOLIO_CATEGORIES.filter(c => c !== "Uncategorized").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              </div>
            </div>

            <PortfolioUploader
              category={uploadCategory}
              onUploadComplete={() => { loadPhotos(); }}
            />
          </div>
        )}
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {PORTFOLIO_CATEGORIES.filter(c => c !== "Uncategorized").map(cat => {
          const count = photos.filter(p => p.category === cat && !p.isHidden).length;
          const total = photos.filter(p => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? "all" : cat)}
              className={`p-3 text-left border transition-all ${activeCategory === cat ? "border-gold-500 bg-gold-500/10" : "border-ink-700 bg-ink-800 hover:border-ink-500"}`}
            >
              <p className="font-code text-[10px] text-ink-400 uppercase truncate">{cat}</p>
              <p className="font-heading text-lg font-bold text-cream-100 mt-1">{count}<span className="text-ink-500 text-xs">/{total}</span></p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-ink-800 border border-ink-700 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            placeholder="ค้นหาจากคำบรรยาย หรือหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 pl-10 pr-4 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-ink-400 shrink-0" />
          {["all", ...PORTFOLIO_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-code whitespace-nowrap border transition-colors ${activeCategory === cat
                ? "bg-gold-500/20 text-gold-400 border-gold-500/50"
                : "bg-ink-900 text-ink-400 border-ink-700 hover:border-ink-500"
                }`}
            >
              {cat === "all" ? "ทั้งหมด" : cat}
            </button>
          ))}
          <button
            onClick={() => setShowHidden(!showHidden)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-code border transition-colors ${showHidden ? "bg-ink-900 text-ink-400 border-ink-700" : "bg-green-500/20 text-green-400 border-green-500/50"}`}
          >
            {showHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showHidden ? "แสดงทั้งหมด" : "เฉพาะที่แสดง"}
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gold-500" />
          <p className="font-code text-sm">กำลังโหลดรูปภาพ...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-500 font-code text-sm border border-dashed border-ink-700">
          ไม่พบรูปภาพที่ตรงกับเงื่อนไข
        </div>
      ) : (
        <>
          <p className="font-code text-xs text-ink-500">แสดง {filtered.length} จาก {photos.length} ภาพ</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((photo) => (
              <div key={photo.id} className="bg-ink-800 border border-ink-700 group relative flex flex-col">
                <div className="aspect-video relative overflow-hidden bg-ink-900">
                  <Image
                    src={photo.url}
                    alt={photo.description || photo.id}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${photo.isHidden ? "opacity-40 grayscale" : ""}`}
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-ink-900/85 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingPhoto(photo);
                        setEditForm({ category: photo.category, description: photo.description || "", isHidden: photo.isHidden });
                      }}
                      className="px-2.5 py-1.5 bg-gold-500 text-ink-900 text-xs font-bold font-code hover:bg-gold-400 transition-colors"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(photo.id, photo.isHidden)}
                      disabled={savingId === photo.id}
                      className={`px-2.5 py-1.5 text-xs font-bold font-code border transition-colors ${photo.isHidden
                        ? "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500 hover:text-white"
                        : "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500 hover:text-white"
                        }`}
                    >
                      {photo.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      disabled={savingId === photo.id}
                      className="px-2.5 py-1.5 text-xs font-bold font-code border border-red-800 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-1.5 right-1.5 z-10 pointer-events-none">
                    {photo.isHidden ? (
                      <span className="bg-ink-900/90 border border-ink-600 text-ink-400 text-[9px] px-1.5 py-0.5 font-code flex items-center gap-0.5">
                        <X className="w-2.5 h-2.5" /> ซ่อน
                      </span>
                    ) : (
                      <span className="bg-green-600/90 border border-green-400 text-white text-[9px] px-1.5 py-0.5 font-code flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> แสดง
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Tag className="w-2.5 h-2.5 text-gold-500 shrink-0" />
                    <span className="font-code text-[9px] text-gold-400 uppercase truncate">{photo.category}</span>
                  </div>
                  <p className="font-sans text-[10px] text-cream-200/60 line-clamp-2 leading-relaxed italic">
                    {photo.description || "ยังไม่มีคำบรรยาย"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-[100] bg-ink-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-800 border border-ink-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
            {/* Image Preview */}
            <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative bg-ink-900 border-b md:border-b-0 md:border-r border-ink-700 min-h-48">
              <Image
                src={editingPhoto.url}
                alt={editingPhoto.id}
                fill
                className="object-contain p-3"
              />
            </div>

            {/* Form */}
            <div className="w-full md:w-1/2 p-6 flex flex-col gap-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading text-lg font-bold text-cream-100">ตั้งค่ารูปภาพ</h3>
                  <p className="font-code text-[9px] text-ink-500 mt-0.5 truncate max-w-[200px]">{editingPhoto.url}</p>
                </div>
                <button onClick={() => setEditingPhoto(null)} className="text-ink-400 hover:text-cream-100 transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block font-code text-xs text-ink-300 mb-2 uppercase tracking-wider">หมวดหมู่ผลงาน</label>
                  <div className="relative">
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full appearance-none bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500 pr-8"
                    >
                      {PORTFOLIO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block font-code text-xs text-ink-300 mb-2 uppercase tracking-wider">คำบรรยายภาพ</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="เช่น ช่างกำลังลงพื้นที่ทดสอบระบบ Fiber Optic..."
                    className="w-full bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cream-100 focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-ink-900/50 border border-ink-700 cursor-pointer hover:border-ink-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={!editForm.isHidden}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isHidden: !e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <div className="flex flex-col">
                    <span className="font-code text-sm text-cream-200">แสดงบนหน้าเว็บ</span>
                    <span className="font-sans text-[10px] text-ink-400 mt-0.5">ถ้าไม่ติ๊ก รูปจะถูกซ่อนไว้</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-ink-700">
                <button onClick={() => setEditingPhoto(null)} className="flex-1 px-4 py-2 border border-ink-600 text-ink-300 font-code text-sm hover:text-cream-100 transition-colors">
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingId === editingPhoto.id}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-gold-500 text-ink-900 font-code text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  {savingId === editingPhoto.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
