import { RefObject, useRef, useState } from 'react';
import { MouseEvent, TouchEvent, WheelEvent } from 'react';

interface CustomUListElement extends HTMLUListElement {
  startX?: number;
  scrollLeftStart?: number;
}

export const useDraggableScroll = () => {
  const ref: RefObject<CustomUListElement> = useRef<CustomUListElement>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cancelAnimation = () => {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      setAnimationFrame(null);
    }
  };

  const smoothScrollTo = (newScrollLeft: number) => {
    cancelAnimation();

    const startScrollLeft = ref.current!.scrollLeft;
    const change = newScrollLeft - startScrollLeft;
    const duration = 500;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeInOutProgress = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      ref.current!.scrollLeft = startScrollLeft + change * easeInOutProgress;

      if (timeElapsed < duration) {
        setAnimationFrame(window.requestAnimationFrame(animateScroll));
      } else {
        cancelAnimation(); // Ensure we clean up after animation is complete
      }
    };

    setAnimationFrame(window.requestAnimationFrame(animateScroll));
  };

  const onDragStart = (clientX: number) => {
    if (ref.current) {
      setIsDragging(true);
      ref.current.startX = clientX;
      ref.current.scrollLeftStart = ref.current.scrollLeft;
      cancelAnimation(); // Stop any existing animations when we start dragging
    }
  };

  const onDragMove = (clientX: number) => {
    if (ref.current && isDragging) {
      const walk = (clientX - ref.current.startX!) * 2;
      ref.current.scrollLeft = ref.current.scrollLeftStart! - walk;
    }
  };

  const onDragEnd = () => {
    if (ref.current) {
      setIsDragging(false);
      // Only start animation if we're not dragging anymore
      smoothScrollTo(ref.current.scrollLeft);
    }
  };

  const scrollToElement = (element: HTMLElement) => {
    if (ref.current && element) {
      // Calculate the position to scroll to, so the element is in the center
      const elementRect = element.getBoundingClientRect();
      const parentRect = ref.current.getBoundingClientRect();
      const centerPosition = (elementRect.left + elementRect.right) / 2;
      const parentCenter = (parentRect.left + parentRect.right) / 2;
      const newScrollLeft = ref.current.scrollLeft + (centerPosition - parentCenter);
  
      smoothScrollTo(newScrollLeft);
    }
  };

  return {
    ref,
    onMouseDown: (e: MouseEvent<HTMLUListElement>) => onDragStart(e.pageX),
    onMouseMove: (e: MouseEvent<HTMLUListElement>) => {
      if (ref.current && isDragging) {
        e.preventDefault();
        onDragMove(e.pageX);
      }
    },
    onMouseUp: (e: MouseEvent<HTMLUListElement>) => onDragEnd(),
    onMouseLeave: (e: MouseEvent<HTMLUListElement>) => onDragEnd(),
    onTouchStart: (e: TouchEvent<HTMLUListElement>) => onDragStart(e.touches[0].clientX),
    onTouchMove: (e: TouchEvent<HTMLUListElement>) => {
      if (isDragging) {
        e.preventDefault(); // This can help with performance on touch devices
        onDragMove(e.touches[0].clientX);
      }
    },
    onTouchEnd: (e: TouchEvent<HTMLUListElement>) => onDragEnd(),
    onWheel: (e: WheelEvent<HTMLUListElement>) => {
      if (ref.current) {
        e.preventDefault();
        smoothScrollTo(ref.current.scrollLeft + e.deltaY);
      }
    },
    scrollToElement
  };
};

export const formatAddress = (address: string) => {
  // Check if the address is valid and has the expected length (42 characters including the '0x' prefix)
  if (address && address.startsWith('0x') && address.length === 42) {
    // Take the first 6 characters after '0x' and the last 4 characters
    return `${address.substring(0, 4)}...${address.substring(address.length - 3)}`;
  } else {
    console.log("Address not valid")
  }
}