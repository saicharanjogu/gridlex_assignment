import { Variants, Transition } from 'framer-motion';

// Default spring transition for natural feel
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
};

// Faster spring for micro-interactions
export const quickSpring: Transition = {
  type: 'spring',
  stiffness: 700,
  damping: 35,
};

// Smooth ease for fades
export const smoothEase: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1],
};

// Page/View transition variants
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// Fade variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Scale fade for dialogs/modals
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Slide up variants
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// Slide in from left
export const slideLeftVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Slide in from right
export const slideRightVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

// Card hover/tap variants for interactive cards
export const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, y: -2 },
  tap: { scale: 0.98 },
  drag: { scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 50 },
};

// List item variants for staggered animations
export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Container variants for staggered children
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

// Badge/pill pop-in animation
export const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Collapse/expand variants
export const collapseVariants: Variants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
};

// Subtle pulse for attention
export const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
    },
  },
};

// Shake for errors
export const shakeVariants: Variants = {
  initial: { x: 0 },
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// Check/success animation
export const checkVariants: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1, 
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
};

// Skeleton shimmer keyframes (for CSS)
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

// Helper to check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get transition based on reduced motion preference
export const getTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return transition;
};