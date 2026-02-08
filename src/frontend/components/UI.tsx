
import React from 'react';

export const Card: React.FC<{ children?: React.ReactNode, className?: string, onClick?: React.MouseEventHandler<HTMLDivElement> }> = ({ children, className = '', onClick }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`} onClick={onClick}>
    {children}
  </div>
);

import { Loader2 } from 'lucide-react';

export const Button = ({
  children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, isLoading = false, ...props
}: {
  children?: React.ReactNode, onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void, variant?: 'primary' | 'secondary' | 'danger' | 'outline', size?: 'sm' | 'md' | 'lg', className?: string, type?: 'button' | 'submit', disabled?: boolean, isLoading?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const baseStyle = "rounded-lg font-medium transition-colors flex items-center justify-center gap-2";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="animate-spin" size={16} />}
      {children}
    </button>
  );
};

export const Badge = ({ status, label, className = '' }: { status: string, label?: string, className?: string }) => {
  const styles: Record<string, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    NEW: 'bg-blue-100 text-blue-800',
    MATCHED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    REVIEW_CLIENT: 'bg-purple-100 text-purple-800',
    REVIEW_ADMIN: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    GREEN: 'bg-green-100 text-green-800',
    YELLOW: 'bg-yellow-100 text-yellow-800',
    RED: 'bg-red-100 text-red-800',
    ACTIVE: 'bg-green-100 text-green-800',
    VETTING: 'bg-orange-100 text-orange-800',
    SUSPENDED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles['NEW']} ${className}`}>
      {label || status.replace('_', ' ')}
    </span>
  );
};
