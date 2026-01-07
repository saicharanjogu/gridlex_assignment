"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface GridlexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animate?: boolean;
}

const sizes = {
  sm: { icon: 'w-6 h-6', text: 'text-base' },
  md: { icon: 'w-8 h-8', text: 'text-lg' },
  lg: { icon: 'w-10 h-10', text: 'text-xl' },
};

const squareVariants: Variants = {
  initial: { scale: 0, rotate: -45, opacity: 0 },
  animate: (i: number) => ({
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 25,
      delay: i * 0.1,
    },
  }),
  hover: {
    scale: 1.1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 10,
    },
  },
};

export function GridlexLogo({ size = 'md', showText = true, animate = true }: GridlexLogoProps) {
  return (
    <motion.div 
      className="flex items-center gap-2"
      whileHover="hover"
    >
      <div className={sizes[size].icon}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="gn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#003B5C" />
              <stop offset="100%" stopColor="#0A3E6B" />
            </linearGradient>
            <linearGradient id="gc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1BA9C4" />
              <stop offset="100%" stopColor="#00ACC1" />
            </linearGradient>
          </defs>
          
          {animate ? (
            <>
              <motion.rect
                x="2" y="2" width="12" height="12" rx="2"
                fill="url(#gn)"
                variants={squareVariants}
                initial="initial"
                animate="animate"
                custom={0}
              />
              <motion.rect
                x="18" y="2" width="12" height="12" rx="2"
                fill="url(#gc)"
                variants={squareVariants}
                initial="initial"
                animate="animate"
                custom={1}
              />
              <motion.rect
                x="2" y="18" width="12" height="12" rx="2"
                fill="url(#gc)"
                opacity="0.7"
                variants={squareVariants}
                initial="initial"
                animate="animate"
                custom={2}
              />
              <motion.rect
                x="18" y="18" width="12" height="12" rx="2"
                fill="url(#gn)"
                opacity="0.7"
                variants={squareVariants}
                initial="initial"
                animate="animate"
                custom={3}
              />
            </>
          ) : (
            <>
              <rect x="2" y="2" width="12" height="12" rx="2" fill="url(#gn)" />
              <rect x="18" y="2" width="12" height="12" rx="2" fill="url(#gc)" />
              <rect x="2" y="18" width="12" height="12" rx="2" fill="url(#gc)" opacity="0.7" />
              <rect x="18" y="18" width="12" height="12" rx="2" fill="url(#gn)" opacity="0.7" />
            </>
          )}
        </svg>
      </div>
      {showText && (
        <motion.span 
          className={`font-bold ${sizes[size].text}`}
          initial={animate ? { opacity: 0, x: -10 } : undefined}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.3, type: 'spring' as const, stiffness: 500, damping: 25 }}
        >
          <span className="text-[#003B5C]">Grid</span>
          <span className="text-[#1BA9C4]">lex</span>
        </motion.span>
      )}
    </motion.div>
  );
}