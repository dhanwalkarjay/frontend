
"use client"

import { useState, useEffect, useCallback, RefObject } from 'react';

interface UseDraggableOptions {
  initialX: number;
  initialY: number;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  bounds?: RefObject<HTMLElement | null>; 
  elementRef: RefObject<HTMLElement | null>; 
}

export function useDraggable({
  initialX,
  initialY,
  onDragStart,
  onDrag,
  onDragEnd,
  bounds,
  elementRef,
}: UseDraggableOptions) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [offsetFromElementOrigin, setOffsetFromElementOrigin] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input, textarea, button:not([data-drag-handle])')) {
      if (!target.closest('[data-drag-handle="true"]')) {
        return;
      }
    }
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);

    const elementRect = elementRef.current?.getBoundingClientRect();
    
    if (elementRect) {
        // Calculate offset from element's top-left (0,0 of element) to mouse click position
        // This is the point within the element that was clicked.
        setOffsetFromElementOrigin({
            x: e.clientX - elementRect.left,
            y: e.clientY - elementRect.top,
        });
    } else {
        // Fallback if rects are not available
        setOffsetFromElementOrigin({ x: 0, y: 0}); // Clicked at top-left
    }

    onDragStart?.(position.x, position.y);
  }, [position.x, position.y, onDragStart, elementRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    let newX = e.clientX; // Absolute screen X
    let newY = e.clientY; // Absolute screen Y

    if (bounds?.current && elementRef.current) {
      const boundsRect = bounds.current.getBoundingClientRect();
      const elementWidth = elementRef.current.offsetWidth;
      const elementHeight = elementRef.current.offsetHeight;
      
      // Calculate desired top-left of element relative to bounds parent
      newX = (e.clientX - boundsRect.left) - offsetFromElementOrigin.x;
      newY = (e.clientY - boundsRect.top) - offsetFromElementOrigin.y;

      // Boundary checks
      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newX = Math.min(boundsRect.width - elementWidth, newX);
      newY = Math.min(boundsRect.height - elementHeight, newY);
    } else {
      // No bounds, simple relative drag (less accurate)
      newX = e.clientX - offsetFromElementOrigin.x; // This offset needs to be relative to page
      newY = e.clientY - offsetFromElementOrigin.y;
    }
    
    setPosition({ x: newX, y: newY });
    onDrag?.(newX, newY);
  }, [isDragging, offsetFromElementOrigin, onDrag, bounds, elementRef]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    // Final position update ensures it's within bounds, if any
    // The position state is already constrained by handleMouseMove
    onDragEnd?.(position.x, position.y);
  }, [isDragging, onDragEnd, position.x, position.y]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, isDragging]);


  return {
    position,
    isDragging,
    handleMouseDown,
    setPosition, 
  };
}
