"use client";

import { useState, useEffect } from "react";
import { Camera, Search, Plus, Filter, Tag, Check, X, Image as ImageIcon, UploadCloud, RefreshCw, Save } from "lucide-react";
import Image from "next/image";
import { getAllRawPhotos } from "@/actions/gallery";
import { getSavedPhotos, savePhotoMetadata, togglePhotoVisibility } from "@/actions/galleryDb";

interface RawPhoto {
  id: string;
  url: string;
  category?: string;
  description?: string;
  isHidden?: boolean;
  isSaved?: boolean;
}

export default function GalleryManager() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [photos, setPhotos] = useState<RawPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingPhoto, setEditingPhoto] = useState<RawPhoto | null>(null);
  const [editForm, setEditForm] = useState({ category: "Uncategorized", description: "", isHidden: false });

  const categories = [
    "all", "CCTV & Security", "Network & Fiber", "Software & AI", "On-site Work", "Team & Training", "Uncategorized"
  ];

  useEffect(() => {
    loadPhotos();
  }, []);

  async function loadPhotos() {
    setLoading(true);
    try {
      // 1. Fetch raw photos from Google
      const rawPhotos = await getAllRawPhotos();
      
      // 2. Fetch saved metadata from SQLite DB
      const savedMetadata = await getSavedPhotos();
      const metadataMap = new Map(savedMetadata.map(p => [p.id, p]));

      // 3. Merge them
      const mergedPhotos = rawPhotos.map((photo) => {
        const saved = metadataMap.get(photo.id);
        if (saved) {
          return {
            ...photo,
            category: saved.category,
            description: saved.description || "",
            isHidden: saved.isHidden,
            isSaved: true
          };
        }
        return {
          ...photo,
          category: "Uncategorized",
          description: "",
          isHidden: true, // Default to hidden until approved
          isSaved: false
        };
      });
      
      setPhotos(mergedPhotos);
    } catch (err) {
      console.error("Failed to load photos", err);
    } finally {
      setLoading(false);
    }
  }

  const handleToggleVisibility = async (id: string, currentIsHidden: boolean) => {
    setSavingId(id);
    try {
      // Optistic update
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, isHidden: !currentIsHidden } : p));
      
      const result = await togglePhotoVisibility(id, !currentIsHidden);
      if (!result.success) {
        // Revert on failure
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, isHidden: currentIsHidden } : p));
        alert("Failed to update visibility");
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPhoto) return;
    
    setSavingId(editingPhoto.id);
    try {
      const result = await savePhotoMetadata({
        id: editingPhoto.id,
        category: editForm.category,
        description: editForm.description,
        isHidden: editForm.isHidden
      });

      if (result.success) {
        setPhotos(prev => prev.map(p => p.id === editingPhoto.id ? {
          ...p,
          category: editForm.category,
          description: editForm.description,
          isHidden: editForm.isHidden,
          isSaved: true
        } : p));
        setEditingPhoto(null);
      } else {
        alert("Failed to save photo metadata");
      }
    } finally {
      setSavingId(null);
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = activeCategory === "all" || photo.category === activeCategory;
    const matchesSearch = !searchQuery || (photo.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-cream-100 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-gold-400" />
            ระบบจัดการรูปภาพผลงาน
          </h2>
          <p className="font-code text-sm text-ink-400 mt-1">
            จัดการรูปภาพจาก Google Photos หรืออัปโหลดใหม่
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-ink-600 text-ink-300 font-code text-sm hover:text-gold-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            ซิงค์ล่าสุด
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-ink-900 font-code text-sm font-bold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20">
            <UploadCloud className="w-4 h-4" />
            เชื่อม Cloudinary
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-ink-800 border border-ink-700 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            placeholder="ค้นหาจากคำบรรยายภาพ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink-900 border border-ink-600 pl-10 pr-4 py-2 text-sm text-cream-100 font-sans focus:outline-none focus:border-gold-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter className="w-4 h-4 text-ink-400 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-code whitespace-nowrap transition-colors border ${
                activeCategory === cat
                  ? "bg-gold-500/20 text-gold-400 border-gold-500/50"
                  : "bg-ink-900 text-ink-400 border-ink-700 hover:border-ink-500"
              }`}
            >
              {cat === "all" ? "ทั้งหมด" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 p-4 flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse mt-1.5 shrink-0" />
        <div>
          <h4 className="font-code text-sm font-semibold text-blue-300">
            Google Photos Live Sync {photos.length > 0 && `(ดึงมาได้ทั้งหมด ${photos.length} รูป)`}
          </h4>
          <p className="font-sans text-xs text-blue-200/70 mt-1 max-w-4xl">
            ระบบดึงรูปทั้งหมดจากอัลบั้มมาแสดงแล้ว เพื่อให้เว็บโหลดเร็วที่สุด โปรดเลือกเฉพาะภาพที่ดีที่สุด (Curated) และตั้งค่าหมวดหมู่ 
            ส่วนภาพที่ไม่ได้เลือกจะถูกซ่อนไว้โดยอัตโนมัติ
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-4 text-gold-500" />
          <p className="font-code text-sm">กำลังดึงข้อมูลภาพทั้งหมดจาก Google Photos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.slice(0, 48).map((photo, i) => (
            <div key={photo.id} className="bg-ink-800 border border-ink-700 group relative flex flex-col">
              <div className="aspect-video relative overflow-hidden bg-ink-900">
                <Image
                  src={photo.url}
                  alt={photo.id}
                  fill
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${photo.isHidden ? 'opacity-40 grayscale' : ''}`}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-ink-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => {
                      setEditingPhoto(photo);
                      setEditForm({
                        category: photo.category || "Uncategorized",
                        description: photo.description || "",
                        isHidden: photo.isHidden || false
                      });
                    }}
                    className="px-3 py-1.5 bg-gold-500 text-ink-900 text-xs font-bold font-code shadow-lg hover:bg-gold-400 transition-colors"
                  >
                    ตั้งค่าหมวดหมู่
                  </button>
                  <button 
                    onClick={() => handleToggleVisibility(photo.id, photo.isHidden || false)}
                    disabled={savingId === photo.id}
                    className={`px-3 py-1.5 text-xs font-bold font-code border backdrop-blur-sm transition-colors ${
                      savingId === photo.id ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      photo.isHidden 
                      ? "bg-green-500/20 text-green-400 border-green-500/50 hover:bg-green-500 hover:text-white" 
                      : "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    {savingId === photo.id ? "กำลังบันทึก..." : (photo.isHidden ? "นำกลับมาแสดง" : "ซ่อน")}
                  </button>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2 z-10 pointer-events-none">
                  {photo.isHidden ? (
                    <span className="bg-ink-900/90 border border-ink-600 text-ink-400 text-[10px] px-2 py-0.5 font-code flex items-center gap-1 backdrop-blur-sm shadow-md">
                      <X className="w-3 h-3" /> ซ่อนไว้
                    </span>
                  ) : (
                    <span className="bg-green-600/90 border border-green-400 text-white text-[10px] px-2 py-0.5 font-code flex items-center gap-1 backdrop-blur-sm shadow-md">
                      <Check className="w-3 h-3" /> แสดงผล
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3 h-3 text-gold-500" />
                    <span className="font-code text-[10px] text-gold-400 uppercase">
                      {photo.category}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-cream-200 line-clamp-2 leading-relaxed opacity-60 italic">
                    {photo.description || "ยังไม่มีคำบรรยายภาพ คลิก 'ตั้งค่าหมวดหมู่' เพื่อเพิ่มคำบรรยาย"}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-ink-700 flex justify-between items-center text-[9px] font-code text-ink-500">
                  <span>ID: {photo.id.substring(0, 8)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination Placeholder */}
      {!loading && filteredPhotos.length > 48 && (
        <div className="flex flex-col items-center gap-4 pt-6 pb-12">
          <p className="text-ink-400 text-xs font-code">แสดง 48 จาก {filteredPhotos.length} รูปภาพ</p>
          <button className="px-6 py-2 bg-ink-800 border border-ink-600 text-cream-200 font-code text-sm hover:border-gold-500 hover:text-gold-400 transition-colors rounded">
            โหลดรูปภาพเพิ่มเติม
          </button>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 z-[100] bg-ink-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ink-800 border border-ink-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
            {/* Image Preview */}
            <div className="w-full md:w-1/2 aspect-video md:aspect-auto relative bg-ink-900 border-b md:border-b-0 md:border-r border-ink-700">
              <Image
                src={editingPhoto.url}
                alt={editingPhoto.id}
                fill
                className="object-contain p-4"
              />
            </div>
            
            {/* Form */}
            <div className="w-full md:w-1/2 p-6 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading text-lg font-bold text-cream-100">ตั้งค่ารูปภาพ</h3>
                  <p className="font-code text-[10px] text-ink-500 mt-1">ID: {editingPhoto.id}</p>
                </div>
                <button 
                  onClick={() => setEditingPhoto(null)}
                  className="text-ink-400 hover:text-cream-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block font-code text-xs text-ink-300 mb-2 uppercase tracking-wider">หมวดหมู่ผลงาน</label>
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cream-100 font-sans focus:outline-none focus:border-gold-500"
                  >
                    {categories.filter(c => c !== "all").map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-code text-xs text-ink-300 mb-2 uppercase tracking-wider">คำบรรยายภาพ (เพื่อให้ลูกค้าเข้าใจงาน)</label>
                  <textarea 
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="เช่น ช่างกำลังลงพื้นที่ทดสอบระบบสายไฟเบอร์ออปติก..."
                    className="w-full bg-ink-900 border border-ink-600 px-3 py-2 text-sm text-cream-100 font-sans focus:outline-none focus:border-gold-500 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-ink-900/50 border border-ink-700 cursor-pointer hover:border-ink-600 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={!editForm.isHidden}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isHidden: !e.target.checked }))}
                    className="w-4 h-4 rounded border-ink-600 text-gold-500 focus:ring-gold-500 focus:ring-offset-ink-900"
                  />
                  <div className="flex flex-col">
                    <span className="font-code text-sm text-cream-200">อนุญาตให้แสดงบนหน้าเว็บ</span>
                    <span className="font-sans text-[10px] text-ink-400 mt-0.5">ถ้าไม่ติ๊ก รูปจะถูกซ่อนไว้ในระบบหลังบ้านเท่านั้น</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-ink-700">
                <button 
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 px-4 py-2 border border-ink-600 text-ink-300 font-code text-sm hover:text-cream-100 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={savingId === editingPhoto.id}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-gold-500 text-ink-900 font-code text-sm font-bold hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingId === editingPhoto.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
