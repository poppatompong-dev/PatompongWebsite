"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Printer, FileText, Save, RotateCcw } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

interface QuotationData {
  quotationNo: string;
  date: string;
  validUntil: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientTaxId: string;
  projectName: string;
  items: LineItem[];
  vatPercent: number;
  includeVat: boolean;
  note: string;
  paymentTerms: string;
  warranty: string;
  deliveryDays: string;
}

const emptyItem = (): LineItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  qty: 1,
  unit: "ชุด",
  unitPrice: 0,
});

const defaultData: QuotationData = {
  quotationNo: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  date: new Date().toISOString().split("T")[0],
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  clientName: "",
  clientAddress: "",
  clientPhone: "",
  clientTaxId: "",
  projectName: "",
  items: [emptyItem()],
  vatPercent: 7,
  includeVat: true,
  note: "ราคานี้รวมค่าแรงและค่าวัสดุแล้ว",
  paymentTerms: "ชำระมัดจำ 50% ก่อนเริ่มงาน ส่วนที่เหลือชำระเมื่องานแล้วเสร็จ",
  warranty: "รับประกัน 1 ปี",
  deliveryDays: "7-14 วันทำการ",
};

function formatThaiDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

function formatNumber(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToThaiText(num: number): string {
  if (num === 0) return "ศูนย์บาทถ้วน";
  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);
  let result = "";
  const s = intPart.toString();
  const len = s.length;
  for (let i = 0; i < len; i++) {
    const d = parseInt(s[i]);
    const pos = len - i - 1;
    if (d === 0) continue;
    if (pos === 1 && d === 1) { result += "สิบ"; continue; }
    if (pos === 1 && d === 2) { result += "ยี่สิบ"; continue; }
    if (pos === 0 && d === 1 && len > 1) { result += "เอ็ด"; continue; }
    result += digits[d] + positions[pos];
  }
  result += "บาท";
  if (decPart > 0) {
    const ds = decPart.toString().padStart(2, "0");
    const d1 = parseInt(ds[0]);
    const d2 = parseInt(ds[1]);
    if (d1 === 1) result += "สิบ";
    else if (d1 === 2) result += "ยี่สิบ";
    else if (d1 > 0) result += digits[d1] + "สิบ";
    if (d2 === 1 && d1 > 0) result += "เอ็ด";
    else if (d2 > 0) result += digits[d2];
    result += "สตางค์";
  } else {
    result += "ถ้วน";
  }
  return result;
}

