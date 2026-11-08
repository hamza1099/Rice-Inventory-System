import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Shield, CalendarCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RouteName } from '../../routes/RouteName';
import { usePos } from '../../context/PosContext';

interface DrawerAuditCardProps {
  activePeriod?: string;
}

export const DrawerAuditCard: React.FC<DrawerAuditCardProps> = ({ activePeriod = 'today' }) => {
  const navigate = useNavigate();
  const { isDayClosed } = usePos();

  // Show active handover ONLY for today's unclosed shift
  const isCurrentUnclosedDay = activePeriod === 'today' && !isDayClosed;

  return (
    <div className="grid grid-cols-12 gap-3 text-xs">
      {/* Shift Reconciliation & Drawer Audit Card */}
      <div className={`${isCurrentUnclosedDay ? 'col-span-8' : 'col-span-8'} bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Shift Reconciliation & Drawer Audit
            </h3>
          </div>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>ALL SPOT INVOICES MATCHED • ZERO DISCREPANCY</span>
          </span>
        </div>

        {/* 3 Metrics */}
        <div className="grid grid-cols-3 gap-3 font-mono-num bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-500 font-sans block">
              OPENING FLOAT (صبح کا کیش):
            </span>
            <span className="text-base font-black text-slate-900">PKR 15,000</span>
            <span className="text-[10px] text-slate-400 block font-sans">Base Change Float</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-sans block">
              DAY SPOT CASH (کاؤنٹر کیش):
            </span>
            <span className="text-base font-black text-emerald-800">PKR 112,000</span>
            <span className="text-[10px] text-slate-400 block font-sans">68 Cash Vouchers</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 font-sans block">
              ONLINE RAAST SETTLEMENT:
            </span>
            <span className="text-base font-black text-blue-800">PKR 36,250</span>
            <span className="text-[10px] text-slate-400 block font-sans">16 Verified IBFT</span>
          </div>
        </div>

        {/* Total Physical Cash for Handover */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-mono-num">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 font-sans block">
              TOTAL PHYSICAL CASH FOR HANDOVER:
            </span>
            <div className="text-xl font-black text-slate-900">
              PKR 127,000{' '}
              <span className="text-[11px] font-medium text-slate-500">
                (Float 15,000 + Drawer 112,000)
              </span>
            </div>
          </div>

          {/* Settlement ratio progress bar */}
          <div className="w-56 text-right">
            <div className="flex justify-between text-[10px] text-slate-500 font-sans mb-1">
              <span>Settlement Ratio:</span>
              <span className="font-bold text-slate-700">75.5% Cash / 24.5% Raast</span>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-600 h-full w-[75.5%]"></div>
              <div className="bg-blue-600 h-full w-[24.5%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Handover Box (Only Active for Unclosed Day) */}
      <div className="col-span-4 bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs flex flex-col justify-between">
        {isCurrentUnclosedDay ? (
          <>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                  TERMINAL HANDOVER
                </span>
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
              </div>

              <p className="text-[11px] text-slate-600 leading-tight mb-2 font-sans">
                Cashier <strong>S. Bukhari</strong> certifies that physical till contents have been verified. Memos are strictly spot settled.
              </p>

              <div className="space-y-0.5 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 font-mono-num mb-2">
                <div className="flex justify-between">
                  <span>Session Ledger ID:</span>
                  <strong className="text-slate-800">BRT-01-241024</strong>
                </div>
                <div className="flex justify-between">
                  <span>Verified Receiving Vault:</span>
                  <strong className="text-emerald-800">Main Cash Safe A</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(RouteName.DAY_END)}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Close Shift & Handover</span>
            </button>
          </>
        ) : isDayClosed ? (
          /* When Day is Already Closed */
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  DAY-END CLOSED
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                  Z-REPORT SEALED
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-tight mb-2 font-sans">
                Today's counter session has been <strong>finalized and permanently sealed</strong>. Physical cash has been handed over to the godown safe.
              </p>

              <div className="space-y-0.5 text-[10px] text-slate-500 bg-emerald-50/60 p-2 rounded border border-emerald-200 font-mono-num mb-2">
                <div className="flex justify-between">
                  <span>Z-Report Token:</span>
                  <strong className="text-slate-800">#Z-LHR-241024-01</strong>
                </div>
                <div className="flex justify-between">
                  <span>Audit Variance:</span>
                  <strong className="text-emerald-800">PKR 0.00 (Balanced)</strong>
                </div>
              </div>
            </div>

            <div className="w-full py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Shift Closed & Handed Over (شفت کلوز ہو چکی ہے)</span>
            </div>
          </div>
        ) : (
          /* When Viewing Past Archive Dates (Yesterday, Last 7 Days, Month, etc.) */
          <div className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-600" />
                  ARCHIVED RECORD
                </span>
                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                  CLOSED
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-tight mb-2 font-sans">
                Yeh pichli tareekh ka record hai. Is din ka day-end closing aur cash audit pehle se mukammal ho chuka hai.
              </p>

              <div className="space-y-0.5 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 font-mono-num mb-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className="text-slate-800">Audited & Reconciled</strong>
                </div>
                <div className="flex justify-between">
                  <span>Register:</span>
                  <strong className="text-slate-700">Sealed Past Ledger</strong>
                </div>
              </div>
            </div>

            <div className="w-full py-2 px-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs flex items-center justify-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Past Day Closed (ماضی کا روزنامچہ کلوز ہے)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
