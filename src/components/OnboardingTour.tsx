"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GridlexLogo } from '@/components/GridlexLogo';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  LayoutGrid,
  Filter,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gridlex',
    description: 'Your unified CRM platform for managing contacts, opportunities, and tasks. Let us show you around!',
    icon: <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />,
  },
  {
    id: 'views',
    title: 'Multiple View Types',
    description: 'Switch between Table, Board, Calendar, and Map views to visualize your data in different ways. Use keyboard shortcuts ⌘1-4 for quick access.',
    icon: <LayoutGrid className="h-6 w-6 text-primary" aria-hidden="true" />,
  },
  {
    id: 'filters',
    title: 'Powerful Filtering',
    description: 'Use filters to narrow down your records. Combine multiple filters for precise results. Your filters are saved automatically.',
    icon: <Filter className="h-6 w-6 text-primary" aria-hidden="true" />,
  },
  {
    id: 'customize',
    title: 'Customize Your Views',
    description: 'Configure which fields are visible, set default sorting, and save your custom views for quick access later.',
    icon: <Settings className="h-6 w-6 text-primary" aria-hidden="true" />,
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start managing your data with Gridlex. Press ⌘K to search anywhere, or ? to see all keyboard shortcuts.',
    icon: <Zap className="h-6 w-6 text-primary" aria-hidden="true" />,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const previousButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Focus management
  useEffect(() => {
    if (isVisible && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isVisible, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      switch (e.key) {
        case 'Escape':
          handleComplete();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (currentStep < tourSteps.length - 1) {
            handleNext();
          } else {
            handleComplete();
          }
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            handlePrevious();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding-completed', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <Card 
        ref={cardRef}
        className="w-full max-w-md mx-4 shadow-2xl border-primary/20"
        tabIndex={-1}
      >
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleComplete}
            aria-label="Close onboarding tour"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
          
          {currentStep === 0 && (
            <div className="flex justify-center mb-4">
              <GridlexLogo size="lg" />
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl gradient-primary-subtle border border-primary/20 flex items-center justify-center">
              {step.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
              <CardTitle id="onboarding-title" className="text-lg">
                {step.title}
              </CardTitle>
            </div>
          </div>
          <Progress 
            value={progress} 
            className="h-1 [&>div]:gradient-primary" 
            aria-label={`Progress: step ${currentStep + 1} of ${tourSteps.length}`}
          />
        </CardHeader>
        <CardContent>
          <p id="onboarding-description" className="text-muted-foreground">
            {step.description}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            ref={previousButtonRef}
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-muted-foreground"
            aria-label="Go to previous step"
          >
            <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleComplete}>
              Skip Tour
            </Button>
            <Button 
              ref={nextButtonRef}
              onClick={handleNext} 
              className="gradient-primary border-0 shadow-md shadow-primary/25"
              aria-label={currentStep === tourSteps.length - 1 ? 'Finish tour and get started' : 'Go to next step'}
            >
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < tourSteps.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
              )}
            </Button>
          </div>
        </CardFooter>
        
        {/* Screen reader instructions */}
        <VisuallyHidden>
          <p>Use arrow keys to navigate between steps. Press Escape to close.</p>
        </VisuallyHidden>
      </Card>
    </div>
  );
}