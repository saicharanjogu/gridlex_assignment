"use client";

import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ViewContainer } from '@/components/views/ViewContainer';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <ViewContainer />
          </main>
        </div>
      </div>
      <Toaster />
    </AppProvider>
  );
}