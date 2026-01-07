"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  List,
  LayoutGrid,
  Calendar,
  Map,
  Filter,
  Settings,
  Sparkles,
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to DataView Pro',
    description: 'Manage your records with powerful multi-view capabilities. Let us show you around!',
    icon: <Sparkles className="h-6 w-6 text-primary" />,
  },
  {
    id: 'views',
    title: 'Multiple View Types',
    description: 'Switch between List, Kanban, Calendar, and Map views to visualize your data in different ways.',
    icon: <LayoutGrid className="h-6 w-6 text-primary" />,
    target: '[data-tour="view-tabs"]',
  },
  {
    id: 'filters',
    title: 'Powerful Filtering',
    description: 'Use filters to narrow down your records. Combine multiple filters for precise results.',
    icon: <Filter className="h-6 w-6 text-primary" />,
    target: '[data-tour="filters"]',
  },
  {
    id: 'customize',
    title: 'Customize Your Views',
    description: 'Configure which fields are visible, set default sorting, and save your custom views.',
    icon: <Settings className="h-6 w-6 text-primary" />,
    target: '[data-tour="settings"]',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

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

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {step.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{step.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}