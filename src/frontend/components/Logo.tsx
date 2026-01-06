
import React from 'react';

export const Logo = ({ className = "", size = 32 }: { className?: string, size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="4" y="4" width="8" height="24" rx="2" fill="currentColor" />
    <rect x="14" y="4" width="14" height="8" rx="2" fill="currentColor" fillOpacity="0.8" />
    <rect x="14" y="14" width="10" height="8" rx="2" fill="currentColor" fillOpacity="0.6" />
  </svg>
);
