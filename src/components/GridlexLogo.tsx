"use client";

import React from 'react';

interface GridlexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const sizes = {
  sm: { icon: 'w-6 h-6', text: 'text-base' },
  md: { icon: 'w-8 h-8', text: 'text-lg' },
  lg: { icon: 'w-10 h-10', text: 'text-xl' },
};

export function GridlexLogo({ size = 'md', showText = true }: GridlexLogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={sizes[size].icon}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="gn" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#003B5C" /><stop offset="100%" stopColor="#0A3E6B" /></linearGradient>
            <linearGradient id="gc" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#1BA9C4" /><stop offset="100%" stopColor="#00ACC1" /></linearGradient>
          </defs>
          <rect x="2" y="2" width="12" height="12" rx="2" fill="url(#gn)" />
          <rect x="18" y="2" width="12" height="12" rx="2" fill="url(#gc)" />
          <rect x="2" y="18" width="12" height="12" rx="2" fill="url(#gc)" opacity="0.7" />
          <rect x="18" y="18" width="12" height="12" rx="2" fill="url(#gn)" opacity="0.7" />
        </svg>
      </div>
      {showText && <span className={`font-bold ${sizes[size].text}`}><span className="text-[#003B5C]">Grid</span><span className="text-[#1BA9C4]">lex</span></span>}
    </div>
  );
}