"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useNavigateAndScroll() {
  const router = useRouter();

  const navigateAndScroll = useCallback((
    path: string, 
    selector?: string,
    options?: { 
      delay?: number; 
      block?: ScrollLogicalPosition;
      highlight?: boolean;
    }
  ) => {
    const { delay = 400, block = 'start', highlight = true } = options ?? {};

    router.push(path);

    if (selector) {
      setTimeout(() => {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          // Scroll to element
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block 
          });

          // Optional: briefly highlight the element
          if (highlight) {
            element.classList.add('ring-2', 'ring-indigo-500/50', 'ring-offset-2', 'ring-offset-slate-900');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-indigo-500/50', 'ring-offset-2', 'ring-offset-slate-900');
            }, 2000);
          }
        }
      }, delay);
    }
  }, [router]);

  return navigateAndScroll;
}
