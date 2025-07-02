import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollPosition = () => {
  const { pathname } = useLocation();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Save scroll position when leaving the page
    const saveScrollPosition = () => {
      if (pathname === '/catalog') {
        sessionStorage.setItem('catalogScrollPosition', element.scrollTop.toString());
      }
    };

    // Restore scroll position when entering the page
    if (pathname === '/catalog') {
      const savedPosition = sessionStorage.getItem('catalogScrollPosition');
      if (savedPosition) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          element.scrollTop = parseInt(savedPosition);
        });
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', saveScrollPosition);
    
    return () => {
      window.removeEventListener('beforeunload', saveScrollPosition);
      // Save position when component unmounts
      if (pathname === '/catalog') {
        saveScrollPosition();
      }
    };
  }, [pathname]);

  return elementRef;
};

// Hook to save and restore filter states
export const useFilterPersistence = () => {
  const { pathname } = useLocation();

  const saveFilters = (filters: {
    searchTerm: string;
    selectedCategory: string;
    priceRange: string;
    sortBy: string;
  }) => {
    if (pathname === '/catalog') {
      sessionStorage.setItem('catalogFilters', JSON.stringify(filters));
    }
  };

  const loadFilters = () => {
    if (pathname === '/catalog') {
      const savedFilters = sessionStorage.getItem('catalogFilters');
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters);
        } catch (error) {
          console.error('Error loading saved filters:', error);
        }
      }
    }
    return {
      searchTerm: '',
      selectedCategory: '',
      priceRange: '',
      sortBy: ''
    };
  };

  const clearSavedFilters = () => {
    sessionStorage.removeItem('catalogFilters');
  };

  return { saveFilters, loadFilters, clearSavedFilters };
}; 