import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Button = ({ className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20',
    secondary: 'bg-white text-primary border border-gray-200 hover:border-accent hover:text-accent',
    outline: 'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white',
    danger: 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white',
    ghost: 'hover:bg-gray-100 text-gray-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-8 py-3.5 text-lg font-bold',
  };

  return (
    <button 
      className={cn(
        'rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )} 
      {...props} 
    />
  );
};

export const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>}
      <input 
        className={cn(
          "w-full px-4 py-3 rounded-xl border border-gray-200 outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/5 bg-gray-50/50",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/5",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500 ml-1">{error}</p>}
    </div>
  );
};

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    accent: 'bg-accent-light text-accent',
  };
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider', variants[variant])}>
      {children}
    </span>
  );
};

export const SectionHeader = ({ title, subtitle, children }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {children}
  </div>
);