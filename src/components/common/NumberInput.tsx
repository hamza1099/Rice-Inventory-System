import React, { useState, useEffect } from 'react';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string;
  onChange: (val: number) => void;
  allowNegative?: boolean;
  allowDecimals?: boolean;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = '0',
  className = '',
  allowNegative = false,
  allowDecimals = true,
  step = 'any',
  ...props
}) => {
  // Convert 0 or '' to string representation
  const formatInitial = (v: number | string): string => {
    if (v === '' || v === null || v === undefined) return '';
    const num = typeof v === 'number' ? v : parseFloat(v);
    if (isNaN(num) || num === 0) return '';
    return String(v);
  };

  const [localStr, setLocalStr] = useState<string>(() => formatInitial(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Sync when external value changes while NOT focused
  useEffect(() => {
    if (!isFocused) {
      setLocalStr(formatInitial(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalStr(raw);

    if (raw === '' || raw === '-') {
      onChange(0);
      return;
    }

    const num = allowDecimals ? parseFloat(raw) : parseInt(raw, 10);
    if (isNaN(num)) {
      onChange(0);
    } else {
      onChange(!allowNegative && num < 0 ? 0 : num);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (localStr === '' || localStr === '-') {
      setLocalStr('');
      onChange(0);
    } else {
      const num = allowDecimals ? parseFloat(localStr) : parseInt(localStr, 10);
      const cleanNum = isNaN(num) ? 0 : !allowNegative && num < 0 ? 0 : num;
      setLocalStr(cleanNum === 0 ? '' : String(cleanNum));
      onChange(cleanNum);
    }
    if (onBlur) onBlur(e);
  };

  return (
    <input
      type="number"
      value={localStr}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      step={step}
      {...props}
    />
  );
};