export default function QuotationManager() {
  const [data, setData] = useState<QuotationData>(defaultData);
  const printRef = useRef<HTMLDivElement>(null);

  const subtotal = data.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const vatAmount = data.includeVat ? (subtotal * data.vatPercent) / 100 : 0;
  const total = subtotal + vatAmount;

  const updateField = (key: keyof QuotationData, value: string | number | boolean) =>
    setData((d) => ({ ...d, [key]: value }));

  const updateItem = (id: string, key: keyof LineItem, value: string | number) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    }));

  const addItem = () => setData((d) => ({ ...d, items: [...d.items, emptyItem()] }));

  const removeItem = (id: string) =>
    setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));

  const handleReset = () =>
    setData({ ...defaultData, quotationNo: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}` });

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-400" />
          <h2 className="font-heading text-lg font-bold text-cream-100">จัดทำใบเสนอราคา</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-2 px-3 py-2 border border-ink-600 text-ink-300 hover:text-gold-400 hover:border-gold-400/30 text-xs font-code transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ต
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white text-xs font-code font-bold hover:bg-gold-400 transition-colors">
            <Printer className="w-3.5 h-3.5" /> พิมพ์ / บันทึก PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* === FORM PANEL === */}
        <div className="space-y-4">
          {/* Header info */}
          <div className="bg-ink-800 border border-ink-700 p-4 space-y-3">
            <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-2">ข้อมูลเอกสาร</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">เลขที่</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.quotationNo} onChange={(e) => updateField("quotationNo", e.target.value)} />
              </div>
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">วันที่</label>
                <input type="date" className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.date} onChange={(e) => updateField("date", e.target.value)} />
              </div>
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">ใช้ได้ถึง</label>
                <input type="date" className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.validUntil} onChange={(e) => updateField("validUntil", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="bg-ink-800 border border-ink-700 p-4 space-y-3">
            <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-2">ข้อมูลลูกค้า</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="font-code text-[10px] text-ink-400 uppercase">ชื่อ / บริษัท</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.clientName} onChange={(e) => updateField("clientName", e.target.value)} placeholder="คุณ / บริษัท..." />
              </div>
              <div className="col-span-2">
                <label className="font-code text-[10px] text-ink-400 uppercase">ที่อยู่</label>
                <textarea rows={2} className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 resize-none"
                  value={data.clientAddress} onChange={(e) => updateField("clientAddress", e.target.value)} placeholder="ที่อยู่..." />
              </div>
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">เบอร์โทร</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.clientPhone} onChange={(e) => updateField("clientPhone", e.target.value)} placeholder="083-xxx-xxxx" />
              </div>
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">เลขผู้เสียภาษี</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.clientTaxId} onChange={(e) => updateField("clientTaxId", e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" />
              </div>
              <div className="col-span-2">
                <label className="font-code text-[10px] text-ink-400 uppercase">ชื่อโครงการ</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.projectName} onChange={(e) => updateField("projectName", e.target.value)} placeholder="ติดตั้งกล้องวงจรปิด..." />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-ink-800 border border-ink-700 p-4">
            <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-3">รายการสินค้า/บริการ</p>
            <div className="space-y-2">
              {data.items.map((item, i) => (
                <div key={item.id} className="grid grid-cols-12 gap-1.5 items-start">
                  <div className="col-span-5">
                    {i === 0 && <label className="font-code text-[10px] text-ink-500 block mb-1">รายการ</label>}
                    <input className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                      value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="รายการ..." />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="font-code text-[10px] text-ink-500 block mb-1">จำนวน</label>}
                    <input type="number" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 text-center"
                      value={item.qty} onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))} min={1} />
                  </div>
                  <div className="col-span-1">
                    {i === 0 && <label className="font-code text-[10px] text-ink-500 block mb-1">หน่วย</label>}
                    <input className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-1 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 text-center"
                      value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="font-code text-[10px] text-ink-500 block mb-1">ราคา/หน่วย</label>}
                    <input type="number" className="w-full bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 text-right"
                      value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} min={0} />
                  </div>
                  <div className="col-span-1 flex items-end justify-center pb-0.5">
                    {i === 0 && <div className="h-5 mb-1" />}
                    <button onClick={() => removeItem(item.id)} disabled={data.items.length === 1}
                      className="text-ink-500 hover:text-red-400 transition-colors disabled:opacity-30">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-3 flex items-center gap-1.5 text-xs font-code text-ink-400 hover:text-gold-400 transition-colors">
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
            </button>
          </div>

          {/* Notes */}
          <div className="bg-ink-800 border border-ink-700 p-4 space-y-3">
            <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-2">เงื่อนไขเพิ่มเติม</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">การรับประกัน</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.warranty} onChange={(e) => updateField("warranty", e.target.value)} />
              </div>
              <div>
                <label className="font-code text-[10px] text-ink-400 uppercase">ระยะเวลาดำเนินงาน</label>
                <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                  value={data.deliveryDays} onChange={(e) => updateField("deliveryDays", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="font-code text-[10px] text-ink-400 uppercase">หมายเหตุ</label>
                <textarea rows={2} className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 resize-none"
                  value={data.note} onChange={(e) => updateField("note", e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="font-code text-[10px] text-ink-400 uppercase">เงื่อนไขการชำระเงิน</label>
                <textarea rows={2} className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 resize-none"
                  value={data.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.includeVat} onChange={(e) => updateField("includeVat", e.target.checked)}
                    className="accent-gold-500 w-4 h-4" />
                  <span className="font-code text-xs text-ink-300">รวม VAT</span>
                </label>
                {data.includeVat && (
                  <div className="flex items-center gap-1">
                    <input type="number" className="w-16 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1 font-code text-xs text-center"
                      value={data.vatPercent} onChange={(e) => updateField("vatPercent", Number(e.target.value))} min={0} max={100} />
                    <span className="text-ink-400 text-xs">%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === PREVIEW PANEL — Premium Design === */}
        <div>
          <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-3">ตัวอย่างเอกสาร (Preview)</p>
          <div ref={printRef} id="quotation-print" className="bg-white text-slate-800 shadow-xl border border-slate-200 print:shadow-none print:border-none overflow-hidden"
            style={{ fontFamily: "'Noto Sans Thai', 'Prompt', sans-serif", fontSize: "13px" }}>

            {/* Top accent */}
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500" />

            {/* Header */}
            <div className="px-8 pt-6 pb-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center shadow-md">
                    <span className="font-bold text-white text-xl">PT</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-800 leading-tight">Patompong Tech Consultant</h1>
                    <p className="text-[11px] text-slate-400 mt-0.5">ทีมผู้เชี่ยวชาญระบบไอที · CCTV · Network · Software</p>
                    <div className="flex gap-4 mt-2 text-[11px] text-slate-500">
                      <span>📞 083-687-0393</span>
                      <span>✉ poppatompong@gmail.com</span>
                    </div>
                    <p className="text-[11px] text-slate-500">📍 นครสวรรค์ และพื้นที่ใกล้เคียง</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-5 py-2 rounded-md text-sm font-bold tracking-wide shadow-sm">
                    ใบเสนอราคา
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                    <p>เลขที่: <span className="font-bold text-slate-700">{data.quotationNo}</span></p>
                    <p>วันที่: <span className="font-semibold">{formatThaiDate(data.date)}</span></p>
                    <p>ใช้ได้ถึง: <span className="font-semibold">{formatThaiDate(data.validUntil)}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-8 border-t border-slate-200" />

            {/* Client Info */}
            <div className="px-8 py-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">เรียน</p>
                <p className="font-bold text-slate-800 text-base">{data.clientName || "—"}</p>
                {data.clientAddress && <p className="text-[12px] text-slate-500 mt-0.5">{data.clientAddress}</p>}
                <div className="flex gap-6 mt-1">
                  {data.clientPhone && <p className="text-[11px] text-slate-500">โทร: <span className="font-semibold">{data.clientPhone}</span></p>}
                  {data.clientTaxId && <p className="text-[11px] text-slate-500">เลขผู้เสียภาษี: <span className="font-semibold">{data.clientTaxId}</span></p>}
                </div>
                {data.projectName && (
                  <p className="text-[12px] mt-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-400">โครงการ:</span> <span className="font-bold text-amber-700">{data.projectName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="px-8">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                    <th className="text-center py-2.5 px-2 w-8 rounded-tl-md">ลำดับ</th>
                    <th className="text-left py-2.5 px-3">รายการ</th>
                    <th className="text-center py-2.5 px-2 w-14">จำนวน</th>
                    <th className="text-center py-2.5 px-2 w-12">หน่วย</th>
                    <th className="text-right py-2.5 px-3 w-24">ราคา/หน่วย</th>
                    <th className="text-right py-2.5 px-3 w-24 rounded-tr-md">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, i) => (
                    <tr key={item.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                      <td className="py-2.5 px-2 text-center text-slate-400 font-semibold">{i + 1}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.description || "—"}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{item.qty}</td>
                      <td className="py-2.5 px-2 text-center text-slate-500">{item.unit}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{formatNumber(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800 font-mono">{formatNumber(item.qty * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="px-8 py-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5">
                  <div className="flex justify-between text-[12px] text-slate-600 px-3 py-1">
                    <span>ราคารวม</span>
                    <span className="font-mono">{formatNumber(subtotal)} บาท</span>
                  </div>
                  {data.includeVat && (
                    <div className="flex justify-between text-[12px] text-slate-600 px-3 py-1">
                      <span>ภาษีมูลค่าเพิ่ม {data.vatPercent}%</span>
                      <span className="font-mono">{formatNumber(vatAmount)} บาท</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-md px-3 py-2.5 mt-2">
                    <span className="font-bold text-slate-700 text-sm">ยอดรวมทั้งสิ้น</span>
                    <span className="font-bold text-amber-700 text-lg font-mono">{formatNumber(total)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right px-1 mt-1">({numberToThaiText(total)})</p>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="px-8 pb-4">
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                {data.note && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                    <p className="font-bold text-blue-700 mb-1">📋 หมายเหตุ</p>
                    <p className="text-blue-600">{data.note}</p>
                  </div>
                )}
                {data.paymentTerms && (
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <p className="font-bold text-green-700 mb-1">💰 เงื่อนไขการชำระเงิน</p>
                    <p className="text-green-600">{data.paymentTerms}</p>
                  </div>
                )}
                {data.warranty && (
                  <div className="bg-purple-50 border border-purple-100 rounded-md p-3">
                    <p className="font-bold text-purple-700 mb-1">🛡 การรับประกัน</p>
                    <p className="text-purple-600">{data.warranty}</p>
                  </div>
                )}
                {data.deliveryDays && (
                  <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                    <p className="font-bold text-amber-700 mb-1">📦 ระยะเวลาดำเนินงาน</p>
                    <p className="text-amber-600">{data.deliveryDays}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Area */}
            <div className="px-8 pb-6">
              <div className="border-t border-slate-200 pt-6">
                <div className="grid grid-cols-2 gap-12">
                  <div className="text-center">
                    <div className="h-16 border-b-2 border-slate-300 mb-2 flex items-end justify-center pb-1">
                      <span className="text-[11px] text-slate-300">ลงชื่อ</span>
                    </div>
                    <p className="text-[12px] font-semibold text-slate-600">ผู้รับใบเสนอราคา</p>
                    <p className="text-[10px] text-slate-400">วันที่ ____/____/________</p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 border-b-2 border-amber-400 mb-2 flex items-end justify-center pb-1">
                      <span className="text-lg italic text-amber-700 font-heading">Patompong T.</span>
                    </div>
                    <p className="text-[12px] font-bold text-slate-700">ปฐมพงษ์ ลำมะหัด</p>
                    <p className="text-[10px] text-slate-400">Patompong Tech Consultant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500" />
          </div>
        </div>
      </div>

      <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #quotation-print, #quotation-print * { visibility: visible; }
                    #quotation-print { position: fixed; inset: 0; width: 100%; padding: 0; }
                    @page { margin: 0; size: A4; }
                }
            `}</style>
    </div>
  );
}
