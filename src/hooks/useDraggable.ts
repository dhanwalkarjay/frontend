
"use client"

import { useState, useEffect, useCallback, RefObject } from 'react';
import { useCanvas } from '@/contexts/CanvasContext'; // Import useCanvas

interface UseDraggableOptions {
  initialX: number;
  initialY: number;
  onDragStart?: (x: number, y: number) => void;
  onDrag?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  bounds?: RefObject<HTMLElement | null>; // This is the viewport
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
  bounds, // Viewport reference
  elementRef,
}: UseDraggableOptions) {
  const { zoom, panOffset } = useCanvas(); // Get zoom and panOffset from context

  const [position, setPosition] = useState({ x: initialX, y: initialY }); // World coordinates
  const [isDragging, setIsDragging] = useState(false);
  // No longer need offsetFromElementOrigin, will use a different approach
  const [dragOrigin, setDragOrigin] = useState<DragOrigin | null>(null);


  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    const target = e.target as HTMLElement;
    
    const isInteractiveElement = target.matches('input, textarea, button, select, a[href]');
    const isTargetItselfDragHandle = target.hasAttribute('data-drag-handle');

    if (isInteractiveElement && !isTargetItselfDragHandle) {
      return; 
    }
    // Do not call e.preventDefault() here for dblclick to work
    
    setIsDragging(true);
    
    setDragOrigin({
      startClientX: e.clientX,
      startClientY: e.clientY,
      startWorldX: position.x, // Current world position of the element
      startWorldY: position.y,
    });

    onDragStart?.(position.x, position.y);
  }, [position.x, position.y, onDragStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragOrigin) return;

    e.preventDefault();
    e.stopPropagation();

    const currentClientX = e.clientX;
    const currentClientY = e.clientY;

    const deltaClientX = currentClientX - dragOrigin.startClientX;
    const deltaClientY = currentClientY - dragOrigin.startClientY;

    // Scale client delta by zoom to get world delta
    const deltaWorldX = deltaClientX / zoom;
    const deltaWorldY = deltaClientY / zoom;

    let newWorldX = dragOrigin.startWorldX + deltaWorldX;
    let newWorldY = dragOrigin.startWorldY + deltaWorldY;

    if (bounds?.current && elementRef.current) {
      const boundsRect = bounds.current.getBoundingClientRect(); // Viewport rect
      const elementWidth = elementRef.current.offsetWidth; // World width
      const elementHeight = elementRef.current.offsetHeight; // World height

      // Calculate min/max world coordinates for the element's top-left corner
      // such that the element remains entirely within the viewport
      const minWorldX = (-panOffset.x / zoom);
      const minWorldY = (-panOffset.y / zoom);
      const maxWorldX = (boundsRect.width - panOffset.x) / zoom - elementWidth;
      const maxWorldY = (boundsRect.height - panOffset.y) / zoom - elementHeight;
      
      newWorldX = Math.max(minWorldX, newWorldX);
      newWorldY = Math.max(minWorldY, newWorldY);
      newWorldX = Math.min(maxWorldX, newWorldX);
      newWorldY = Math.min(maxWorldY, newWorldY);
    }
    
    setPosition({ x: newWorldX, y: newWorldY });
    onDrag?.(newWorldX, newWorldY);
  }, [isDragging, dragOrigin, zoom, panOffset, bounds, elementRef, onDrag]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDragOrigin(null);
    onDragEnd?.(position.x, position.y); // position is already updated world coords
  }, [isDragging, onDragEnd, position.x, position.y]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; 
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Effect to update position if initialX/initialY change externally AND not dragging
  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, isDragging]);


  return {
    position, // This is in world coordinates
    isDragging,
    handleMouseDown,
    setPosition, 
  };
}
