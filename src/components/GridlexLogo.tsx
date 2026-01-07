"use client";

import React from 'react';

interface GridlexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function GridlexLogo({ size = 'md', showText = true }: GridlexLogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-base' },
    md: { icon: 'w-8 h-8', text: 'text-lg' },
    lg: { icon: 'w-10 h-10', text: 'text-xl' },
  };

  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon - Grid pattern inspired by Gridlex */}
      <div className={`${sizeClasses[size].icon} relative`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="gridlex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          {/* Main grid squares */}
          <rect x="2" y="2" width="12" height="12" rx="2" fill="url(#gridlex-gradient)" />
          <rect x="18" y="2" width="12" height="12" rx="2" fill="url(#gridlex-gradient)" opacity="0.7" />
          <rect x="2" y="18" width="12" height="12" rx="2" fill="url(#gridlex-gradient)" opacity="0.7" />
          <rect x="18" y="18" width="12" height="12" rx="2" fill="url(#gridlex-gradient)" opacity="0.4" />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold ${sizeClasses[size].text} text-gradient-primary`}>
          Gridlex
        </span>
      )}
    </div>
  );
}