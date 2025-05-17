
"use client"

import { useCanvas } from '@/contexts/CanvasContext';
import { CanvasElement } from './CanvasElement';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;

export function Canvas() {
  const { elements, selectElement, zoom, setZoom, panOffset, setPanOffset } = useCanvas();
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null); // Ref for the transformed world container

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [initialPanOffset, setInitialPanOffset] = useState({ x: 0, y: 0 });


  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!canvasViewportRef.current) return;

    const rect = canvasViewportRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; // Mouse position relative to viewport
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));

    // Calculate mouse position in world coordinates before zoom
    const mouseWorldX_before = (mouseX - panOffset.x) / zoom;
    const mouseWorldY_before = (mouseY - panOffset.y) / zoom;

    // Update pan offset to keep the mouse position fixed relative to the viewport
    const newPanX = mouseX - mouseWorldX_before * clampedZoom;
    const newPanY = mouseY - mouseWorldY_before * clampedZoom;

    setZoom(clampedZoom);
    setPanOffset({ x: newPanX, y: newPanY });

  }, [zoom, setZoom, panOffset, setPanOffset]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // If click is directly on the viewport background (not on an element or its controls)
    if (e.target === canvasViewportRef.current || e.target === worldRef.current) {
      selectElement(null); // Deselect any selected element
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setInitialPanOffset(panOffset); // Store panOffset at the start of panning
      // Cursor will be set in useEffect
    }
  }, [selectElement, panOffset]);

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
      // Cursor will be reset in useEffect
    }
  }, [isPanning]);
  
  useEffect(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    if (isPanning) {
      viewport.style.cursor = 'grabbing';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection during pan
    } else {
      viewport.style.cursor = 'grab'; // Default cursor for panning
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      if (viewport) {
        viewport.style.cursor = 'default'; // Or 'grab' if you want it to persist
      }
    };
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Set initial cursor
  useEffect(() => {
    if (canvasViewportRef.current) {
      canvasViewportRef.current.style.cursor = 'grab';
    }
  }, []);


  return (
    <div
      ref={canvasViewportRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-muted/30 shadow-inner select-none",
        "p-0" // Padding removed from viewport, will be on world or handled by pan
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      style={{ 
        minHeight: '100%', 
        height: '100%'
      }}
    >
      <div
        ref={worldRef}
        className="absolute top-0 left-0" // World starts at viewport's top-left before transform
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: '0 0', // Zoom and pan relative to top-left of the world
          width: '1px', // Effectively infinite, actual size determined by elements
          height: '1px',
        }}
      >
        {elements.sort((a,b) => a.zIndex - b.zIndex).map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            canvasBoundsRef={canvasViewportRef} // Pass viewport as bounds
          />
        ))}
      </div>
      {elements.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-lg pointer-events-none">
            <p>Your canvas is empty. Add elements using the toolbar!</p>
         </div>
      )}
    </div>
  );
}
