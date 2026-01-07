"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GridlexLogo } from '@/components/GridlexLogo';
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
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Gridlex',
    description: 'Your unified CRM platform for managing contacts, opportunities, and tasks. Let us show you around!',
    icon: <Sparkles className="h-6 w-6 text-[#1BA9C4]" />,
  },
  {
    id: 'views',
    title: 'Multiple View Types',
    description: 'Switch between Table, Board, Calendar, and Map views to visualize your data in different ways.',
    icon: <LayoutGrid className="h-6 w-6 text-[#1BA9C4]" />,
    target: '[data-tour="view-tabs"]',
  },
  {
    id: 'filters',
    title: 'Powerful Filtering',
    description: 'Use filters to narrow down your records. Combine multiple filters for precise results.',
    icon: <Filter className="h-6 w-6 text-[#1BA9C4]" />,
    target: '[data-tour="filters"]',
  },
  {
    id: 'customize',
    title: 'Customize Your Views',
    description: 'Configure which fields are visible, set default sorting, and save your custom views.',
    icon: <Settings className="h-6 w-6 text-[#1BA9C4]" />,
    target: '[data-tour="settings"]',
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Start managing your data with Gridlex. Press ⌘K to search or ? for keyboard shortcuts.',
    icon: <Zap className="h-6 w-6 text-[#1BA9C4]" />,
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
      <Card className="w-full max-w-md mx-4 shadow-2xl border-[#1BA9C4]/20">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-[#003B5C]"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {currentStep === 0 && (
            <div className="flex justify-center mb-4">
              <GridlexLogo size="lg" />
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FA] border border-[#1BA9C4]/20 flex items-center justify-center">
              {step.icon}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {tourSteps.length}
              </p>
              <CardTitle className="text-lg text-[#003B5C]">{step.title}</CardTitle>
            </div>
          </div>
          <Progress value={progress} className="h-1 [&>div]:bg-[#1BA9C4]" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{step.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button 
              onClick={handleNext} 
              className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white border-0 shadow-md shadow-[#003B5C]/25"
            >
              {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}