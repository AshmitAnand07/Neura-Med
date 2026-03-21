import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2 bg-white border rounded-lg transition-all duration-200 outline-none focus:ring-2 
            ${error 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'} 
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
