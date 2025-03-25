import { useState, useCallback, useRef } from 'react';

export const useConfetti = (duration = 10000) => {
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerConfetti = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setIsActive(true);
    
    // Reset after animation completes
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      timerRef.current = null;
    }, duration);
  }, [duration]);

  return {
    isActive,
    triggerConfetti
  };
};