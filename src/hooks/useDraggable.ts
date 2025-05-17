
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

  const processDragStart = (clientX: number, clientY: number) => {
    const target = event?.target as HTMLElement;
    const isInteractiveElement = target.closest('button, input, textarea, select, a[href]');
    const isTargetItselfDragHandle = target.getAttribute('data-drag-handle') === 'true' || (elementRef.current && elementRef.current.contains(target) && target.getAttribute('data-drag-handle') !== 'false');

    if (isInteractiveElement && !isTargetItselfDragHandle) return false;
    if (target.getAttribute('data-drag-handle') === 'false' || target.nodeName === 'TEXTAREA' || target.nodeName === 'INPUT') return false;
    
    const onButton = target.closest('button');
    if (onButton && elementRef.current && elementRef.current.contains(onButton)) {
      // Do nothing if a button inside is clicked
    } else {
      // For actual drag start, prevent default actions that might interfere during move
      event?.preventDefault(); // Conditionally prevent if not a button
    }

    setIsDragging(true);
    setDragOrigin({
      startClientX: clientX,
      startClientY: clientY,
      startWorldX: position.x, 
      startWorldY: position.y,
    });
    onDragStart?.(position.x, position.y);
    return true;
  };
  
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    processDragStart(e.clientX, e.clientY);
  }, [position.x, position.y, onDragStart, elementRef, zoom, panOffset]); // Add zoom and panOffset to deps if they affect start logic

  const handleTouchStartDraggable = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length === 1) {
       // For touch, prevent default to stop page scroll if drag starts
      if(processDragStart(e.touches[0].clientX, e.touches[0].clientY)) {
        e.preventDefault(); 
      }
    }
  }, [position.x, position.y, onDragStart, elementRef, zoom, panOffset]); // Add zoom and panOffset

  const processDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragOrigin) return;
    
    event?.preventDefault(); 
    event?.stopPropagation();

    const deltaClientX = clientX - dragOrigin.startClientX;
    const deltaClientY = clientY - dragOrigin.startClientY;

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
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    processDragMove(e.clientX, e.clientY);
  }, [isDragging, dragOrigin, zoom, panOffset, bounds, elementRef, onDrag]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      processDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [isDragging, dragOrigin, zoom, panOffset, bounds, elementRef, onDrag]);


  const processDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragOrigin(null);
    onDragEnd?.(position.x, position.y); 
  };

  const handleMouseUp = useCallback(() => {
    processDragEnd();
  }, [isDragging, onDragEnd, position.x, position.y]);
  
  const handleTouchEnd = useCallback(() => {
    processDragEnd();
  }, [isDragging, onDragEnd, position.x, position.y]);


  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      document.body.style.userSelect = 'none'; 
      document.body.style.cursor = 'move';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = ''; 
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = ''; 
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, isDragging]);


  return {
    position, 
    isDragging,
    handleMouseDown,
    handleTouchStartDraggable, // Export new touch start handler for element
    setPosition, 
  };
}
