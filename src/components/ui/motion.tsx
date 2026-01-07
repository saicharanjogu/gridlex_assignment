"use client";

import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import {
  fadeVariants,
  scaleVariants,
  slideUpVariants,
  listItemVariants,
  staggerContainerVariants,
  popVariants,
  springTransition,
  quickSpring,
  smoothEase,
} from '@/lib/animations';

// Animated container with fade
export const FadeIn = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={fadeVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ ...smoothEase, delay }}
    {...props}
  >
    {children}
  </motion.div>
));
FadeIn.displayName = 'FadeIn';

// Animated container with scale (good for modals/dialogs)
export const ScaleIn = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={scaleVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ ...springTransition, delay }}
    {...props}
  >
    {children}
  </motion.div>
));
ScaleIn.displayName = 'ScaleIn';

// Animated container with slide up
export const SlideUp = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={slideUpVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ ...springTransition, delay }}
    {...props}
  >
    {children}
  </motion.div>
));
SlideUp.displayName = 'SlideUp';

// Staggered list container
export const StaggerContainer = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={staggerContainerVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    {...props}
  >
    {children}
  </motion.div>
));
StaggerContainer.displayName = 'StaggerContainer';

// Staggered list item
export const StaggerItem = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={listItemVariants}
    transition={springTransition}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerItem.displayName = 'StaggerItem';

// Pop-in animation (good for badges, notifications)
export const PopIn = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { delay?: number }
>(({ children, delay = 0, ...props }, ref) => (
  <motion.div
    ref={ref}
    variants={popVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ ...quickSpring, delay }}
    {...props}
  >
    {children}
  </motion.div>
));
PopIn.displayName = 'PopIn';

// Interactive card with hover/tap animations
export const InteractiveCard = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { disabled?: boolean }
>(({ children, disabled = false, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={disabled ? undefined : { scale: 1.02, y: -2 }}
    whileTap={disabled ? undefined : { scale: 0.98 }}
    transition={quickSpring}
    {...props}
  >
    {children}
  </motion.div>
));
InteractiveCard.displayName = 'InteractiveCard';

// Presence wrapper for exit animations
export const PresenceWrapper = ({ 
  children, 
  mode = 'wait' 
}: { 
  children: React.ReactNode; 
  mode?: 'wait' | 'sync' | 'popLayout';
}) => (
  <AnimatePresence mode={mode}>
    {children}
  </AnimatePresence>
);

// Page transition wrapper
export const PageTransition = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { viewKey: string }
>(({ children, viewKey, ...props }, ref) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={viewKey}
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={springTransition}
      {...props}
    >
      {children}
    </motion.div>
  </AnimatePresence>
));
PageTransition.displayName = 'PageTransition';

// Collapse animation wrapper
export const Collapse = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { isOpen: boolean }
>(({ children, isOpen, ...props }, ref) => (
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        ref={ref}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ ...springTransition, opacity: { duration: 0.2 } }}
        style={{ overflow: 'hidden' }}
        {...props}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
));
Collapse.displayName = 'Collapse';

// Hover highlight effect
export const HoverHighlight = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'>
>(({ children, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={{ backgroundColor: 'rgba(27, 169, 196, 0.05)' }}
    transition={{ duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.div>
));
HoverHighlight.displayName = 'HoverHighlight';

// Draggable card wrapper
export const DraggableCard = React.forwardRef<
  HTMLDivElement,
  HTMLMotionProps<'div'> & { 
    isDragging?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
  }
>(({ children, isDragging, onDragStart, onDragEnd, ...props }, ref) => (
  <motion.div
    ref={ref}
    layout
    layoutId={props.id?.toString()}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ 
      opacity: isDragging ? 0.8 : 1, 
      scale: isDragging ? 1.05 : 1,
      boxShadow: isDragging 
        ? '0 10px 30px rgba(0,0,0,0.15)' 
        : '0 1px 3px rgba(0,0,0,0.1)',
      zIndex: isDragging ? 50 : 1,
    }}
    exit={{ opacity: 0, scale: 0.9 }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={quickSpring}
    {...props}
  >
    {children}
  </motion.div>
));
DraggableCard.displayName = 'DraggableCard';

// Number counter animation
export function AnimatedNumber({ 
  value, 
  className 
}: { 
  value: number; 
  className?: string;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// Checkmark animation
export function AnimatedCheck({ className }: { className?: string }) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <motion.path
        d="M5 12l5 5L20 7"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}