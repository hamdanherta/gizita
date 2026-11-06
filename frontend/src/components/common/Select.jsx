import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  options = [], // [{ value, label }]
  error,
  helperText,
  className = '',
  id,
  required,
  placeholder,
  children,
  ...props
}, ref) => {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-xl">
        <select
          ref={ref}
          id={selectId}
          className={`w-full bg-white border text-sm rounded-xl transition-colors duration-150 py-2.5 px-3.5 appearance-none ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-slate-300 text-slate-900 hover:border-slate-400 focus:border-brand-600 focus:ring-1 focus:ring-brand-600'
          } focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

