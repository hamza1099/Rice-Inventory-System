import React, { useState } from 'react';
import { Phone, Check, AlertCircle } from 'lucide-react';
import { formatPakistaniPhone, isValidPakistaniPhone, getCleanPhoneDigits } from '../../utils/phone';

interface PakistaniPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  autoFocus?: boolean;
  onBlur?: () => void;
  showHelperBadge?: boolean;
}

export const PakistaniPhoneInput: React.FC<PakistaniPhoneInputProps> = ({
  value,
  onChange,
  placeholder = '0300-1234567',
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  autoFocus = false,
  onBlur,
  showHelperBadge = true,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const digits = getCleanPhoneDigits(value);
  const isValid = isValidPakistaniPhone(value, false);
  const isComplete = digits.length === 11;
  const isInvalidPrefix = digits.length >= 2 && !digits.startsWith('03');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation, deletion, clipboard shortcuts
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === 'Enter' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // Strictly block non-numeric keystrokes (alphabets, symbols)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPakistaniPhone(e.target.value);
    onChange(formatted);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const formatted = formatPakistaniPhone(pastedText);
    onChange(formatted);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  return (
    <div className="relative flex items-center">
      {/* Left Phone Icon */}
      <Phone
        className={`w-3.5 h-3.5 absolute left-2.5 transition-colors pointer-events-none ${
          isValid && isComplete
            ? 'text-emerald-600'
            : isInvalidPrefix
            ? 'text-rose-500'
            : isFocused
            ? 'text-emerald-700'
            : 'text-slate-400'
        }`}
      />

      <input
        type="text"
        inputMode="numeric"
        id={id}
        name={name}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={handleInputBlur}
        maxLength={12}
        className={`w-full pl-8 pr-14 py-1.5 border rounded font-mono font-bold tracking-wider placeholder:tracking-normal placeholder:font-normal text-xs text-slate-800 transition-all focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed ${
          isValid && isComplete
            ? 'border-emerald-500 bg-emerald-50/20 focus:border-emerald-600'
            : isInvalidPrefix
            ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 text-rose-900'
            : 'border-slate-300 bg-white focus:border-emerald-600 focus:bg-white'
        } ${className}`}
      />

      {/* Right-side Indicator Badge */}
      {showHelperBadge && (
        <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
          {isValid && isComplete ? (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-100/80 text-emerald-700 text-[10px] font-bold">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>OK</span>
            </span>
          ) : isInvalidPrefix ? (
            <span
              className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold"
              title="Must start with 03"
            >
              <AlertCircle className="w-2.5 h-2.5" />
              <span>03XX</span>
            </span>
          ) : digits.length > 0 ? (
            <span className="text-[10px] font-mono font-medium text-slate-400 px-1">
              {digits.length}/11
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};
