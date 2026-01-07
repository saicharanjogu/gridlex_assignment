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
      {/* Logo Icon - Grid pattern with Gridlex brand colors */}
      <div className={`${sizeClasses[size].icon} relative`}>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <linearGradient id="gridlex-gradient-navy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#003B5C" />
              <stop offset="100%" stopColor="#0A3E6B" />
            </linearGradient>
            <linearGradient id="gridlex-gradient-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1BA9C4" />
              <stop offset="100%" stopColor="#00ACC1" />
            </linearGradient>
          </defs>
          {/* Main grid squares - Navy and Cyan brand colors */}
          <rect x="2" y="2" width="12" height="12" rx="2" fill="url(#gridlex-gradient-navy)" />
          <rect x="18" y="2" width="12" height="12" rx="2" fill="url(#gridlex-gradient-cyan)" />
          <rect x="2" y="18" width="12" height="12" rx="2" fill="url(#gridlex-gradient-cyan)" opacity="0.7" />
          <rect x="18" y="18" width="12" height="12" rx="2" fill="url(#gridlex-gradient-navy)" opacity="0.7" />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-bold ${sizeClasses[size].text}`}>
          <span className="text-[#003B5C]">Grid</span>
          <span className="text-[#1BA9C4]">lex</span>
        </span>
      )}
    </div>
  );
}