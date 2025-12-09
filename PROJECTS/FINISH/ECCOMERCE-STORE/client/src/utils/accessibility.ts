// Accessibility utility functions for WCAG 2.1 AA compliance

export const getContrastRatio = (foreground: string, background: string): number => {
  // Simple contrast ratio calculation (simplified)
  // In production, use a proper color contrast library
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsWCAG = (ratio: number, level: 'AA' | 'AAA' = 'AA'): boolean => {
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};

export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

export const trapFocus = (element: HTMLElement) => {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
  ) as NodeListOf<HTMLElement>;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      element.blur();
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  // Focus the first element
  if (firstFocusable) {
    firstFocusable.focus();
  }
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

export const focusVisibleOnly = () => {
  // Add visible focus indicators for keyboard navigation
  const style = document.createElement('style');
  style.textContent = `
    .js-focus-visible :focus:not(.focus-visible) {
      outline: none;
    }
    
    .focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
  
  document.body.classList.add('js-focus-visible');
};

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const getAccessibleLabel = (element: HTMLElement): string => {
  // Check various accessibility label sources
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.getAttribute('title') ||
    element.getAttribute('alt') ||
    element.textContent?.trim() ||
    ''
  );
};

export const setAccessibleLabel = (element: HTMLElement, label: string) => {
  element.setAttribute('aria-label', label);
};

export const createLiveRegion = (id: string, level: 'polite' | 'assertive' = 'polite') => {
  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('aria-live', level);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  return region;
};

export const updateLiveRegion = (region: HTMLElement, message: string) => {
  region.textContent = message;
};

export const removeLiveRegion = (id: string) => {
  const region = document.getElementById(id);
  if (region) {
    document.body.removeChild(region);
  }
};

export const skipToContent = () => {
  // Add skip to main content link for keyboard users
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded';
  skipLink.setAttribute('aria-label', 'Skip to main content');
  
  document.body.insertBefore(skipLink, document.body.firstChild);
};

export const checkColorContrast = (foreground: string, background: string): {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
} => {
  const ratio = getContrastRatio(foreground, background);
  return {
    ratio,
    meetsAA: meetsWCAG(ratio, 'AA'),
    meetsAAA: meetsWCAG(ratio, 'AAA')
  };
};

export const getKeyboardNavigationHandler = (
  element: HTMLElement,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onEnter?: () => void,
  onEscape?: () => void
) => {
  return (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        onArrowLeft?.();
        e.preventDefault();
        break;
      case 'ArrowRight':
        onArrowRight?.();
        e.preventDefault();
        break;
      case 'ArrowUp':
        onArrowUp?.();
        e.preventDefault();
        break;
      case 'ArrowDown':
        onArrowDown?.();
        e.preventDefault();
        break;
      case 'Enter':
        onEnter?.();
        e.preventDefault();
        break;
      case 'Escape':
        onEscape?.();
        e.preventDefault();
        break;
    }
  };
};