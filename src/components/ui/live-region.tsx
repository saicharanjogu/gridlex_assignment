"use client";

import React, { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

export function LiveRegion({ message, politeness = 'polite', clearAfter = 5000 }: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
    
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);
      
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

// Hook for managing live region announcements
export function useLiveRegion() {
  const [message, setMessage] = useState('');

  const announce = (text: string) => {
    // Clear first to ensure re-announcement of same message
    setMessage('');
    requestAnimationFrame(() => {
      setMessage(text);
    });
  };

  return { message, announce };
}