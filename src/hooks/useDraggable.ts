
"use client"

import { useState, useEffect, useCallback, RefObject } from 'react';
import { useCanvas } from '@/contexts/CanvasContext'; 

interface UseDraggableOptions {
  initialX: number;
  initialY: number;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  bounds?: RefObject<HTMLElement | null>; 
  elementRef: RefObject<HTMLElement | null>;
}

interface DragOrigin {
  startClientX: number;
  startClientY: number;
  startWorldX: number;
  startWorldY: number;
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
  const { zoom, panOffset } = useCanvas(); 

  const [position, setPosition] = useState({ x: initialX, y: initialY }); 
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState<DragOrigin | null>(null);


  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Allow mousedown for interactive elements (buttons, inputs etc. inside the draggable)
    // unless the mousedown target itself is explicitly marked as a drag handle.
    const isInteractiveElement = target.closest('button, input, textarea, select, a[href]');
    const isTargetItselfDragHandle = target.getAttribute('data-drag-handle') === 'true';

    if (isInteractiveElement && !isTargetItselfDragHandle) {
      return;
    }
    // Do not call e.preventDefault() universally here, to allow double-clicks and focus.
    // It will be called in handleMouseMove if a drag actually starts.
    
    setIsDragging(true);
    
    setDragOrigin({
      startClientX: e.clientX,
      startClientY: e.clientY,
      startWorldX: position.x, 
      startWorldY: position.y,
    });

    onDragStart?.(position.x, position.y);
  }, [position.x, position.y, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragOrigin) return;

    e.preventDefault(); // Prevent text selection etc. *during* drag
    e.stopPropagation();

    const currentClientX = e.clientX;
    const currentClientY = e.clientY;

    const deltaClientX = currentClientX - dragOrigin.startClientX;
    const deltaClientY = currentClientY - dragOrigin.startClientY;

    const deltaWorldX = deltaClientX / zoom;
    const deltaWorldY = deltaClientY / zoom;

    let newWorldX = dragOrigin.startWorldX + deltaWorldX;
    let newWorldY = dragOrigin.startWorldY + deltaWorldY;

    if (bounds?.current && elementRef.current) {
      const boundsRect = bounds.current.getBoundingClientRect(); 
      const elementWidth = elementRef.current.offsetWidth; 
      const elementHeight = elementRef.current.offsetHeight;

      const minWorldX = (-panOffset.x / zoom);
      const minWorldY = (-panOffset.y / zoom);
      const maxWorldX = (boundsRect.width - panOffset.x) / zoom - elementWidth;
      const maxWorldY = (boundsRect.height - panOffset.y) / zoom - elementHeight;
      
      newWorldX = Math.max(minWorldX, Math.min(maxWorldX, newWorldX));
      newWorldY = Math.max(minWorldY, Math.min(maxWorldY, newWorldY));
    }
    
    setPosition({ x: newWorldX, y: newWorldY });
    onDrag?.(newWorldX, newWorldY);
  }, [isDragging, dragOrigin, zoom, panOffset, bounds, elementRef, onDrag]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDragOrigin(null);
    onDragEnd?.(position.x, position.y); 
  }, [isDragging, onDragEnd, position.x, position.y]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; 
      document.body.style.cursor = 'grabbing'; // Set body cursor to grabbing
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = ''; // Revert body cursor
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = ''; // Ensure cleanup on unmount
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
