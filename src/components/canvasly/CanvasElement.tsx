
"use client"

import type { CanvasElementData } from '@/types/canvas';
import { useCanvas } from '@/contexts/CanvasContext';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import NextImage from 'next/image';
import { useDraggable } from '@/hooks/useDraggable';
import { cn } from '@/lib/utils';
import { Trash2Icon, Edit3Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CanvasElementProps {
  element: CanvasElementData;
  canvasBoundsRef: React.RefObject<HTMLElement | null>;
}

type ResizeHandleType = 'tl' | 'tm' | 'tr' | 'ml' | 'mr' | 'bl' | 'bm' | 'br';

const resizeHandleConfig: Array<{ id: ResizeHandleType; cursor: string; classes: string }> = [
  { id: 'tl', cursor: 'nwse-resize', classes: '-top-1.5 -left-1.5' },
  { id: 'tm', cursor: 'ns-resize', classes: '-top-1.5 left-1/2 -translate-x-1/2' },
  { id: 'tr', cursor: 'nesw-resize', classes: '-top-1.5 -right-1.5' },
  { id: 'ml', cursor: 'ew-resize', classes: 'top-1/2 -translate-y-1/2 -left-1.5' },
  { id: 'mr', cursor: 'ew-resize', classes: 'top-1/2 -translate-y-1/2 -right-1.5' },
  { id: 'bl', cursor: 'nesw-resize', classes: '-bottom-1.5 -left-1.5' },
  { id: 'bm', cursor: 'ns-resize', classes: '-bottom-1.5 left-1/2 -translate-x-1/2' },
  { id: 'br', cursor: 'nwse-resize', classes: '-bottom-1.5 -right-1.5' },
];

const MIN_DIMENSION = 20; // Minimum width/height for an element

export function CanvasElement({ element, canvasBoundsRef }: CanvasElementProps) {
  const { updateElement, selectElement, selectedElementId, deleteElement, zoom } = useCanvas();
  const isSelected = selectedElementId === element.id;
  const elementRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(element.content);

  const [isResizing, setIsResizing] = useState(false);
  const resizeStartDataRef = useRef<{
    handleId: ResizeHandleType;
    initialClientX: number;
    initialClientY: number;
    elementInitialX: number;
    elementInitialY: number;
    elementInitialWidth: number;
    elementInitialHeight: number;
  } | null>(null);

  const { position, handleMouseDown: handleDragMouseDown, handleTouchStartDraggable } = useDraggable({
    initialX: element.x,
    initialY: element.y,
    elementRef,
    bounds: canvasBoundsRef,
    onDragEnd: (x, y) => {
      if (!isResizing) { // Only update from drag if not currently resizing
        updateElement(element.id, { x, y });
      }
    },
  });

  useEffect(() => {
    if (elementRef.current && element.isNewlyAdded) {
      const el = elementRef.current;
      el.classList.add('animate-bounce-fade-in');
      const timer = setTimeout(() => {
        if (el.classList.contains('animate-bounce-fade-in')) {
          el.classList.remove('animate-bounce-fade-in');
        }
        updateElement(element.id, { isNewlyAdded: false });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [element.isNewlyAdded, element.id, updateElement]);

  useEffect(() => {
    if (isEditingText && textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, [isEditingText]);

  useEffect(() => {
    if (!isEditingText) {
      setEditText(element.content);
    }
  }, [element.content, isEditingText]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(element.id);
  };

  const handleDoubleClick = () => {
    if (element.type === 'text' && !isEditingText) {
      setIsEditingText(true);
      setEditText(element.content);
      if (selectedElementId !== element.id) {
        selectElement(element.id);
      }
    }
  };

  const handleTextEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  const handleTextEditBlur = () => {
    setIsEditingText(false);
    updateElement(element.id, { content: editText });
  };

  const handleTextEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextEditBlur();
    }
    if (e.key === 'Escape') {
      setIsEditingText(false);
      setEditText(element.content);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingText) {
      handleDragMouseDown(e);
    }
    if (selectedElementId !== element.id && !isEditingText) {
      selectElement(element.id);
    }
  };
  
  const handleElementTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isEditingText) {
      handleTouchStartDraggable(e);
    }
    if (selectedElementId !== element.id && !isEditingText) {
      selectElement(element.id);
    }
  };


  const startResize = useCallback((clientX: number, clientY: number, handleId: ResizeHandleType) => {
    setIsResizing(true);
    const handleDetails = resizeHandleConfig.find(h => h.id === handleId);
    document.body.style.cursor = handleDetails?.cursor || 'default';

    resizeStartDataRef.current = {
      handleId,
      initialClientX: clientX,
      initialClientY: clientY,
      elementInitialX: element.x,
      elementInitialY: element.y,
      elementInitialWidth: element.width,
      elementInitialHeight: element.height,
    };
    selectElement(element.id);
  }, [element, selectElement]);

  const handleMouseDownResize = useCallback((e: React.MouseEvent, handleId: ResizeHandleType) => {
    e.stopPropagation();
    e.preventDefault();
    startResize(e.clientX, e.clientY, handleId);
  }, [startResize]);

  const handleTouchStartResize = useCallback((e: React.TouchEvent, handleId: ResizeHandleType) => {
    if (e.touches.length === 1) {
      e.stopPropagation();
      e.preventDefault();
      startResize(e.touches[0].clientX, e.touches[0].clientY, handleId);
    }
  }, [startResize]);


  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !resizeStartDataRef.current) return;

      const {
        handleId,
        initialClientX,
        initialClientY,
        elementInitialX,
        elementInitialY,
        elementInitialWidth,
        elementInitialHeight,
      } = resizeStartDataRef.current;

      const currentClientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const currentClientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dxScreen = currentClientX - initialClientX;
      const dyScreen = currentClientY - initialClientY;

      // Convert screen deltas to world deltas (considering zoom)
      // For simplicity here, we assume rotation = 0 for delta application logic
      // A full solution for rotated resize would involve matrix transforms of dx/dy
      const dxWorld = dxScreen / zoom;
      const dyWorld = dyScreen / zoom;

      let newX = elementInitialX;
      let newY = elementInitialY;
      let newWidth = elementInitialWidth;
      let newHeight = elementInitialHeight;

      if (handleId.includes('l')) {
        newWidth = elementInitialWidth - dxWorld;
        newX = elementInitialX + dxWorld;
      } else if (handleId.includes('r')) {
        newWidth = elementInitialWidth + dxWorld;
      }

      if (handleId.includes('t')) {
        newHeight = elementInitialHeight - dyWorld;
        newY = elementInitialY + dyWorld;
      } else if (handleId.includes('b')) {
        newHeight = elementInitialHeight + dyWorld;
      }
      
      // Apply min dimensions and adjust position if necessary
      if (newWidth < MIN_DIMENSION) {
        if (handleId.includes('l')) {
          newX = elementInitialX + (elementInitialWidth - MIN_DIMENSION);
        }
        newWidth = MIN_DIMENSION;
      }
      if (newHeight < MIN_DIMENSION) {
        if (handleId.includes('t')) {
          newY = elementInitialY + (elementInitialHeight - MIN_DIMENSION);
        }
        newHeight = MIN_DIMENSION;
      }

      // For middle handles, keep the other axis position and dimension fixed
      if (handleId === 'tm' || handleId === 'bm') { // Top-middle, Bottom-middle (vertical resize)
          newX = elementInitialX;
          newWidth = elementInitialWidth;
      }
      if (handleId === 'ml' || handleId === 'mr') { // Middle-left, Middle-right (horizontal resize)
          newY = elementInitialY;
          newHeight = elementInitialHeight;
      }

      updateElement(element.id, { x: newX, y: newY, width: newWidth, height: newHeight });
    };

    const handleGlobalMouseUpOrTouchEnd = () => {
      if (isResizing) {
        setIsResizing(false);
        resizeStartDataRef.current = null;
        document.body.style.cursor = 'default';
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUpOrTouchEnd);
      document.addEventListener('touchmove', handleGlobalMouseMove as EventListener, { passive: false });
      document.addEventListener('touchend', handleGlobalMouseUpOrTouchEnd);
      document.addEventListener('touchcancel', handleGlobalMouseUpOrTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUpOrTouchEnd);
      document.removeEventListener('touchmove', handleGlobalMouseMove as EventListener);
      document.removeEventListener('touchend', handleGlobalMouseUpOrTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalMouseUpOrTouchEnd);
      if (isResizing) { // Reset cursor if component unmounts while resizing
          document.body.style.cursor = 'default';
      }
    };
  }, [isResizing, updateElement, element.id, zoom]);


  const renderContent = () => {
    switch (element.type) {
      case 'image':
        return (
          <NextImage
            src={element.content}
            alt={element['data-ai-hint'] || "Canvas image"}
            width={element.width}
            height={element.height}
            className="object-contain pointer-events-none w-full h-full rounded-sm"
            data-ai-hint={element['data-ai-hint'] as string || "placeholder image"}
            draggable={false}
            priority={true}
          />
        );
      case 'text':
        if (isEditingText) {
          return (
            <Textarea
              ref={textAreaRef}
              value={editText}
              onChange={handleTextEditChange}
              onBlur={handleTextEditBlur}
              onKeyDown={handleTextEditKeyDown}
              className="w-full h-full p-1 bg-background border-dashed border-primary/50 resize-none focus:ring-1 focus:ring-primary text-foreground"
              style={{
                fontSize: `${element.fontSize || 16}px`,
                color: element.textColor || 'hsl(var(--foreground))',
                fontFamily: element.fontFamily || 'Comic Sans MS, cursive, sans-serif',
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center justify-center p-1 break-words overflow-hidden whitespace-pre-wrap select-none"
            style={{
              fontSize: `${element.fontSize || 16}px`,
              color: element.textColor || 'hsl(var(--foreground))',
              fontFamily: element.fontFamily || 'Comic Sans MS, cursive, sans-serif',
            }}
          >
            {element.content}
          </div>
        );
      case 'sticker':
        return (
          <div
            className="w-full h-full flex items-center justify-center pointer-events-none select-none"
            style={{ fontSize: `${element.stickerSize || 48}px` }}
          >
            {element.content}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute select-none group",
        "flex items-center justify-center",
        "bg-card/70 backdrop-blur-sm rounded-md",
        isSelected
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background z-[999] shadow-xl border-primary/50"
          : "shadow-md hover:shadow-lg border border-transparent hover:border-primary/30",
        element.type === 'text' && !isEditingText && "hover:bg-accent/20",
        !isResizing && "cursor-move" // Apply move cursor only when not resizing
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onMouseDown={isResizing ? undefined : handleElementMouseDown} // Prevent drag start if resize is initiated
      onTouchStart={isResizing ? undefined : handleElementTouchStart} // Prevent drag start if resize is initiated
      onDoubleClick={element.type === 'text' && !isEditingText && !isResizing ? handleDoubleClick : undefined}
      data-element-id={element.id}
      data-drag-handle="true"
    >
      {renderContent()}
      {isSelected && !isEditingText && (
        <>
          {/* Delete and Edit Buttons */}
          <Button
            variant="default"
            size="icon"
            className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 p-1 shadow-lg opacity-0 group-hover:opacity-100"
            onClick={handleDelete}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            aria-label="Delete element"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
          {element.type === 'text' && (
             <Button
              variant="default"
              size="icon"
              className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 p-1 shadow-lg opacity-0 group-hover:opacity-100"
              onClick={(e) => { e.stopPropagation(); handleDoubleClick();}}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label="Edit text"
            >
              <Edit3Icon className="h-4 w-4" />
            </Button>
          )}

          {/* Resize Handles */}
          {resizeHandleConfig.map(handle => (
            <div
              key={handle.id}
              className={cn(
                "absolute w-3 h-3 bg-background border border-primary rounded-sm",
                "opacity-0 group-hover:opacity-100", // Show on hover of parent
                handle.classes
              )}
              style={{ cursor: handle.cursor }}
              onMouseDown={(e) => handleMouseDownResize(e, handle.id)}
              onTouchStart={(e) => handleTouchStartResize(e, handle.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}


    