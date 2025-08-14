"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    const currentPath = pathname || '';
    const previousPath = previousPathRef.current;

    // Check if we're returning to homepage from an application page
    if (currentPath === '/' && previousPath && isApplicationPage(previousPath)) {
      // Force a full page reload to ensure GSAP animations are properly reinitialized
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }

    // Update previous path for next navigation
    previousPathRef.current = currentPath;
  }, [pathname]);

  // Helper function to check if a path is an application page
  const isApplicationPage = (path: string): boolean => {
    return path.startsWith('/apply') || 
           path.startsWith('/apply-students') || 
           path.startsWith('/interest-form');
  };

  return null; // This component doesn't render anything
}
