
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

    // If the click target is an interactive element (input, button, etc.)
    // AND that interactive element itself does NOT have the 'data-drag-handle' attribute,
    // THEN we should prevent dragging by returning early.
    // This allows an element <button data-drag-handle="true">Drag Me</button> to be draggable,
    // but a simple <button> (like Delete/Edit) inside a draggable area to be clickable without dragging.
    if (
      target.matches('input, textarea, button, select, a[href]') &&
      !target.hasAttribute('data-drag-handle')
    ) {
      // Do not start drag, let the interactive element handle the event.
      // e.stopPropagation() might still be useful here if we want to prevent
      // the CanvasElement's own onClick from firing for these specific interactions.
      // For now, let's assume the default behavior is fine or handled by the button's own onClick.
      return;
    }
    
    e.preventDefault(); // Prevent default actions like text selection during drag
    e.stopPropagation(); // Stop event from bubbling further, especially to parent handlers

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
      newX = e.clientX - offsetFromElementOrigin.x; 
      newY = e.clientY - offsetFromElementOrigin.y;
    }
    
    setPosition({ x: newX, y: newY });
    onDrag?.(newX, newY);
  }, [isDragging, offsetFromElementOrigin, onDrag, bounds, elementRef]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    // No e.preventDefault() here typically, as mouseup doesn't have many default actions to prevent for drag.
    // e.stopPropagation() can be useful if there are global mouseup listeners to avoid.
    e.stopPropagation(); 
    
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
    // Update internal position if initialX/initialY props change and not currently dragging
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
