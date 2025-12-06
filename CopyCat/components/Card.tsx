import React, { ReactNode } from 'react';

export const Card: React.FC<{ title?: string; children: ReactNode; className?: string; actions?: ReactNode }> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl p-6 ${className || ''}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          {title && <h2 className="text-lg font-semibold text-gray-700">{title}</h2>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};