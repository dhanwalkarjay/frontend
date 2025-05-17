
"use client"

import type { CanvasElementData } from '@/types/canvas';
import { useCanvas } from '@/contexts/CanvasContext';
import React, { useRef, useState, useEffect } from 'react';
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

export function CanvasElement({ element, canvasBoundsRef }: CanvasElementProps) {
  const { updateElement, selectElement, selectedElementId, deleteElement } = useCanvas();
  const isSelected = selectedElementId === element.id;
  const elementRef = useRef<HTMLDivElement>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(element.content);

  const { position, handleMouseDown } = useDraggable({ // Removed setPosition from destructuring as it's not used here
    initialX: element.x,
    initialY: element.y,
    elementRef,
    bounds: canvasBoundsRef,
    onDragEnd: (x, y) => {
      updateElement(element.id, { x, y });
    },
  });

  // This useEffect was potentially redundant or could conflict with the useDraggable hook's internal position management.
  // The useDraggable hook itself updates its internal position based on initialX/initialY props when not dragging.
  // useEffect(() => {
  //   if (!isEditingText && (element.x !== position.x || element.y !== position.y)) {
  //     setPosition({ x: element.x, y: element.y });
  //   }
  // }, [element.x, element.y, position.x, position.y, setPosition, isEditingText]);

  useEffect(() => {
    // Update internal edit text if element content changes from outside while editing (e.g. collaboration)
    if (isEditingText && element.content !== editText) {
        setEditText(element.content);
    }
  }, [element.content, isEditingText, editText]);


  const handleClick = (e: React.MouseEvent) => {
    // This click handler will still fire after a drag's mouseup,
    // ensure it doesn't interfere if not needed, or rely on mousedown for selection.
    e.stopPropagation(); 
    // selectElement is also called onMouseDown, this might be redundant
    // but ensures selection if mousedown logic changes or is bypassed.
    if (selectedElementId !== element.id) {
       selectElement(element.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering element selection or drag
    deleteElement(element.id);
  };

  const handleDoubleClick = () => {
    if (element.type === 'text') {
      setIsEditingText(true);
      setEditText(element.content);
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
              value={editText}
              onChange={handleTextEditChange}
              onBlur={handleTextEditBlur}
              onKeyDown={handleTextEditKeyDown}
              autoFocus
              className="w-full h-full p-1 bg-background border-dashed border-primary/50 resize-none focus:ring-1 focus:ring-primary text-foreground"
              style={{ fontSize: `${element.fontSize || 16}px`, color: element.textColor || 'hsl(var(--foreground))' }}
              onClick={(e) => e.stopPropagation()} 
              onMouseDown={(e) => e.stopPropagation()} 
            />
          );
        }
        return (
          <div 
            className="w-full h-full flex items-center justify-center p-1 break-words overflow-hidden whitespace-pre-wrap"
            style={{ fontSize: `${element.fontSize || 16}px`, color: element.textColor || 'hsl(var(--foreground))' }}
            onDoubleClick={handleDoubleClick}
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
        "absolute cursor-grab select-none group", 
        "flex items-center justify-center",
        "shadow-md hover:shadow-lg transition-shadow duration-200",
        "bg-card/70 backdrop-blur-sm rounded-md border border-transparent", 
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background z-[999] !shadow-xl border-primary/50", 
        !isSelected && "hover:border-primary/30",
        element.type === 'text' && !isEditingText && "hover:bg-accent/20" 
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
      onMouseDown={(e) => { 
        if (!isEditingText) { 
          handleMouseDown(e); 
        }
        if (selectedElementId !== element.id) {
          selectElement(element.id);
        }
      }}
      onClick={handleClick} 
      data-element-id={element.id}
      data-drag-handle="true" // The entire CanvasElement is a drag handle by default
    >
      {renderContent()}
      {isSelected && !isEditingText && (
        <>
          <Button
            variant="default" 
            size="icon"
            className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete} // This button's click will be handled, drag won't start due to useDraggable changes
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag from starting on button, also helps useDraggable
            aria-label="Delete element"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
          {element.type === 'text' && (
             <Button
              variant="default"
              size="icon"
              className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); handleDoubleClick();}} // Similar to delete button
              onMouseDown={(e) => e.stopPropagation()} 
              aria-label="Edit text"
            >
              <Edit3Icon className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
