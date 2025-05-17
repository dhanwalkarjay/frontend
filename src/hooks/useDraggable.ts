
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
    const currentElement = elementRef.current;

    // Check if the mousedown target is an interactive element (input, button, etc.)
    // AND that interactive element itself does NOT have the 'data-drag-handle' attribute.
    const isInteractiveElement = target.matches('input, textarea, button, select, a[href]');
    const isTargetItselfDragHandle = target.hasAttribute('data-drag-handle');

    if (isInteractiveElement && !isTargetItselfDragHandle) {
      // This is an interactive element that is not meant to be a drag handle itself.
      // Let its default action proceed (e.g., button click, focusing input).
      // Do NOT call e.preventDefault() or start a drag.
      // We also don't want to stop propagation here, to allow its own event handlers.
      return;
    }

    // If we reach here, the mousedown is on a draggable area or an explicit drag handle.
    // Do NOT call e.preventDefault() here. It will be called in handleMouseMove if a drag actually occurs.
    // This allows events like 'dblclick' to function correctly for initiating text editing.

    // Stop propagation if the event originated on an element explicitly marked as a drag handle
    // or the main draggable element, to prevent parent draggables (if any) or other listeners.
    if (target.closest('[data-drag-handle="true"]')) {
        e.stopPropagation();
    }


    setIsDragging(true);

    const elementRect = currentElement?.getBoundingClientRect();
    if (elementRect) {
        setOffsetFromElementOrigin({
            x: e.clientX - elementRect.left,
            y: e.clientY - elementRect.top,
        });
    } else {
        setOffsetFromElementOrigin({ x: 0, y: 0});
    }

    onDragStart?.(position.x, position.y);
  }, [position.x, position.y, onDragStart, elementRef]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Prevent default actions (like text selection) ONLY when actually dragging.
    e.preventDefault();
    e.stopPropagation();

    let newX = e.clientX;
    let newY = e.clientY;

    if (bounds?.current && elementRef.current) {
      const boundsRect = bounds.current.getBoundingClientRect();
      const elementWidth = elementRef.current.offsetWidth;
      const elementHeight = elementRef.current.offsetHeight;

      newX = (e.clientX - boundsRect.left) - offsetFromElementOrigin.x;
      newY = (e.clientY - boundsRect.top) - offsetFromElementOrigin.y;

      newX = Math.max(0, newX);
      newY = Math.max(0, newY);
      newX = Math.min(boundsRect.width - elementWidth, newX);
      newY = Math.min(boundsRect.height - elementHeight, newY);
    } else {
      // Fallback for unbounded drag (or if somehow elementRef/bounds aren't set up as expected)
      newX = e.clientX - offsetFromElementOrigin.x;
      newY = e.clientY - offsetFromElementOrigin.y;
    }

    setPosition({ x: newX, y: newY });
    onDrag?.(newX, newY);
  }, [isDragging, offsetFromElementOrigin, onDrag, bounds, elementRef]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.stopPropagation(); // Consistent with other handlers

    setIsDragging(false);
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
