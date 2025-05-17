
"use client"

import { useCanvas } from '@/contexts/CanvasContext';
import { CanvasElement } from './CanvasElement';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

export function Canvas() {
  const { elements, selectElement } = useCanvas();
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={cn(
        "relative w-full h-full overflow-hidden bg-muted/30 shadow-inner", // Use muted for a softer background than main bg
        "p-4" 
      )}
      onClick={handleCanvasClick}
      style={{ 
        minHeight: 'calc(100vh - theme(spacing.4) * 2)', // Adjust if there are headers/footers within SidebarInset
        height: '100%' // Ensure it tries to fill parent
      }} 
    >
      {elements.sort((a,b) => a.zIndex - b.zIndex).map((element) => (
        <CanvasElement
          key={element.id}
          element={element}
          canvasBoundsRef={canvasRef}
        />
      ))}
      {elements.length === 0 && (
         <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-lg select-none pointer-events-none">
            <p>Your canvas is empty. Add elements using the toolbar!</p>
         </div>
      )}
    </div>
  );
}
