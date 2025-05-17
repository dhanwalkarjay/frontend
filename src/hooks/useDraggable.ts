
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
    // const currentElement = elementRef.current; // Not directly used here after changes

    // Check if the mousedown target is an interactive element (input, button, etc.)
    // AND that interactive element itself does NOT have the 'data-drag-handle' attribute.
    const isInteractiveElement = target.matches('input, textarea, button, select, a[href]');
    const isTargetItselfDragHandle = target.hasAttribute('data-drag-handle');

    if (isInteractiveElement && !isTargetItselfDragHandle) {
      // This is an interactive element that is not meant to be a drag handle itself.
      // Let its default action proceed (e.g., button click, focusing input).
      // Do NOT call e.preventDefault() or start a drag.
      // Do not stop propagation here, to allow its own event handlers.
      return;
    }

    // If we reach here, the mousedown is on a draggable area or an explicit drag handle.
    // Do NOT call e.preventDefault() here. It will be called in handleMouseMove if a drag actually occurs.
    // This allows events like 'dblclick' to function correctly for initiating text editing.

    // We are removing the immediate e.stopPropagation() related to 'data-drag-handle'
    // to allow dblclick to form on the element itself.
    // Propagation will be stopped in handleMouseMove if a drag actually starts.

    setIsDragging(true);

    const elementRect = elementRef.current?.getBoundingClientRect();
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
    e.stopPropagation(); // Stop propagation when a drag is confirmed and active

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
      newX = e.clientX - offsetFromElementOrigin.x;
      newY = e.clientY - offsetFromElementOrigin.y;
    }

    setPosition({ x: newX, y: newY });
    onDrag?.(newX, newY);
  }, [isDragging, offsetFromElementOrigin, onDrag, bounds, elementRef]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    // No stopPropagation needed here typically unless there's a specific parent interaction to prevent on mouseup
    // However, if mouseMove stopped it, it's usually fine.

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
    setPosition, // Exposing setPosition can be useful for external control if needed
  };
}
