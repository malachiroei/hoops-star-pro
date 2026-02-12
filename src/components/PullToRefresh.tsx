import { useEffect, useRef } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number; // Distance to pull before refresh triggers (default: 80px)
}

/**
 * Pull-to-refresh wrapper component
 * Add this around your scrollable content to enable pull-to-refresh
 */
export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    function handleTouchStart(e: TouchEvent) {
      // Only if scrolled to top
      if (element.scrollTop === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (element.scrollTop !== 0 || isRefreshingRef.current) return;

      currentYRef.current = e.touches[0].clientY - startYRef.current;

      if (currentYRef.current > 0) {
        e.preventDefault();
        const opacity = Math.min(currentYRef.current / threshold, 1);
        
        // Visual feedback: show pull indicator
        const indicator = element.querySelector('[data-pull-indicator]');
        if (indicator) {
          (indicator as HTMLElement).style.opacity = String(opacity);
          (indicator as HTMLElement).style.transform = `translateY(${currentYRef.current}px)`;
        }
      }
    }

    function handleTouchEnd() {
      if (currentYRef.current > threshold && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        onRefresh().finally(() => {
          isRefreshingRef.current = false;
          currentYRef.current = 0;
          
          // Reset indicator
          const indicator = element.querySelector('[data-pull-indicator]');
          if (indicator) {
            (indicator as HTMLElement).style.opacity = '0';
            (indicator as HTMLElement).style.transform = 'translateY(0)';
          }
        });
      }
      currentYRef.current = 0;
    }

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto"
      style={{ height: '100%' }}
    >
      {/* Pull indicator */}
      <div
        data-pull-indicator
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 opacity-0 transition-all"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
          <span className="text-xs">↓</span>
        </div>
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}
