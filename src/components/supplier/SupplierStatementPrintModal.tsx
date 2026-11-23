import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Download, Phone, MapPin, Truck, Building2, Share2, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import type { Supplier, SupplierTransaction } from '../../types';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';

interface SupplierStatementPrintModalProps {
  isOpen?: boolean;
  supplier: Supplier;
  transactions: SupplierTransaction[];
  onClose: () => void;
}

export const SupplierStatementPrintModal: React.FC<SupplierStatementPrintModalProps> = ({
  isOpen = true,
  supplier,
  transactions,
  onClose
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const { language } = usePos();
  const isUr = language === 'ur';
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        window.print();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Chronological order (oldest to newest for ledger sheet)
  const sortedTxns = [...transactions].sort((a, b) => a.timestamp - b.timestamp);

  const currentDateStr = new Date().toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const currentTimeStr = new Date().toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  const drawStatementOnCanvas = (
    supp: Supplier,
    txs: SupplierTransaction[],
    dateStr: string,
    timeStr: string
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 1200;

    let dynamicHeight = 540;
    txs.forEach((t) => {
      dynamicHeight += 55;
      if (t.vehicleNo || t.biltyNo) dynamicHeight += 24;
      if (t.items && t.items.length > 0) dynamicHeight += t.items.length * 22;
      if (t.paymentMode || t.notes) dynamicHeight += 22;
    });
    dynamicHeight += 380;

    const minHeight = 1697;
    canvas.width = width;
    canvas.height = Math.max(minHeight, dynamicHeight);

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, canvas.height);

    const roundRect = (x: number, y: number, w: number, h: number, r: number, fill = '', stroke = '') => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    };

    // 1. Header Letterhead
    ctx.fillStyle = '#64748b';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('NTN: 4829104-7', 50, 45);
    ctx.fillText('Grain Market License # 104-OK', 50, 68);
    ctx.fillText('Rice Mandi Rawalpindi', 50, 91);

    ctx.textAlign = 'right';
    ctx.fillText(`Date: ${dateStr}`, 1150, 45);
    ctx.fillText(`Time: ${timeStr}`, 1150, 68);
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('Terminal #01', 1150, 91);

    // Center Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 34px "Times New Roman", serif';
    ctx.fillText('BUKHARI RICE TRADERS', width / 2, 55);

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 30px "Noto Nastaliq Urdu", serif';
    ctx.fillText('بخاری رائس ٹریڈرز', width / 2, 102);

    ctx.fillStyle = '#475569';
    ctx.font = '15px monospace';
    ctx.fillText('گلی نمبر 9، لالہ رخ کالونی، چکری روڈ، بنی سٹاپ، راولپنڈی | فون: 0310-5612914', width / 2, 135);

    // Green Badge Pill
    roundRect(320, 155, 560, 36, 18, '#064e3b');
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('SUPPLIER / MILL PURCHASE & PAYMENT LEDGER SHEET', width / 2, 178);

    // Line separator
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 210);
    ctx.lineTo(1150, 210);
    ctx.stroke();

    // 2. Supplier Info Box
    roundRect(50, 230, 1100, 125, 10, '#f8fafc', '#cbd5e1');

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('MILL / SUPPLIER BUSINESS:', 75, 258);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(supp.name, 75, 286);

    if (supp.urduName) {
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 18px "Noto Nastaliq Urdu", serif';
      ctx.fillText(supp.urduName, 75, 316);
    }
    if (supp.contactPerson) {
      ctx.fillStyle = '#334155';
      ctx.font = '14px monospace';
      ctx.fillText(`Proprietor: ${supp.contactPerson}`, 75, 340);
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('LOCATION & CONTACT:', 1125, 258);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`Phone: ${supp.phone}`, 1125, 286);

    ctx.fillStyle = '#334155';
    ctx.font = '14px monospace';
    ctx.fillText(`${supp.city} ${supp.address ? `• ${supp.address}` : ''}`, 1125, 312);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`Status: ${supp.status} • ID: #${supp.id}`, 1125, 338);

    // 3. Three Metric Cards
    const cardY = 375;
    const cardH = 90;
    const cardW = 345;

    roundRect(50, cardY, cardW, cardH, 8, '#fef3c7', '#fde68a');
    ctx.textAlign = 'center';
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TOTAL GOODS PURCHASED (کل خریداری)', 50 + cardW / 2, cardY + 28);
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`PKR ${supp.totalPurchases.toLocaleString()}`, 50 + cardW / 2, cardY + 65);

    roundRect(427, cardY, cardW, cardH, 8, '#eff6ff', '#bfdbfe');
    ctx.fillStyle = '#1e40af';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TOTAL PAID TO MILL (کل ادا شدہ)', 427 + cardW / 2, cardY + 28);
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`PKR ${supp.totalPaid.toLocaleString()}`, 427 + cardW / 2, cardY + 65);

    roundRect(805, cardY, cardW, cardH, 8, '#ffe4e6', '#fecdd3');
    ctx.fillStyle = '#9f1239';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('NET OUTSTANDING PAYABLE (واجب الادا بقایا)', 805 + cardW / 2, cardY + 28);
    ctx.fillStyle = '#881337';
    ctx.font = 'bold 25px monospace';
    ctx.fillText(`PKR ${supp.currentBalance.toLocaleString()}`, 805 + cardW / 2, cardY + 65);

    // 4. Ledger Table Header
    let tableY = 485;
    roundRect(50, tableY, 1100, 38, 6, '#e2e8f0', '#cbd5e1');
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DATE & TIME', 65, tableY + 24);
    ctx.fillText('DESCRIPTION & DETAILS', 220, tableY + 24);

    ctx.textAlign = 'right';
    ctx.fillText('BILL (+)', 800, tableY + 24);
    ctx.fillText('PAID (-)', 960, tableY + 24);
    ctx.fillText('BALANCE', 1135, tableY + 24);

    tableY += 38;

    // Table Rows
    txs.forEach((tx, idx) => {
      const isEven = idx % 2 === 0;
      let rowH = 48;
      if (tx.vehicleNo || tx.biltyNo) rowH += 22;
      if (tx.items && tx.items.length > 0) rowH += tx.items.length * 20;
      if (tx.paymentMode || tx.notes) rowH += 20;

      ctx.fillStyle = isEven ? '#ffffff' : '#f8fafc';
      ctx.fillRect(50, tableY, 1100, rowH);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, tableY + rowH);
      ctx.lineTo(1150, tableY + rowH);
      ctx.stroke();

      let currentY = tableY + 25;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(tx.dateStr, 65, currentY);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.fillText(tx.timeStr, 65, currentY + 18);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(tx.description.slice(0, 52), 220, currentY);

      if (tx.vehicleNo || tx.biltyNo) {
        currentY += 20;
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 12px monospace';
        const veh = tx.vehicleNo ? `Truck: ${tx.vehicleNo}` : '';
        const bl = tx.biltyNo ? `Bilty: ${tx.biltyNo}` : '';
        ctx.fillText([veh, bl].filter(Boolean).join(' • '), 220, currentY);
      }

      if (tx.items && tx.items.length > 0) {
        tx.items.forEach((it) => {
          currentY += 20;
          ctx.fillStyle = '#475569';
          ctx.font = '12px monospace';
          const u = it.unit === 'dozen' ? 'Dozen' : (it.unit === 'pack' ? 'Pack' : 'Bags');
          const itemText = `• ${it.productName} (${it.bags} ${u} @ Rs. ${it.ratePerBag || it.ratePerKg})`;
          ctx.fillText(itemText.slice(0, 55), 230, currentY);
        });
      }

      if (tx.paymentMode || tx.notes) {
        currentY += 20;
        ctx.fillStyle = '#1d4ed8';
        ctx.font = '11px monospace';
        const payText = tx.paymentMode ? `Mode: ${tx.paymentMode} ${tx.referenceNo ? `• Ref: ${tx.referenceNo}` : ''}` : (tx.notes || '');
        ctx.fillText(payText.slice(0, 55), 220, currentY);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(tx.billAmount > 0 ? `PKR ${tx.billAmount.toLocaleString()}` : '-', 800, tableY + 28);

      ctx.fillStyle = '#1d4ed8';
      ctx.fillText(tx.paidAmount > 0 ? `PKR ${tx.paidAmount.toLocaleString()}` : '-', 960, tableY + 28);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`PKR ${tx.balanceAfter.toLocaleString()}`, 1135, tableY + 28);

      tableY += rowH;
    });

    // Total Footer Row
    roundRect(50, tableY, 1100, 42, 6, '#f1f5f9', '#94a3b8');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('TOTAL STATEMENT SUMMARY (کل میزان):', 65, tableY + 26);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`PKR ${supp.totalPurchases.toLocaleString()}`, 800, tableY + 26);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`PKR ${supp.totalPaid.toLocaleString()}`, 960, tableY + 26);

    ctx.fillStyle = '#881337';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`PKR ${supp.currentBalance.toLocaleString()}`, 1135, tableY + 26);

    tableY += 60;

    // 5. Terms & Conditions
    roundRect(50, tableY, 1100, 95, 8, '#f8fafc', '#e2e8f0');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TRADE TERMS & STATEMENT INSTRUCTIONS (شرائط و توثیق):', 70, tableY + 25);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('1. All trades governed under standard Rawalpindi Grain Market weights & moisture standards.', 70, tableY + 46);
    ctx.fillText('2. Discrepancies in weight or bill must be reported within 3 days of delivery.', 70, tableY + 66);
    ctx.fillText('3. Tamam adaiygiyaan bank aur computerized receipt ke sath tasdeeq shuda hain.', 70, tableY + 86);

    tableY += 125;

    // 6. Signatures
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(150, tableY + 30);
    ctx.lineTo(400, tableY + 30);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Warehouse Incharge / Cashier', 275, tableY + 50);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('Bukhari Rice Traders, Rawalpindi', 275, tableY + 68);

    ctx.beginPath();
    ctx.moveTo(800, tableY + 30);
    ctx.lineTo(1050, tableY + 30);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('Mill / Supplier Stamp & Signature', 925, tableY + 50);
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText(supp.name, 925, tableY + 68);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = tableY + 95;
    const finalCtx = finalCanvas.getContext('2d')!;
    finalCtx.drawImage(canvas, 0, 0);

    return finalCanvas;
  };

  const handleDownloadPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);

    try {
      const canvas = drawStatementOnCanvas(supplier, sortedTxns, currentDateStr, currentTimeStr);
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      } else {
        let heightLeft = pdfHeight;
        let position = 0;
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = position - pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
      }

      const cleanName = supplier.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Supplier_Statement_${cleanName}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      notifySuccess(isUr ? 'پی ڈی ایف شیٹ کامیابی سے ڈاؤنلوڈ ہو گئی!' : 'Supplier ledger statement downloaded as PDF!');
    } catch (err) {
      console.error('PDF export error:', err);
      notifyWarning(isUr ? 'پی ڈی ایف بنانے میں خرابی پیش آئی۔' : 'Failed to generate PDF statement.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = supplier.phone.replace(/\D/g, '');
    const targetPhone = cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone;

    const summaryText = encodeURIComponent(
      `🧾 *${isUr ? 'بخاری رائس ٹریڈرز - مل کھاتہ گوشوارہ' : 'Bukhari Rice Traders - Mill Account Statement'}*\n` +
      `🏢 *${isUr ? 'مل کا نام' : 'Mill Name'}:* ${supplier.urduName || supplier.name}\n` +
      `📍 ${isUr ? 'شہر' : 'City'}: ${supplier.city}\n` +
      `📅 ${isUr ? 'تاریخ' : 'Date'}: ${currentDateStr} | ${currentTimeStr}\n` +
      `--------------------------------\n` +
      `📦 *${isUr ? 'کل خریدا گیا مال' : 'Total Stock Inward'}:* PKR ${supplier.totalPurchases.toLocaleString()}\n` +
      `💵 *${isUr ? 'کل ادا شدہ رقم' : 'Total Paid'}:* PKR ${supplier.totalPaid.toLocaleString()}\n` +
      `🚨 *${isUr ? 'واجب الادا بقایا رقم (دینا ہے)' : 'Net Outstanding Balance Payable'}:* PKR ${supplier.currentBalance.toLocaleString()}\n` +
      `--------------------------------\n` +
      `📌 ${isUr ? 'کمپیوٹرائزڈ کھاتہ شیٹ برائے بخاری رائس ٹریڈرز، راولپنڈی (0310-5612914)' : 'Official computer statement from Bukhari Rice Traders, Rawalpindi.'}`
    );

    const waUrl = targetPhone ? `https://wa.me/${targetPhone}?text=${summaryText}` : `https://api.whatsapp.com/send?text=${summaryText}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      {/* Print-specific style tag */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #supplier-printable-statement, #supplier-printable-statement * {
            visibility: visible;
          }
          #supplier-printable-statement {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 border border-emerald-900/20 max-h-[94vh] flex flex-col">
        {/* Header Actions (Excluded in Print) */}
        <div className="no-print bg-emerald-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isUr ? 'مل و سپلائر کھاتہ شیٹ و گوشوارہ' : 'Mill & Supplier Ledger Statement'}</h2>
              <p className="text-xs text-emerald-200">
                {supplier.name} • {supplier.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isUr ? 'پی ڈی ایف محفوظ کریں' : 'Save PDF'}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isUr ? 'واٹس ایپ شیئر' : 'WhatsApp'}</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isUr ? 'پرنٹ [Ctrl+P]' : 'Print Statement'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-emerald-800 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100">
          <div
            id="supplier-printable-statement"
            ref={printAreaRef}
            className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto text-slate-800"
          >
            {/* Mandi Letterhead */}
            <div className="border-b-2 border-emerald-900 pb-4 mb-5 text-center relative">
              <div className="flex justify-between items-start">
                <div className="text-left text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">NTN: 4829104-7</p>
                  <p>Grain Market License # 104-OK</p>
                  <p>Rice Mandi Rawalpindi</p>
                </div>

                <div className="text-center">
                  <h1 className="text-2xl font-black text-emerald-950 tracking-wide font-serif">
                    BUKHARI RICE TRADERS
                  </h1>
                  <h2 className="text-xl font-black text-emerald-800 font-sans mt-0.5">
                    بخاری رائس ٹریڈرز
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    گلی نمبر 9، لالہ رخ کالونی، چکری روڈ، بنی سٹاپ، راولپنڈی | فون: 0310-5612914
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Date: {currentDateStr}</p>
                  <p>Time: {currentTimeStr}</p>
                  <p className="text-emerald-800 font-bold">Terminal #01</p>
                </div>
              </div>

              <div className="mt-3 inline-block bg-emerald-900 text-white px-5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase">
                {isUr ? 'مل و سپلائر خریداری و ادائیگی کھاتہ نقل' : 'Supplier / Mill Purchase & Payment Ledger Sheet'}
              </div>
            </div>

            {/* Supplier Information Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isUr ? 'مل یا فرم کا نام:' : 'Mill / Supplier Business:'}
                </p>
                <p className="text-base font-bold text-slate-900">{supplier.name}</p>
                {supplier.urduName && (
                  <p className="text-sm font-bold text-emerald-900 font-sans mt-0.5" dir="rtl">
                    {supplier.urduName}
                  </p>
                )}
                {supplier.contactPerson && (
                  <p className="text-xs text-slate-600 mt-1">
                    {isUr ? 'مالک / ڈیلر:' : 'Proprietor:'} <strong className="text-slate-800">{supplier.contactPerson}</strong>
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isUr ? 'رابطہ و منڈی علاقہ:' : 'Location & Contact:'}
                </p>
                <p className="text-sm font-bold text-slate-800 flex items-center justify-end gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {supplier.phone}
                </p>
                <p className="text-xs text-slate-600 flex items-center justify-end gap-1 mt-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {supplier.city} {supplier.address ? `• ${supplier.address}` : ''}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Status: <strong className="text-emerald-800">{supplier.status}</strong> • ID: #{supplier.id}
                </p>
              </div>
            </div>

            {/* Account Financial Strip */}
            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                  {isUr ? 'کل خریدا گیا مال (بل رقم)' : 'Total Goods Purchased'}
                </p>
                <p className="text-lg font-black text-amber-950 mt-0.5">
                  PKR {supplier.totalPurchases.toLocaleString()}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">
                  {isUr ? 'کل ادا شدہ رقم (Payment)' : 'Total Paid to Mill'}
                </p>
                <p className="text-lg font-black text-blue-950 mt-0.5">
                  PKR {supplier.totalPaid.toLocaleString()}
                </p>
              </div>

              <div className={`rounded-lg p-3 border ${
                supplier.currentBalance > 0
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  {isUr ? 'واجب الادا بقایا رقم (دینا ہے)' : 'Net Outstanding Payable'}
                </p>
                <p className="text-xl font-black mt-0.5">
                  PKR {supplier.currentBalance.toLocaleString()}
                </p>
                <p className="text-[10px] font-semibold mt-0.5">
                  {supplier.currentBalance > 0
                    ? (isUr ? 'یہ رقم مل کو ادا کرنی باقی ہے' : 'Balance payable to mill')
                    : (isUr ? 'کھاتہ مکمل بیباق ہے' : 'Account Settled / Nil')}
                </p>
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <div className="mb-6 overflow-hidden rounded-lg border border-slate-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 w-28">{isUr ? 'تاریخ' : 'Date'}</th>
                    <th className="py-2.5 px-3">{isUr ? 'تفصیل آمد مال / ادائیگی' : 'Description, Items & Vehicle #'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{isUr ? 'آمد مال (+)' : 'Bill (+)'}</th>
                    <th className="py-2.5 px-3 text-right w-24">{isUr ? 'ادائیگی (-)' : 'Paid (-)'}</th>
                    <th className="py-2.5 px-3 text-right w-28">{isUr ? 'بقایا واجب الادا' : 'Balance'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedTxns.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        {isUr ? 'کوئی ٹرانزیکشن ریکارڈ نہیں ہے۔' : 'No transactions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    sortedTxns.map((txn, idx) => {
                      const isPayment = txn.type === 'PAYMENT';

                      return (
                        <tr key={txn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                          <td className="py-2.5 px-3 align-top whitespace-nowrap text-slate-600 font-medium">
                            {txn.dateStr}
                            <div className="text-[10px] text-slate-400">
                              {txn.timeStr}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 align-top">
                            <div className="font-semibold text-slate-800">
                              {txn.description}
                            </div>

                            {/* Badges for vehicle & bilty */}
                            {(txn.vehicleNo || txn.biltyNo) && (
                              <div className="flex gap-2 mt-1">
                                {txn.vehicleNo && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                                    <Truck className="w-3 h-3 text-slate-500" />
                                    {txn.vehicleNo}
                                  </span>
                                )}
                                {txn.biltyNo && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                    Bilty: {txn.biltyNo}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Itemized Breakdown if available */}
                            {txn.items && txn.items.length > 0 && (
                              <div className="mt-1 space-y-0.5 pl-2 border-l-2 border-emerald-300">
                                  {txn.items.map((it, itemIdx) => {
                                    const isDozen = it.unit === 'dozen';
                                    const isPack = it.unit === 'pack';
                                    const isPcs = it.unit === 'pcs';
                                    const unitName = isDozen
                                      ? (isUr ? 'درجن' : 'Dozen')
                                      : isPack
                                      ? (isUr ? 'پیکٹ' : 'Pack')
                                      : isPcs
                                      ? (isUr ? 'عدد' : 'Pcs')
                                      : (isUr ? 'بوریاں' : 'Bags');
                                    const sizeDesc = isDozen
                                      ? ''
                                      : (it.weightPerBag ? `x ${it.weightPerBag}kg` : '');
                                    const totalDesc = isDozen
                                      ? `(${it.bags * (it.weightPerBag || 12)} pcs)`
                                      : (it.totalKg > 0 ? `= ${it.totalKg.toLocaleString()} KG` : '');
                                    const rateDesc = it.ratePerBag
                                      ? `Rs. ${it.ratePerBag}/${isDozen ? (isUr ? 'درجن' : 'dozen') : isPack ? (isUr ? 'پیکٹ' : 'pack') : (isUr ? 'بوری' : 'bag')}`
                                      : `Rs. ${it.ratePerKg}/KG`;

                                    return (
                                      <div key={itemIdx} className="text-[11px] text-slate-600 flex justify-between">
                                        <span>
                                          • {it.urduName || it.productName} ({it.bags} {unitName} {sizeDesc} {totalDesc} @ {rateDesc})
                                        </span>
                                        <span className="font-bold text-slate-800">PKR {it.subtotal.toLocaleString()}</span>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}

                            {/* Payment details */}
                            {isPayment && (
                              <div className="text-[11px] text-blue-800 mt-1">
                                {isUr ? 'طریقہ ادائیگی:' : 'Mode:'} <span className="font-bold uppercase">{txn.paymentMode || 'Bank'}</span>
                                {txn.referenceNo && ` • Ref: ${txn.referenceNo}`}
                              </div>
                            )}

                            {txn.notes && (
                              <div className="text-[10px] text-slate-400 italic mt-0.5">{txn.notes}</div>
                            )}
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-bold text-amber-900 whitespace-nowrap">
                            {txn.billAmount > 0 ? `PKR ${txn.billAmount.toLocaleString()}` : '-'}
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-bold text-blue-700 whitespace-nowrap">
                            {txn.paidAmount > 0 ? `PKR ${txn.paidAmount.toLocaleString()}` : '-'}
                          </td>

                          <td className="py-2.5 px-3 align-top text-right font-black text-slate-900 whitespace-nowrap">
                            PKR {txn.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-slate-700">
                      {isUr ? 'کل میزان (میزان کل کھاتہ):' : 'Total Statement Summary:'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-950 font-black">
                      PKR {supplier.totalPurchases.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-950 font-black">
                      PKR {supplier.totalPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-base text-rose-950 font-black">
                      PKR {supplier.currentBalance.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mandi Notice / Instructions */}
            <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded p-3 mb-6">
              <p className="font-semibold text-slate-700">{isUr ? 'شرائط و توثیق کھاتہ:' : 'Trade Terms & Statement Verification:'}</p>
              {isUr ? (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[11px] text-slate-600">
                  <li>تمام خریداری و آمد مال راولپنڈی غلہ منڈی کے مقررہ اوزان و نمی معیار کے مطابق مصدقہ ہے۔</li>
                  <li>کسی بھی وزن، بلٹی یا ریٹ میں فرق کی صورت میں مال وصولی کے 3 یوم کے اندر تحریری اطلاع لازمی ہے۔</li>
                  <li>بینک یا چیک ادائیگی کے بعد ٹرانزیکشن رسید کی فوٹو کاپی کھاتے میں محفوظ کر لی جاتی ہے۔</li>
                </ul>
              ) : (
                <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[10px] text-slate-600">
                  <li>All goods arrivals verified under official Mandi weighing and moisture standards.</li>
                  <li>Discrepancies in weight or freight must be reported within 3 days of delivery.</li>
                  <li>Bank/Cheque transactions verified against electronic bank statements.</li>
                </ul>
              )}
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-300 text-xs text-center">
              <div>
                <div className="w-44 border-b border-slate-400 mx-auto mb-1.5 h-8"></div>
                <p className="font-semibold text-slate-800">{isUr ? 'دستخط انچارج گودام / کیشیئر' : 'Warehouse Incharge / Cashier'}</p>
                <p className="text-[10px] text-slate-400">Bukhari Rice Traders, Rawalpindi</p>
              </div>

              <div>
                <div className="w-44 border-b border-slate-400 mx-auto mb-1.5 h-8"></div>
                <p className="font-semibold text-slate-800">{isUr ? 'مہر و تصدیق مل / سپلائر' : 'Mill / Supplier Stamp & Signature'}</p>
                <p className="text-[10px] text-slate-400">{supplier.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="no-print bg-slate-100 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Supplier ID: #{supplier.id} • Registered: {supplier.createdAt}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            {isUr ? 'بند کریں [ESC]' : 'Close [ESC]'}
          </button>
        </div>
      </div>
    </div>
  );
};
