"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GridlexLogo } from '@/components/GridlexLogo';
import { X, ChevronRight, ChevronLeft, LayoutGrid, Filter, Settings, Sparkles, Zap } from 'lucide-react';
import { springTransition, quickSpring } from '@/lib/animations';

const steps = [
  { title: 'Welcome to Gridlex', desc: 'Your unified CRM platform. Let us show you around!', icon: <Sparkles className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'Multiple View Types', desc: 'Switch between Table, Board, Calendar, and Map views.', icon: <LayoutGrid className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'Powerful Filtering', desc: 'Use filters to narrow down your records precisely.', icon: <Filter className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'Customize Your Views', desc: 'Configure fields, sorting, and save custom views.', icon: <Settings className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'You\'re All Set!', desc: 'Press ⌘K to search or ? for keyboard shortcuts.', icon: <Zap className="h-6 w-6 text-[#1BA9C4]" /> },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  exit: { scale: 0, rotate: 180 },
};

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [visible, setVisible] = useState(true);

  const complete = () => { 
    setVisible(false); 
    localStorage.setItem('onboarding-completed', 'true'); 
    onComplete(); 
  };
  
  const next = () => {
    if (step < steps.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      complete();
    }
  };
  
  const prev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={springTransition}
        >
          <Card className="w-full max-w-md mx-4 shadow-2xl border-[#1BA9C4]/20 overflow-hidden">
            <CardHeader className="relative pb-2">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-2 top-2 h-8 w-8" 
                  onClick={complete}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div 
                    key="logo"
                    className="flex justify-center mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={springTransition}
                  >
                    <GridlexLogo size="lg" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex items-center gap-3 mb-2">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-[#EBF5FA] border border-[#1BA9C4]/20 flex items-center justify-center"
                  key={step}
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={quickSpring}
                >
                  {steps[step].icon}
                </motion.div>
                <div>
                  <motion.p 
                    className="text-xs text-muted-foreground"
                    key={`step-${step}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Step {step + 1} of {steps.length}
                  </motion.p>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={springTransition}
                    >
                      <CardTitle className="text-lg text-[#003B5C]">{steps[step].title}</CardTitle>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.2 }}
                style={{ originX: 0 }}
              >
                <Progress 
                  value={((step + 1) / steps.length) * 100} 
                  className="h-1 [&>div]:bg-[#1BA9C4] [&>div]:transition-all [&>div]:duration-300" 
                />
              </motion.div>
            </CardHeader>
            
            <CardContent className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.p 
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={springTransition}
                  className="text-muted-foreground"
                >
                  {steps[step].desc}
                </motion.p>
              </AnimatePresence>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <motion.div
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={prev} 
                  disabled={step === 0}
                  className="transition-opacity"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              </motion.div>
              
              <div className="flex gap-2">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" onClick={complete}>Skip</Button>
                </motion.div>
                <motion.div 
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={next} 
                    className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white"
                  >
                    {step === steps.length - 1 ? 'Get Started' : 'Next'}
                    {step < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </motion.div>
              </div>
            </CardFooter>
            
            {/* Step indicators */}
            <div className="flex justify-center gap-1.5 pb-4">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className={`h-1.5 rounded-full transition-colors ${
                    i === step ? 'bg-[#1BA9C4] w-4' : 'bg-muted w-1.5'
                  }`}
                  animate={{ 
                    width: i === step ? 16 : 6,
                    backgroundColor: i === step ? '#1BA9C4' : '#e5e7eb'
                  }}
                  transition={quickSpring}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}