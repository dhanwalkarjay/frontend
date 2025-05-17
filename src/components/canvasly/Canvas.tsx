
"use client"

import { useCanvas } from '@/contexts/CanvasContext';
import { CanvasElement } from './CanvasElement';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LayersIcon } from 'lucide-react';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

export function Canvas() {
  const { elements, selectedElementId, selectElement, zoom, setZoom, panOffset, setPanOffset } = useCanvas();
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [isPanningTouch, setIsPanningTouch] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [initialPanOffset, setInitialPanOffset] = useState({ x: 0, y: 0 });


  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasViewportRef.current) return;

    const rect = canvasViewportRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    const mouseWorldX_before = (mouseX - panOffset.x) / zoom;
    const mouseWorldY_before = (mouseY - panOffset.y) / zoom;

    const newPanX = mouseX - mouseWorldX_before * clampedZoom;
    const newPanY = mouseY - mouseWorldY_before * clampedZoom;

    setZoom(clampedZoom);
    setPanOffset({ x: newPanX, y: newPanY });

  }, [zoom, setZoom, panOffset, setPanOffset]);

  // Mouse Panning
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasViewportRef.current || e.target === worldRef.current) {
      if (selectedElementId !== null) {
         selectElement(null);
      }
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setInitialPanOffset(panOffset);
    }
  }, [selectElement, panOffset, selectedElementId]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    const deltaX = e.clientX - panStart.x;
    const deltaY = e.clientY - panStart.y;
    setPanOffset({
      x: initialPanOffset.x + deltaX,
      y: initialPanOffset.y + deltaY,
    });
  }, [isPanning, panStart, initialPanOffset, setPanOffset]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
    }
  }, [isPanning]);

  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    if (isPanning) {
      viewport.style.cursor = 'grabbing';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      viewport.style.cursor = 'grab';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      if (viewport) viewport.style.cursor = 'default';
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Touch Panning
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && (e.target === canvasViewportRef.current || e.target === worldRef.current)) {
      e.preventDefault(); 
      if (selectedElementId !== null) {
        selectElement(null);
      }
      setIsPanningTouch(true);
      setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialPanOffset(panOffset);
    }
  }, [selectElement, panOffset, selectedElementId]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPanningTouch || e.touches.length !== 1) return;
    e.preventDefault();
    const deltaX = e.touches[0].clientX - panStart.x;
    const deltaY = e.touches[0].clientY - panStart.y;
    setPanOffset({
      x: initialPanOffset.x + deltaX,
      y: initialPanOffset.y + deltaY,
    });
  }, [isPanningTouch, panStart, initialPanOffset, setPanOffset]);

  const handleTouchEnd = useCallback(() => {
    if (isPanningTouch) {
      setIsPanningTouch(false);
    }
  }, [isPanningTouch]);

  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    
    if (isPanningTouch) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
    } else {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isPanningTouch, handleTouchMove, handleTouchEnd]);


  useEffect(() => {
    if (canvasViewportRef.current) {
      canvasViewportRef.current.style.cursor = 'grab';
    }
  }, []);


  return (
    <div
      id="canvas-viewport-for-export" 
      ref={canvasViewportRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-background shadow-inner select-none", // Removed gradient, ensure bg-background
        "p-0"
      )}
      style={{
        backgroundImage: `radial-gradient(hsl(var(--border)) 0.5px, transparent 0.5px)`, // Dot pattern
        backgroundSize: '15px 15px', // Dot spacing
        minHeight: '100%',
        height: '100%'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        id="canvas-world-ref"
        ref={worldRef}
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '1px', 
          height: '1px',
        }}
      >
        {elements.sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0)).map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            canvasBoundsRef={canvasViewportRef}
          />
        ))}
      </div>
      {elements.length === 0 && (
         <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-lg pointer-events-none space-y-2">
            <LayersIcon className="w-16 h-16 opacity-50" />
            <p className="font-medium">Your canvas is empty.</p>
            <p className="text-sm">Add elements using the toolbar!</p>
         </div>
      )}
    </div>
  );
}

