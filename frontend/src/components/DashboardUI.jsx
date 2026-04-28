import React from 'react';
import { Badge, cn } from '../components/UI';

export const StatCard = ({ icon: Icon, label, value, color = 'accent' }) => {
  const colors = {
    accent: 'bg-accent-light text-accent',
    orange: 'bg-orange-50 text-orange-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    green: 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-card transition-all">
      <div className={cn("size-14 rounded-xl flex items-center justify-center", colors[color])}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
};

export const DashboardWidget = ({ title, children, className }) => (
  <div className={cn("bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden", className)}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);