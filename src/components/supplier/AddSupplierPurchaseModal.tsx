import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Plus, Trash2, Truck, FileText, CheckCircle2, Layers } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { notifySuccess, notifyWarning } from '../../utils/toast';
import { NumberInput } from '../common/NumberInput';
import type { Supplier, SupplierItemEntry } from '../../types';

interface AddSupplierPurchaseModalProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
}

interface ItemRow {
  productName: string;
  urduName?: string;
  bags: number;
  weightPerBag: number;
  unit: 'kg' | 'dozen' | 'pack' | 'pcs' | string;
  ratePerBag: number;
  ratePerKg: number;
  rateMode: 'bag' | 'kg';
}

export const AddSupplierPurchaseModal: React.FC<AddSupplierPurchaseModalProps> = ({
  isOpen,
  supplier,
  onClose
}) => {
  const { addSupplierPurchase, inventory, language, suppliers } = usePos();
  const isUr = language === 'ur';

  const [selectedSuppId, setSelectedSuppId] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [biltyNo, setBiltyNo] = useState<string>('');
  const [updateStock, setUpdateStock] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const [rows, setRows] = useState<ItemRow[]>([
    {
      productName: '',
      bags: 50,
      weightPerBag: 25,
      unit: 'kg',
      ratePerBag: 9000,
      ratePerKg: 360,
      rateMode: 'bag'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSuppId(supplier?.id || suppliers[0]?.id || '');
      setVehicleNo('');
      setBiltyNo('');
      setUpdateStock(true);
      setNotes('');
      setRows([
        {
          productName: inventory[0]?.varietyName || 'Super Kainat Steam',
          urduName: inventory[0]?.urduName,
          bags: 50,
          weightPerBag: 25,
          unit: 'kg',
          ratePerBag: 9000,
          ratePerKg: 360,
          rateMode: 'bag'
        }
      ]);
    }
  }, [isOpen, supplier, suppliers, inventory]);

  if (!isOpen) return null;

  const currentSupp = suppliers.find((s) => s.id === selectedSuppId) || supplier;

  const handleRowChange = (index: number, field: keyof ItemRow, val: any) => {
    setRows((prev) => {
      const next = [...prev];
      const r = { ...next[index], [field]: val };

      if (field === 'productName') {
        const matched = inventory.find((i) => i.varietyName.toLowerCase() === String(val).toLowerCase());
        if (matched) {
          r.urduName = matched.urduName;
          const bagWt = matched.unitsPerPack || 25;
          r.weightPerBag = bagWt;
          r.unit = matched.unitType === 'piece' ? 'pcs' : 'kg';
          r.ratePerKg = matched.costPerKg;
          r.ratePerBag = Math.round(matched.costPerKg * bagWt);
        }
      }

      if (field === 'unit') {
        if (val === 'dozen' && (!r.weightPerBag || r.weightPerBag === 25)) {
          r.weightPerBag = 12;
        } else if (val === 'kg' && r.weightPerBag === 12) {
          r.weightPerBag = 25;
        }
      }

      if (field === 'ratePerBag') {
        const bagWt = r.weightPerBag > 0 ? r.weightPerBag : 1;
        r.ratePerKg = Math.round((Number(val) / bagWt) * 100) / 100;
      } else if (field === 'ratePerKg') {
        const bagWt = r.weightPerBag > 0 ? r.weightPerBag : 1;
        r.ratePerBag = Math.round(Number(val) * bagWt);
      } else if (field === 'weightPerBag') {
        const bagWt = Number(val) > 0 ? Number(val) : 1;
        if (r.rateMode === 'bag') {
          r.ratePerKg = Math.round((r.ratePerBag / bagWt) * 100) / 100;
        } else {
          r.ratePerBag = Math.round(r.ratePerKg * bagWt);
        }
      }

      next[index] = r;
      return next;
    });
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        productName: inventory[0]?.varietyName || '',
        urduName: inventory[0]?.urduName,
        bags: 50,
        weightPerBag: 25,
        unit: 'kg',
        ratePerBag: 9000,
        ratePerKg: 360,
        rateMode: 'bag'
      }
    ]);
  };

  const removeRow = (idx: number) => {
    if (rows.length === 1) return;
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalBags = rows.reduce((sum, r) => sum + (Number(r.bags) || 0), 0);
  const totalKg = rows.reduce((sum, r) => {
    if (r.unit === 'dozen') return sum;
    return sum + ((Number(r.bags) || 0) * (Number(r.weightPerBag) || 0));
  }, 0);

  const totalAmount = rows.reduce((sum, r) => {
    const qty = Number(r.bags) || 0;
    const wt = Number(r.weightPerBag) || 0;
    let subtotal = 0;
    if (r.unit === 'dozen') {
      subtotal = r.rateMode === 'bag'
        ? qty * (Number(r.ratePerBag) || 0)
        : (qty * (wt > 0 ? wt : 12)) * (Number(r.ratePerKg) || 0);
    } else {
      subtotal = r.rateMode === 'bag'
        ? qty * (Number(r.ratePerBag) || 0)
        : (qty * wt) * (Number(r.ratePerKg) || 0);
    }
    return sum + subtotal;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuppId) {
      notifyWarning(isUr ? 'برائے مہربانی مل یا سپلائر منتخب کریں' : 'Please select a mill or supplier');
      return;
    }
    if (totalAmount <= 0) {
      notifyWarning(isUr ? 'درست مال اور خریداری ریٹ درج کریں' : 'Please enter valid items and rates');
      return;
    }

    const items: SupplierItemEntry[] = rows.map((r) => {
      const qty = Number(r.bags) || 0;
      const wt = Number(r.weightPerBag) || 0;
      let totalWeightOrPcs = 0;
      let subtotal = 0;

      if (r.unit === 'dozen') {
        totalWeightOrPcs = qty * (wt > 0 ? wt : 12);
        subtotal = r.rateMode === 'bag'
          ? qty * (Number(r.ratePerBag) || 0)
          : totalWeightOrPcs * (Number(r.ratePerKg) || 0);
      } else {
        totalWeightOrPcs = qty * wt;
        subtotal = r.rateMode === 'bag'
          ? qty * (Number(r.ratePerBag) || 0)
          : totalWeightOrPcs * (Number(r.ratePerKg) || 0);
      }

      return {
        productName: r.productName.trim() || 'Item',
        urduName: r.urduName,
        bags: qty,
        weightPerBag: wt,
        totalKg: r.unit === 'dozen' ? 0 : totalWeightOrPcs,
        ratePerBag: r.ratePerBag,
        ratePerKg: r.ratePerKg,
        subtotal: Math.round(subtotal),
        unit: r.unit
      };
    });

    const description = `آمد مال: ${items.map((i) => {
      let unitLabel = '';
      if (i.unit === 'dozen') {
        unitLabel = `${i.bags} درجن`;
      } else if (i.unit === 'pack') {
        unitLabel = `${i.bags} پیکٹ (${i.weightPerBag}kg)`;
      } else if (i.unit === 'pcs') {
        unitLabel = `${i.bags} عدد`;
      } else {
        unitLabel = `${i.bags} بوریاں (${i.weightPerBag}kg)`;
      }
      return `${unitLabel} ${i.productName}`;
    }).join(' + ')}`;

    addSupplierPurchase(selectedSuppId, {
      billAmount: Math.round(totalAmount),
      description,
      items,
      vehicleNo: vehicleNo.trim() || undefined,
      biltyNo: biltyNo.trim() || undefined,
      notes: notes.trim() || undefined,
      updateInventoryStock: updateStock
    });

    notifySuccess(
      isUr
        ? `آمد مال کھاتے میں درج ہو گیا! کل بل: PKR ${Math.round(totalAmount).toLocaleString()}`
        : `Mal Inward recorded! Total Bill: PKR ${Math.round(totalAmount).toLocaleString()}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 border border-emerald-900/20">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{isUr ? 'آمد مال و خریداری اندراج (نئی بلٹی / چٹ)' : 'Record Stock Inward / Supply Bill'}</h2>
              <p className="text-xs text-emerald-200">
                {currentSupp?.name} • {currentSupp?.city}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-800 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Supplier Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'سپلائر / مل منتخب کریں *' : 'Select Mill / Supplier *'}
              </label>
              <select
                value={selectedSuppId}
                onChange={(e) => setSelectedSuppId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-bold text-slate-800"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'گاڑی نمبر (ٹرک / شاہین وغیرہ)' : 'Truck / Vehicle No.'}
              </label>
              <div className="relative">
                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. LES-9214"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isUr ? 'بلٹی / گیٹ پاس نمبر' : 'Bilty / Gate Pass No.'}
              </label>
              <input
                type="text"
                value={biltyNo}
                onChange={(e) => setBiltyNo(e.target.value)}
                placeholder="e.g. BL-4410"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700 font-semibold"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-800" />
                {isUr ? 'لایا گیا مال و جنس کی تفصیل:' : 'Items & Varieties Received:'}
              </span>
              <button
                type="button"
                onClick={addRow}
                className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-3 py-1 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {isUr ? 'مزید جنس شامل کریں' : 'Add Item'}
              </button>
            </div>

            <div className="space-y-2.5">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  {/* Variety / Product (3 cols) */}
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      {isUr ? 'چاول کی جنس / آئٹم' : 'Variety / Grain'}
                    </label>
                    <input
                      type="text"
                      list={`var-list-${idx}`}
                      value={row.productName}
                      onChange={(e) => handleRowChange(idx, 'productName', e.target.value)}
                      placeholder="e.g. Super Kainat Steam"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-semibold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                    />
                    <datalist id={`var-list-${idx}`}>
                      {inventory.map((inv) => (
                        <option key={inv.id} value={inv.varietyName}>
                          {inv.urduName || inv.varietyName}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* Bags / Quantity (2 cols) */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      {row.unit === 'dozen'
                        ? (isUr ? 'تعداد درجن' : 'Qty (Dozens)')
                        : row.unit === 'pack'
                        ? (isUr ? 'تعداد پیکٹ' : 'Qty (Packs)')
                        : row.unit === 'pcs'
                        ? (isUr ? 'تعداد عدد' : 'Qty (Pcs)')
                        : (isUr ? 'تعداد بوریاں' : 'Qty (Bags)')}
                    </label>
                    <NumberInput
                      value={row.bags}
                      onChange={(val) => handleRowChange(idx, 'bags', val)}
                      placeholder="1"
                      allowDecimals={true}
                      step="any"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold text-center text-xs"
                    />
                  </div>

                  {/* Custom Packing / Size / Unit (3 cols) */}
                  <div className="sm:col-span-3">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="block text-[10px] text-slate-500 font-bold">
                        {isUr ? 'پیکنگ وزن / سائز' : 'Pack Size / Wt'}
                      </label>
                      <span className="text-[9px] text-emerald-800 font-bold">
                        {row.unit === 'dozen' ? '12 pcs' : (row.weightPerBag ? `${parseFloat(row.weightPerBag.toFixed(3))} ${row.unit}` : '')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="any"
                        min="0.001"
                        value={row.weightPerBag === 0 ? '' : row.weightPerBag}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleRowChange(idx, 'weightPerBag', val);
                        }}
                        placeholder="e.g. 25, 1.4, 3.8"
                        className="w-full min-w-0 px-2 py-1.5 border border-slate-300 rounded font-bold text-center text-slate-800 text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                      />

                      <select
                        value={row.unit}
                        onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                        className="px-1.5 py-1.5 border border-slate-300 rounded font-bold text-[11px] bg-slate-50 text-slate-700 cursor-pointer shrink-0"
                      >
                        <option value="kg">KG</option>
                        <option value="dozen">{isUr ? 'درجن' : 'Dozen'}</option>
                        <option value="pack">{isUr ? 'پیکٹ' : 'Pack'}</option>
                        <option value="pcs">{isUr ? 'عدد' : 'Pcs'}</option>
                      </select>
                    </div>
                  </div>

                  {/* Rate (3 cols) */}
                  <div className="sm:col-span-3">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="block text-[10px] text-slate-500 font-bold">
                        {row.unit === 'dozen'
                          ? row.rateMode === 'bag'
                            ? (isUr ? 'ریٹ فی درجن' : 'Rate / Dozen')
                            : (isUr ? 'ریٹ فی دانہ' : 'Rate / Piece')
                          : row.unit === 'pack'
                          ? row.rateMode === 'bag'
                            ? (isUr ? 'ریٹ فی پیکٹ' : 'Rate / Pack')
                            : (isUr ? 'ریٹ فی کلو' : 'Rate / Unit')
                          : row.rateMode === 'bag'
                          ? row.weightPerBag < 1
                            ? (isUr ? 'ریٹ فی پیکٹ' : 'Rate / Pack')
                            : (isUr ? 'ریٹ فی بوری' : 'Rate / Bag')
                          : (isUr ? 'ریٹ فی کلو' : 'Rate / KG')}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRowChange(idx, 'rateMode', row.rateMode === 'bag' ? 'kg' : 'bag')}
                        className="text-[9px] text-emerald-700 underline font-semibold cursor-pointer"
                      >
                        {row.unit === 'dozen'
                          ? row.rateMode === 'bag'
                            ? 'Switch /Piece'
                            : 'Switch /Dozen'
                          : row.rateMode === 'bag'
                          ? 'Switch to /KG'
                          : 'Switch to /Bag'}
                      </button>
                    </div>
                    {row.rateMode === 'bag' ? (
                      <NumberInput
                        value={row.ratePerBag}
                        onChange={(val) => handleRowChange(idx, 'ratePerBag', val)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold text-right text-emerald-900 text-xs"
                      />
                    ) : (
                      <NumberInput
                        value={row.ratePerKg}
                        onChange={(val) => handleRowChange(idx, 'ratePerKg', val)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded font-bold text-right text-emerald-900 text-xs"
                      />
                    )}
                  </div>

                  {/* Remove Button (1 col) */}
                  <div className="sm:col-span-1 flex justify-center pt-2">
                    <button
                      type="button"
                      disabled={rows.length === 1}
                      onClick={() => removeRow(idx)}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap gap-4">
                <span>
                  {isUr ? 'کل تعداد:' : 'Total Qty:'} <strong className="text-emerald-900">{totalBags}</strong>
                </span>
                {totalKg > 0 && (
                  <span>
                    {isUr ? 'کل وزن:' : 'Total Net Wt:'} <strong className="text-emerald-900">{totalKg.toLocaleString()} KG</strong>
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="text-slate-600 font-medium mr-2">{isUr ? 'کل رقم (بل):' : 'Total Bill Amount:'}</span>
                <span className="text-base font-black text-emerald-950">PKR {Math.round(totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Option: Auto Update Godown Stock */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={updateStock}
                onChange={(e) => setUpdateStock(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700"
              />
              <div>
                <p className="font-bold text-slate-800">
                  {isUr ? 'یہ مال گودام سٹاک (Inventory) میں بھی خودکار شامل کریں' : 'Automatically add this stock to Godown Inventory'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {isUr ? 'اگر پہلے ہی الگ سے سٹاک انورڈ درج کر چکے ہیں تو اسے ان چیک کر دیں' : 'Uncheck if inward stock was already added separately'}
                </p>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {isUr ? 'آمد مال نوٹس یا شرائط' : 'Inward Notes / Trade Conditions'}
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={isUr ? 'مثلاً کرایہ ڈرائیور کو نقد ادا کیا، وزن کانٹے کی پرچی منسلک ہے۔' : 'e.g. Freight paid to driver, weight chit verified'}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
            >
              {isUr ? 'منسوخ کریں' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUr ? 'آمد مال کھاتے میں درج کریں' : 'Confirm & Save to Khata'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
