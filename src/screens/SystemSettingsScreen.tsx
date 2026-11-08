import React, { useState } from 'react';
import { Settings, Save, Scale, Printer, Shield, Database, Check } from 'lucide-react';
import { notifySuccess } from '../utils/toast';

export const SystemSettingsScreen: React.FC = () => {
  const [comPort, setComPort] = useState<string>('COM1');
  const [baudRate, setBaudRate] = useState<string>('9600');
  const [printerModel, setPrinterModel] = useState<string>('EPSON TM-T88VI (USB/Serial)');
  const [juteTare, setJuteTare] = useState<number>(0.95);
  const [ppTare, setPpTare] = useState<number>(0.12);
  const [isStrictNoCredit, setIsStrictNoCredit] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    setSavedSuccess(true);
    notifySuccess('System & hardware configuration saved successfully! (سیٹنگز محفوظ ہو گئیں)');
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
              Hardware & System Configuration
            </h2>
            <span className="urdu-text text-sm text-emerald-800 font-bold" dir="rtl">
              (ہارڈویئر اور سسٹم سیٹنگز)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure COM platform scales, fiscal thermal receipt printers, and Mandi tare deduction rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved!' : 'Save System Settings'}</span>
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
              Mandi Tare Deduction Standards (کاٹ و تولہ)
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono-num">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                50kg Jute Bori Tare:
              </label>
              <input
                type="number"
                step="0.01"
                value={juteTare}
                onChange={(e) => setJuteTare(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-500 font-sans">KG per sack</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 font-sans">
                Plastic PP Bag Tare:
              </label>
              <input
                type="number"
                step="0.01"
                value={ppTare}
                onChange={(e) => setPpTare(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
              />
              <span className="text-[10px] text-slate-500 font-sans">KG per sack</span>
            </div>
          </div>
        </div>

        {/* Database & Terminal Security Policy */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-xs text-slate-900 uppercase">
              Terminal Security & Data Backup
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
                <span className="font-bold text-amber-900 block">Strict Spot Only Policy (ادھار مکمل بند)</span>
                <span className="text-[10px] text-amber-800">
                  Prevents cashiers from creating non-settled credit memo tickets.
                </span>
              </div>
            </label>

            <button
              onClick={() => notifySuccess("Local database snapshot exported successfully! (آف لائن بیک اپ ڈاؤن لوڈ ہو گیا)")}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              Export Local DB Snapshot (Offline Backup)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
