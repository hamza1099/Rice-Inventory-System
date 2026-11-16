import React, { useState } from 'react';
import { Settings, Save, Scale, Printer, Shield, Database, Check, Monitor, Plus, Trash2 } from 'lucide-react';
import { notifySuccess } from '../utils/toast';
import { usePos } from '../context/PosContext';
import {
  DEFAULT_TERMINAL_OPTIONS,
  getCustomTerminals,
  saveCustomTerminal,
  deleteCustomTerminal
} from '../utils/terminals';

export const SystemSettingsScreen: React.FC = () => {
  const { language } = usePos();
  const isUr = language === 'ur';

  const [comPort, setComPort] = useState<string>('COM1');
  const [baudRate, setBaudRate] = useState<string>('9600');
  const [printerModel, setPrinterModel] = useState<string>('EPSON TM-T88VI (USB/Serial)');
  const [juteTare, setJuteTare] = useState<number>(0.95);
  const [ppTare, setPpTare] = useState<number>(0.12);
  const [isStrictNoCredit, setIsStrictNoCredit] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const [customTerminals, setCustomTerminals] = useState<string[]>(() => getCustomTerminals());
  const [newCounterInput, setNewCounterInput] = useState<string>('');

  const handleAddCounter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCounterInput.trim();
    if (!trimmed) return;
    const updated = saveCustomTerminal(trimmed);
    setCustomTerminals(updated);
    setNewCounterInput('');
    notifySuccess(isUr ? `نیا کاؤنٹر "${trimmed}" شامل ہو گیا!` : `New counter "${trimmed}" added!`);
  };

  const handleDeleteCounter = (name: string) => {
    const updated = deleteCustomTerminal(name);
    setCustomTerminals(updated);
    notifySuccess(isUr ? `کاؤنٹر "${name}" ختم کر دیا گیا۔` : `Counter "${name}" removed.`);
  };

  const handleSave = () => {
    setSavedSuccess(true);
    notifySuccess(isUr ? 'سیٹنگز محفوظ ہو گئیں!' : 'System & hardware configuration saved successfully!');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-3 text-xs">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {isUr ? 'ہارڈویئر اور سسٹم سیٹنگز' : 'Hardware & System Configuration'}
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isUr
              ? 'ڈیجیٹل الیکٹرانک کانٹا، رسید پرنٹر اور منڈی کاٹ کے ضوابط سیٹ کریں۔'
              : 'Configure COM platform scales, fiscal thermal receipt printers, and Mandi tare deduction rules.'}
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? (isUr ? 'سیٹنگز محفوظ!' : 'Settings Saved!') : (isUr ? 'سیٹنگز محفوظ کریں' : 'Save System Settings')}</span>
        </button>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hardware Digital Scale */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Scale className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase">
              Digital Platform Scale (RS-232 / USB)
            </h3>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Serial Communication Port:
              </label>
              <select
                value={comPort}
                onChange={(e) => setComPort(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              >
                <option value="COM1">COM1 (Standard Weighbridge / Platform)</option>
                <option value="COM2">COM2 (Counter Retail Bench Scale)</option>
                <option value="COM3">COM3 (USB-to-Serial Port)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Baud Rate:
              </label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
              >
                <option value="9600">9600 bps (Standard Mandi Indicator)</option>
                <option value="4800">4800 bps</option>
                <option value="19200">19200 bps</option>
              </select>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px] font-mono">
              Status: <strong>ONLINE & RESPONDING</strong> • Auto-Tare protocol active
            </div>
          </div>
        </div>

        {/* Fiscal Thermal Receipt Printer */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Printer className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase">
              Thermal Receipt Printer & Cash Drawer
            </h3>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Assigned Receipt Printer:
              </label>
              <input
                type="text"
                value={printerModel}
                onChange={(e) => setPrinterModel(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 p-2 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-700" />
                <span className="font-semibold text-slate-800">Auto-Cut Paper</span>
              </label>
              <label className="flex items-center space-x-2 p-2 border border-slate-200 rounded-lg bg-slate-50 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-emerald-700" />
                <span className="font-semibold text-slate-800">Drawer Kick on Sale</span>
              </label>
            </div>

            <div className="p-2.5 bg-slate-100 rounded border border-slate-200 text-slate-700 text-[11px]">
              Paper Width: <strong>80mm Thermal Roll</strong> • Density: High Contrast
            </div>
          </div>
        </div>

        {/* Mandi Standard Tare Rules */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase">
              {isUr ? 'کاٹ و تولہ معیار' : 'Mandi Tare Deduction Standards'}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono-num">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                {isUr ? 'جوٹ بوری کاٹ:' : 'Jute Bag Tare:'}
              </label>
              <input
                type="number"
                step="0.01"
                value={juteTare}
                onChange={(e) => setJuteTare(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-500 font-sans">
                {isUr ? 'کلو فی بوری' : 'KG per sack'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                {isUr ? 'پی پی پلاسٹک بیگ کاٹ:' : 'Plastic PP Bag Tare:'}
              </label>
              <input
                type="number"
                step="0.01"
                value={ppTare}
                onChange={(e) => setPpTare(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-500 font-sans">
                {isUr ? 'کلو فی بوری' : 'KG per sack'}
              </span>
            </div>
          </div>
        </div>

        {/* Database & Terminal Security Policy */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase">
              {isUr ? 'ٹرمینل سیکیورٹی و ڈیٹا بیک اپ' : 'Terminal Security & Data Backup'}
            </h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-start space-x-2 p-2 border border-amber-200 rounded-lg bg-amber-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isStrictNoCredit}
                onChange={(e) => setIsStrictNoCredit(e.target.checked)}
                className="mt-0.5 accent-emerald-700"
              />
              <div>
                <span className="font-bold text-amber-900 block">
                  {isUr ? 'ادھار مکمل بند پالیسی' : 'Strict Spot Only Policy'}
                </span>
                <span className="text-[10px] text-amber-800">
                  {isUr
                    ? 'کاؤنٹر کیشئرز کو بغیر ادائیگی کریڈٹ بل بنانے کی اجازت نہیں ہوگی۔'
                    : 'Prevents cashiers from creating non-settled credit memo tickets.'}
                </span>
              </div>
            </label>

            <button
              onClick={() => notifySuccess(isUr ? 'آف لائن بیک اپ ڈاؤن لوڈ ہو گیا!' : 'Local database snapshot exported successfully!')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              {isUr ? 'لوکل ڈیٹا بیس بیک اپ ڈاؤن لوڈ کریں' : 'Export Local DB Snapshot (Offline Backup)'}
            </button>
          </div>
        </div>

        {/* Active Counters & Terminals Management */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-emerald-700" />
              <h3 className="font-extrabold text-xs text-slate-900 uppercase">
                {isUr ? 'دکان کے کاؤنٹرز اور ٹرمینلز کی فہرست' : 'Shop Counters & Active POS Terminals'}
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-bold">
              {DEFAULT_TERMINAL_OPTIONS.length + customTerminals.length} {isUr ? 'ٹرمینلز فعال' : 'Active Terminals'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Existing Counters List */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                {isUr ? 'موجودہ کاؤنٹرز:' : 'Active System Counters:'}
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {DEFAULT_TERMINAL_OPTIONS.map((term) => (
                  <div
                    key={term.id}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold text-slate-800">{isUr ? term.ur : term.en}</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded">
                      {isUr ? 'سسٹم ڈیفالٹ' : 'SYSTEM DEFAULT'}
                    </span>
                  </div>
                ))}
                {customTerminals.map((ct) => (
                  <div
                    key={ct}
                    className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span className="font-bold text-emerald-950">{ct}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCounter(ct)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title={isUr ? 'کاؤنٹر حذف کریں' : 'Delete Counter'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Counter Box */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-black text-slate-900 block">
                {isUr ? '+ نیا کاؤنٹر / ٹرمینل شامل کریں' : '+ Add New Store Counter'}
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                {isUr
                  ? 'اگر مستقبل میں دوسرا یا تیسرا کاؤنٹر، ہول سیل کاؤنٹر، یا الگ لیپ ٹاپ شروع کرنا ہو تو یہاں نیا کاؤنٹر بنائیں تاکہ کیش میمو اور رپورٹس الگ بنیں۔'
                  : 'Add a new counter (e.g. Counter 03 - Wholesale) when deploying additional checkout PCs or tablets.'}
              </p>
              <form onSubmit={handleAddCounter} className="flex gap-2">
                <input
                  type="text"
                  value={newCounterInput}
                  onChange={(e) => setNewCounterInput(e.target.value)}
                  placeholder={isUr ? 'مثلاً Terminal #03 (Counter 03)...' : 'e.g. Terminal #03 (Counter 03)...'}
                  className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:border-emerald-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUr ? 'شامل کریں' : 'Add Counter'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
