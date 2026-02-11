import { useRef, useCallback, useEffect } from "react";

interface UseSmoothAutoScrollOptions {
  /** Speed of smooth scroll in pixels per frame (default: 8) */
  scrollSpeed?: number;
  /** Threshold to consider user "at bottom" (default: 100px) */
  bottomThreshold?: number;
  /** Debounce time for user scroll detection in ms (default: 150) */
  userScrollDebounce?: number;
}

export function useSmoothAutoScroll(options: UseSmoothAutoScrollOptions = {}) {
  const {
    scrollSpeed = 8,
    bottomThreshold = 100,
    userScrollDebounce = 150,
  } = options;

  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const isUserScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);

  // Check if user is near bottom
  const isNearBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < bottomThreshold;
  }, [bottomThreshold]);

  // Handle user scroll - temporarily pause auto-scroll
  const handleUserScroll = useCallback(() => {
    // If we're auto-scrolling, don't treat it as user scroll
    if (isAutoScrollingRef.current) return;

    isUserScrollingRef.current = true;

    // Clear existing timeout
    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }

    // Reset user scrolling flag after debounce period if user is at bottom
    userScrollTimeoutRef.current = setTimeout(() => {
      if (isNearBottom()) {
        isUserScrollingRef.current = false;
      }
    }, userScrollDebounce);
  }, [userScrollDebounce, isNearBottom]);

  // Smooth scroll animation
  const smoothScrollToBottom = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Don't scroll if user is manually scrolling up
    if (isUserScrollingRef.current && !isNearBottom()) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const targetScrollTop = scrollHeight - clientHeight;
    const distance = targetScrollTop - scrollTop;

    // If already at bottom, no need to scroll
    if (distance <= 0) return;

    // Calculate smooth scroll amount
    const scrollAmount = Math.min(distance, Math.max(scrollSpeed, distance * 0.15));

    isAutoScrollingRef.current = true;
    container.scrollTop = scrollTop + scrollAmount;
    
    // Schedule next frame if not at bottom
    if (container.scrollTop < targetScrollTop - 1) {
      animationFrameRef.current = requestAnimationFrame(smoothScrollToBottom);
    } else {
      isAutoScrollingRef.current = false;
    }
  }, [scrollSpeed, isNearBottom]);

  // Trigger scroll (call this when content updates)
  const triggerScroll = useCallback(() => {
    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Start smooth scroll
    animationFrameRef.current = requestAnimationFrame(smoothScrollToBottom);
  }, [smoothScrollToBottom]);

  // Instant scroll to bottom (for initial load)
  const scrollToBottomInstant = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    isAutoScrollingRef.current = true;
    container.scrollTop = container.scrollHeight;
    requestAnimationFrame(() => {
      isAutoScrollingRef.current = false;
    });
  }, []);

  // Set up scroll container
  const setScrollContainer = useCallback((element: HTMLElement | null) => {
    // Remove listener from old container
    if (scrollContainerRef.current) {
      scrollContainerRef.current.removeEventListener("scroll", handleUserScroll);
    }

    scrollContainerRef.current = element;

    // Add listener to new container
    if (element) {
      element.addEventListener("scroll", handleUserScroll, { passive: true });
    }
  }, [handleUserScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", handleUserScroll);
      }
    };
  }, [handleUserScroll]);

  // Resume auto-scroll when user scrolls back to bottom
  const checkAndResumeAutoScroll = useCallback(() => {
    if (isNearBottom()) {
      isUserScrollingRef.current = false;
    }
  }, [isNearBottom]);

  return {
    setScrollContainer,
    triggerScroll,
    scrollToBottomInstant,
    isUserScrolling: () => isUserScrollingRef.current,
    checkAndResumeAutoScroll,
  };
}
