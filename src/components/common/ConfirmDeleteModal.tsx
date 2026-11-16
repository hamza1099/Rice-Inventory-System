import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { usePos } from '../../context/PosContext';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  confirmText,
  cancelText,
  isDeleting = false
}) => {
  const { language } = usePos();
  const isUr = language === 'ur';

  // Handle ESC and Enter keys
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !isDeleting) {
        e.preventDefault();
        onConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm, isDeleting]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden text-xs animate-in zoom-in-95 duration-150">
        {/* Header with Danger Accent */}
        <div className="bg-rose-50/80 border-b border-rose-100 px-5 py-4 flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-rose-950">
              {title || (isUr ? 'حذف کرنے کی تصدیق' : 'Confirm Deletion')}
            </h3>
            <p className="text-[11px] text-rose-700/90 mt-0.5 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
              <span>{isUr ? 'یہ عمل واپس نہیں لایا جا سکتا' : 'This action cannot be undone'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 -mt-1 cursor-pointer"
            title={isUr ? 'بند کریں' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          {itemName && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                {itemType || (isUr ? 'ریکارڈ / جنس کا نام:' : 'Record / Item Name:')}
              </span>
              <p className="text-xs font-black text-slate-900 break-words font-mono-num">
                {itemName}
              </p>
            </div>
          )}

          <p className="text-slate-600 text-xs leading-relaxed">
            {description ||
              (isUr
                ? 'کیا آپ واقعی اس ریکارڈ کو مستقل طور پر حذف کرنا چاہتے ہیں؟ یہ ڈیٹا بیس اور تمام کاؤنٹرز سے خارج ہو جائے گا۔'
                : 'Are you sure you want to permanently delete this record? It will be removed from the database and active counters.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText || (isUr ? 'منسوخ' : 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:bg-rose-400"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isUr ? 'حذف ہو رہا ہے...' : 'Deleting...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText || (isUr ? 'ہاں، حذف کریں' : 'Yes, Delete')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
