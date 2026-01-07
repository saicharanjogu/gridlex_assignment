"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GridlexLogo } from '@/components/GridlexLogo';
import { X, ChevronRight, ChevronLeft, LayoutGrid, Filter, Settings, Sparkles, Zap } from 'lucide-react';

const steps = [
  { title: 'Welcome to Gridlex', desc: 'Your unified CRM platform. Let us show you around!', icon: <Sparkles className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'Multiple View Types', desc: 'Switch between Table, Board, Calendar, and Map views.', icon: <LayoutGrid className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'Powerful Filtering', desc: 'Use filters to narrow down your records precisely.', icon: <Filter className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'Customize Your Views', desc: 'Configure fields, sorting, and save custom views.', icon: <Settings className="h-6 w-6 text-[#1BA9C4]" /> },
  { title: 'You\'re All Set!', desc: 'Press ⌘K to search or ? for keyboard shortcuts.', icon: <Zap className="h-6 w-6 text-[#1BA9C4]" /> },
];

export function OnboardingTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  const complete = () => { setVisible(false); localStorage.setItem('onboarding-completed', 'true'); onComplete(); };
  const next = () => step < steps.length - 1 ? setStep(step + 1) : complete();
  const prev = () => step > 0 && setStep(step - 1);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-[#1BA9C4]/20">
        <CardHeader className="relative pb-2">
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={complete}><X className="h-4 w-4" /></Button>
          {step === 0 && <div className="flex justify-center mb-4"><GridlexLogo size="lg" /></div>}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FA] border border-[#1BA9C4]/20 flex items-center justify-center">{steps[step].icon}</div>
            <div>
              <p className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</p>
              <CardTitle className="text-lg text-[#003B5C]">{steps[step].title}</CardTitle>
            </div>
          </div>
          <Progress value={((step + 1) / steps.length) * 100} className="h-1 [&>div]:bg-[#1BA9C4]" />
        </CardHeader>
        <CardContent><p className="text-muted-foreground">{steps[step].desc}</p></CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 0}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={complete}>Skip</Button>
            <Button onClick={next} className="bg-[#0A3E6B] hover:bg-[#003B5C] text-white">
              {step === steps.length - 1 ? 'Get Started' : 'Next'}{step < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}