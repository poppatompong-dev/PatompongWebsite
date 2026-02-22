"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Printer, FileText, Save } from "lucide-react";

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
  projectName: string;
  items: LineItem[];
  vatPercent: number;
  note: string;
  paymentTerms: string;
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
  projectName: "",
  items: [emptyItem()],
  vatPercent: 7,
  note: "ราคานี้รวมค่าแรงและค่าวัสดุแล้ว ยังไม่รวม VAT",
  paymentTerms: "ชำระมัดจำ 50% ก่อนเริ่มงาน ส่วนที่เหลือชำระเมื่องานแล้วเสร็จ",
};

function formatThaiDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

function formatNumber(n: number): string {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function QuotationManager() {
  const [data, setData] = useState<QuotationData>(defaultData);
  const printRef = useRef<HTMLDivElement>(null);

  const subtotal = data.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const vatAmount = (subtotal * data.vatPercent) / 100;
  const total = subtotal + vatAmount;

  const updateField = (key: keyof QuotationData, value: string | number) =>
    setData((d) => ({ ...d, [key]: value }));

  const updateItem = (id: string, key: keyof LineItem, value: string | number) =>
    setData((d) => ({
      ...d,
      items: d.items.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
    }));

  const addItem = () => setData((d) => ({ ...d, items: [...d.items, emptyItem()] }));

  const removeItem = (id: string) =>
    setData((d) => ({ ...d, items: d.items.filter((it) => it.id !== id) }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-400" />
          <h2 className="font-heading text-lg font-bold text-cream-100">จัดทำใบเสนอราคา</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setData({ ...defaultData, quotationNo: `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}` })}
            className="flex items-center gap-2 px-3 py-2 border border-ink-600 text-ink-300 hover:text-gold-400 hover:border-gold-400/30 text-xs font-code transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            รีเซ็ต
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white text-xs font-code font-bold hover:bg-gold-400 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            พิมพ์ / บันทึก PDF
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
            <div>
              <label className="font-code text-[10px] text-ink-400 uppercase">ชื่อ / บริษัท</label>
              <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                value={data.clientName} onChange={(e) => updateField("clientName", e.target.value)} placeholder="คุณ / บริษัท..." />
            </div>
            <div>
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
              <label className="font-code text-[10px] text-ink-400 uppercase">ชื่อโครงการ</label>
              <input className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                value={data.projectName} onChange={(e) => updateField("projectName", e.target.value)} placeholder="ติดตั้งกล้องวงจรปิด..." />
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
            <button onClick={addItem}
              className="mt-3 flex items-center gap-1.5 text-xs font-code text-ink-400 hover:text-gold-400 transition-colors">
              <Plus className="w-3.5 h-3.5" /> เพิ่มรายการ
            </button>
          </div>

          {/* Notes */}
          <div className="bg-ink-800 border border-ink-700 p-4 space-y-3">
            <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-2">หมายเหตุ / เงื่อนไข</p>
            <div>
              <label className="font-code text-[10px] text-ink-400 uppercase">หมายเหตุ</label>
              <textarea rows={2} className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 resize-none"
                value={data.note} onChange={(e) => updateField("note", e.target.value)} />
            </div>
            <div>
              <label className="font-code text-[10px] text-ink-400 uppercase">เงื่อนไขการชำระเงิน</label>
              <textarea rows={2} className="w-full mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400 resize-none"
                value={data.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} />
            </div>
            <div>
              <label className="font-code text-[10px] text-ink-400 uppercase">VAT (%)</label>
              <input type="number" className="w-24 mt-1 bg-ink-900 border border-ink-600 text-cream-100 px-2 py-1.5 font-code text-xs focus:outline-none focus:border-gold-400"
                value={data.vatPercent} onChange={(e) => updateField("vatPercent", Number(e.target.value))} min={0} max={100} />
            </div>
          </div>
        </div>

        {/* === PREVIEW PANEL === */}
        <div>
          <p className="font-code text-xs text-gold-400 uppercase tracking-wider mb-3">ตัวอย่างเอกสาร</p>
          <div ref={printRef} id="quotation-print" className="bg-white p-8 text-ink-900 text-sm shadow-lg border border-cream-300 print:shadow-none print:border-none" style={{ fontFamily: "'Noto Sans Thai', 'Prompt', sans-serif" }}>
            {/* Company Header */}
            <div className="flex items-start justify-between mb-6 pb-5 border-b-2 border-ink-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-amber-700 flex items-center justify-center">
                    <span className="font-bold text-white text-xs">PT</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-base text-ink-900">Patompong Tech Consultant</h1>
                    <p className="text-[10px] text-ink-400 tracking-wider">ทีมผู้เชี่ยวชาญระบบไอที · นครสวรรค์</p>
                  </div>
                </div>
                <div className="text-xs text-ink-500 mt-2 space-y-0.5">
                  <p>📞 083-687-0393</p>
                  <p>✉ poppatompong@gmail.com</p>
                  <p>📍 นครสวรรค์ และพื้นที่ใกล้เคียง</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-amber-700 text-white px-4 py-1.5 text-sm font-bold tracking-wider mb-2">ใบเสนอราคา</div>
                <div className="text-xs text-ink-500 space-y-1">
                  <p>เลขที่: <span className="font-bold text-ink-800">{data.quotationNo}</span></p>
                  <p>วันที่: <span className="font-semibold">{formatThaiDate(data.date)}</span></p>
                  <p>ใช้ได้ถึง: <span className="font-semibold">{formatThaiDate(data.validUntil)}</span></p>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="mb-5">
              <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-1">เรียน</p>
              <p className="font-bold text-ink-800">{data.clientName || "—"}</p>
              {data.clientAddress && <p className="text-xs text-ink-500 mt-0.5">{data.clientAddress}</p>}
              {data.clientPhone && <p className="text-xs text-ink-500">โทร: {data.clientPhone}</p>}
              {data.projectName && (
                <p className="text-xs mt-1.5"><span className="text-ink-400">โครงการ:</span> <span className="font-semibold text-ink-700">{data.projectName}</span></p>
              )}
            </div>

            {/* Items table */}
            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="bg-ink-800 text-cream-50">
                  <th className="text-left py-2 px-2 w-6">#</th>
                  <th className="text-left py-2 px-2">รายการ</th>
                  <th className="text-center py-2 px-2 w-14">จำนวน</th>
                  <th className="text-center py-2 px-2 w-10">หน่วย</th>
                  <th className="text-right py-2 px-2 w-24">ราคา/หน่วย</th>
                  <th className="text-right py-2 px-2 w-24">รวม</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? "bg-cream-50" : "bg-white"}>
                    <td className="py-2 px-2 text-ink-400">{i + 1}</td>
                    <td className="py-2 px-2 text-ink-700">{item.description || "—"}</td>
                    <td className="py-2 px-2 text-center text-ink-600">{item.qty}</td>
                    <td className="py-2 px-2 text-center text-ink-500">{item.unit}</td>
                    <td className="py-2 px-2 text-right text-ink-600">{formatNumber(item.unitPrice)}</td>
                    <td className="py-2 px-2 text-right font-semibold text-ink-800">{formatNumber(item.qty * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-5">
              <div className="w-48 text-xs space-y-1">
                <div className="flex justify-between text-ink-600">
                  <span>ราคารวม:</span>
                  <span>{formatNumber(subtotal)}</span>
                </div>
                {data.vatPercent > 0 && (
                  <div className="flex justify-between text-ink-600">
                    <span>VAT {data.vatPercent}%:</span>
                    <span>{formatNumber(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-ink-900 border-t border-ink-200 pt-1 mt-1 text-sm">
                  <span>ยอดรวมทั้งสิ้น:</span>
                  <span className="text-amber-700">{formatNumber(total)} บาท</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.note && (
              <div className="text-xs text-ink-500 mb-3">
                <p className="font-semibold text-ink-600 mb-0.5">หมายเหตุ:</p>
                <p>{data.note}</p>
              </div>
            )}
            {data.paymentTerms && (
              <div className="text-xs text-ink-500 mb-5">
                <p className="font-semibold text-ink-600 mb-0.5">เงื่อนไขการชำระเงิน:</p>
                <p>{data.paymentTerms}</p>
              </div>
            )}

            {/* Signature */}
            <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-cream-300">
              <div className="text-center">
                <div className="h-12 border-b border-ink-400 mb-1" />
                <p className="text-xs text-ink-500">ผู้รับใบเสนอราคา</p>
                <p className="text-[10px] text-ink-400">วันที่: __________</p>
              </div>
              <div className="text-center">
                <div className="h-12 flex items-end justify-center pb-1 border-b border-ink-400 mb-1">
                  <span className="font-heading text-ink-700 italic text-base">Patompong T.</span>
                </div>
                <p className="text-xs font-semibold text-ink-700">ปฐมพงษ์ ลำมะหัด</p>
                <p className="text-[10px] text-ink-400">Patompong Tech Consultant</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #quotation-print, #quotation-print * { visibility: visible; }
          #quotation-print { position: fixed; inset: 0; width: 100%; padding: 20px; }
        }
      `}</style>
    </div>
  );
}
