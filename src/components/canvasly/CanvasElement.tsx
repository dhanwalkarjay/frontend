
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null); 
  const [isEditingText, setIsEditingText] = useState(false);
  const [editText, setEditText] = useState(element.content);

  const { position, handleMouseDown, handleTouchStartDraggable } = useDraggable({
    initialX: element.x,
    initialY: element.y,
    elementRef,
    bounds: canvasBoundsRef,
    onDragEnd: (x, y) => {
      updateElement(element.id, { x, y });
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
        // Mark animation as complete so it doesn't run again
        updateElement(element.id, { isNewlyAdded: false });
      }, 700); // Animation duration is 0.7s
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
      handleMouseDown(e); 
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
        "absolute cursor-move select-none group",
        "flex items-center justify-center",
        "bg-card/70 backdrop-blur-sm rounded-md",
        isSelected 
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background z-[999] shadow-xl border-primary/50" 
          : "shadow-md hover:shadow-lg border border-transparent hover:border-primary/30",
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
      onMouseDown={handleElementMouseDown}
      onTouchStart={handleElementTouchStart}
      onDoubleClick={element.type === 'text' && !isEditingText ? handleDoubleClick : undefined}
      data-element-id={element.id}
      data-drag-handle="true"
    >
      {renderContent()}
      {isSelected && !isEditingText && (
        <>
          <Button
            variant="default"
            size="icon"
            className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 p-1 shadow-lg opacity-0 group-hover:opacity-100"
            onClick={handleDelete}
            onMouseDown={(e) => e.stopPropagation()} 
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
