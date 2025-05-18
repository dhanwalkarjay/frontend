"use client";

import type { CanvasElementData } from "@/types/canvas";
import { useCanvas } from "@/contexts/CanvasContext";
import React, { useRef, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { useDraggable } from "@/hooks/useDraggable";
import { cn } from "@/lib/utils";
import { Trash2Icon, Edit3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CanvasElementProps {
  element: CanvasElementData;
  canvasBoundsRef: React.RefObject<HTMLElement | null>;
}

type ResizeHandleType = "tl" | "tm" | "tr" | "ml" | "mr" | "bl" | "bm" | "br";

const resizeHandleConfig: Array<{ id: ResizeHandleType; classes: string }> = [
  { id: "tl", classes: "-top-1.5 -left-1.5" },
  { id: "tm", classes: "-top-1.5 left-1/2 -translate-x-1/2" },
  { id: "tr", classes: "-top-1.5 -right-1.5" },
  { id: "ml", classes: "top-1/2 -translate-y-1/2 -left-1.5" },
  { id: "mr", classes: "top-1/2 -translate-y-1/2 -right-1.5" },
  { id: "bl", classes: "-bottom-1.5 -left-1.5" },
  { id: "bm", classes: "-bottom-1.5 left-1/2 -translate-x-1/2" },
  { id: "br", classes: "-bottom-1.5 -right-1.5" },
];

const MIN_DIMENSION = 20; // Minimum width/height for an element
const DEFAULT_TEXT_FONT_FAMILY = "Comic Sans MS, cursive, sans-serif";
const PADDING_AROUND_TEXT_PX = 4; // Corresponds to p-1 (0.25rem * 16px/rem)

export function CanvasElement({
  element,
  canvasBoundsRef,
}: CanvasElementProps) {
  const {
    updateElement,
    selectElement,
    selectedElementId,
    deleteElement,
    zoom,
    bringToFront,
  } = useCanvas();
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

  const {
    position,
    handleMouseDown: handleDragMouseDown,
    handleTouchStartDraggable,
  } = useDraggable({
    initialX: element.x,
    initialY: element.y,
    elementRef,
    bounds: canvasBoundsRef,
    onDragStart: () => {
      if (selectedElementId !== element.id) {
        selectElement(element.id);
      } else {
        bringToFront(element.id);
      }
    },
    onDragEnd: (x, y) => {
      if (!isResizing) {
        updateElement(element.id, { x, y });
      }
    },
  });

  useEffect(() => {
    if (elementRef.current && element.isNewlyAdded) {
      const el = elementRef.current;
      el.classList.add("animate-bounce-fade-in");
      const timer = setTimeout(() => {
        if (el.classList.contains("animate-bounce-fade-in")) {
          el.classList.remove("animate-bounce-fade-in");
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

  // Auto-adjust height for text elements
  useEffect(() => {
    if (element.type === "text" && !isEditingText && elementRef.current) {
      const measureDiv = document.createElement("div");
      measureDiv.style.fontFamily =
        element.fontFamily || DEFAULT_TEXT_FONT_FAMILY;
      measureDiv.style.fontSize = `${element.fontSize || 16}px`;
      measureDiv.style.whiteSpace = "pre-wrap";
      measureDiv.style.padding = `${PADDING_AROUND_TEXT_PX}px`;
      measureDiv.style.boxSizing = "border-box";
      measureDiv.style.width = `${element.width}px`;

      measureDiv.style.visibility = "hidden";
      measureDiv.style.position = "absolute";
      measureDiv.style.left = "-9999px";
      measureDiv.style.top = "-9999px";

      measureDiv.textContent = element.content || "\u00A0"; // Use non-breaking space if content is empty

      document.body.appendChild(measureDiv);
      let newMeasuredHeight = measureDiv.offsetHeight;
      document.body.removeChild(measureDiv);

      newMeasuredHeight = Math.max(newMeasuredHeight, MIN_DIMENSION);

      if (Math.abs(newMeasuredHeight - element.height) > 1) {
        // Add a small tolerance
        updateElement(element.id, { height: newMeasuredHeight });
      }
    }
  }, [
    element.content,
    element.fontSize,
    element.fontFamily,
    element.width,
    element.type,
    isEditingText,
    updateElement,
    element.height,
  ]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(element.id);
  };

  const handleDoubleClick = () => {
    if (element.type === "text" && !isEditingText) {
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

  const handleTextEditKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextEditBlur();
    }
    if (e.key === "Escape") {
      setIsEditingText(false);
      setEditText(element.content); // Revert to original content
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingText) {
      handleDragMouseDown(e);
    }
    if (selectedElementId !== element.id && !isEditingText) {
      selectElement(element.id);
    } else if (isSelected && !isEditingText) {
      bringToFront(element.id);
    }
  };

  const handleElementTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isEditingText) {
      handleTouchStartDraggable(e);
    }
    if (selectedElementId !== element.id && !isEditingText) {
      selectElement(element.id);
    } else if (isSelected && !isEditingText) {
      bringToFront(element.id);
    }
  };

  const startResize = useCallback(
    (clientX: number, clientY: number, handleId: ResizeHandleType) => {
      setIsResizing(true);
      // const handleDetails = resizeHandleConfig.find(h => h.id === handleId); // No longer needed for cursor
      // document.body.style.cursor = handleDetails?.cursor || 'default'; // Removed custom body cursor

      resizeStartDataRef.current = {
        handleId,
        initialClientX: clientX,
        initialClientY: clientY,
        elementInitialX: element.x,
        elementInitialY: element.y,
        elementInitialWidth: element.width,
        elementInitialHeight: element.height,
      };
      if (selectedElementId !== element.id) {
        selectElement(element.id);
      } else {
        bringToFront(element.id);
      }
    },
    [element, selectElement, selectedElementId, bringToFront]
  );

  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent, handleId: ResizeHandleType) => {
      e.stopPropagation();
      startResize(e.clientX, e.clientY, handleId);
    },
    [startResize]
  );

  const handleTouchStartResize = useCallback(
    (e: React.TouchEvent, handleId: ResizeHandleType) => {
      if (e.touches.length === 1) {
        e.stopPropagation();
        startResize(e.touches[0].clientX, e.touches[0].clientY, handleId);
      }
    },
    [startResize]
  );

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !resizeStartDataRef.current) return;
      e.preventDefault();

      const {
        handleId,
        initialClientX,
        initialClientY,
        elementInitialX,
        elementInitialY,
        elementInitialWidth,
        elementInitialHeight,
      } = resizeStartDataRef.current;

      const currentClientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const currentClientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const dxScreen = currentClientX - initialClientX;
      const dyScreen = currentClientY - initialClientY;

      const dxWorld = dxScreen / zoom;
      const dyWorld = dyScreen / zoom;

      let newX = elementInitialX;
      let newY = elementInitialY;
      let newWidth = elementInitialWidth;
      let newHeight = elementInitialHeight;

      // Handle resizing logic based on which handle is dragged
      if (handleId.includes("l")) {
        newWidth = elementInitialWidth - dxWorld;
        newX = elementInitialX + dxWorld;
      } else if (handleId.includes("r")) {
        newWidth = elementInitialWidth + dxWorld;
      }

      if (handleId.includes("t")) {
        newHeight = elementInitialHeight - dyWorld;
        newY = elementInitialY + dyWorld;
      } else if (handleId.includes("b")) {
        newHeight = elementInitialHeight + dyWorld;
      }

      // Enforce minimum dimensions
      if (newWidth < MIN_DIMENSION) {
        if (handleId.includes("l")) {
          newX = elementInitialX + (elementInitialWidth - MIN_DIMENSION);
        }
        newWidth = MIN_DIMENSION;
      }
      if (newHeight < MIN_DIMENSION) {
        if (handleId.includes("t")) {
          newY = elementInitialY + (elementInitialHeight - MIN_DIMENSION);
        }
        newHeight = MIN_DIMENSION;
      }

      // Prevent position change if only height or width is being adjusted by middle handles
      if (handleId === "tm" || handleId === "bm") {
        // Top-middle or bottom-middle
        newX = elementInitialX;
        newWidth = elementInitialWidth;
      }
      if (handleId === "ml" || handleId === "mr") {
        // Middle-left or middle-right
        newY = elementInitialY;
        newHeight = elementInitialHeight;
      }

      updateElement(element.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    };

    const handleGlobalMouseUpOrTouchEnd = () => {
      if (isResizing) {
        setIsResizing(false);
        resizeStartDataRef.current = null;
        // document.body.style.cursor = 'default'; // Removed custom body cursor
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUpOrTouchEnd);
      document.addEventListener(
        "touchmove",
        handleGlobalMouseMove as EventListener,
        { passive: false }
      );
      document.addEventListener("touchend", handleGlobalMouseUpOrTouchEnd);
      document.addEventListener("touchcancel", handleGlobalMouseUpOrTouchEnd);
      document.body.style.userSelect = "none"; // Keep user-select prevention
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUpOrTouchEnd);
      document.removeEventListener(
        "touchmove",
        handleGlobalMouseMove as EventListener
      );
      document.removeEventListener("touchend", handleGlobalMouseUpOrTouchEnd);
      document.removeEventListener(
        "touchcancel",
        handleGlobalMouseUpOrTouchEnd
      );
      if (isResizing) {
        // Only reset if it was resizing
        // document.body.style.cursor = 'default'; // Removed custom body cursor
        document.body.style.userSelect = "";
      }
    };
  }, [isResizing, updateElement, element.id, zoom]);

  const renderContent = () => {
    switch (element.type) {
      case "image":
        return (
          <NextImage
            src={element.content}
            alt={element["data-ai-hint"] || "Canvas image"}
            width={element.width}
            height={element.height}
            className="object-contain pointer-events-none w-full h-full rounded-sm"
            data-ai-hint={
              (element["data-ai-hint"] as string) || "placeholder image"
            }
            draggable={false}
            priority={true} // Consider making this conditional if many images
          />
        );
      case "text":
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
                color: element.textColor || "hsl(var(--foreground))",
                fontFamily: element.fontFamily || DEFAULT_TEXT_FONT_FAMILY,
              }}
              onClick={(e) => e.stopPropagation()} // Prevent canvas click through
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
              onTouchStart={(e) => e.stopPropagation()} // Prevent touch drag start
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center justify-center p-1 break-words overflow-hidden whitespace-pre-wrap select-none" // Added select-none
            style={{
              fontSize: `${element.fontSize || 16}px`,
              color: element.textColor || "hsl(var(--foreground))",
              fontFamily: element.fontFamily || DEFAULT_TEXT_FONT_FAMILY,
            }}
          >
            {element.content}
          </div>
        );
      case "sticker":
        return (
          <div
            className="w-full h-full flex items-center justify-center pointer-events-none select-none" // Added select-none
            style={{ fontSize: `${element.stickerSize || 48}px` }}
          >
            {element.content}
          </div>
        );
      default:
        return null;
    }
  };

  const effectiveZIndex =
    isSelected && isResizing
      ? 1000
      : (element.zIndex || 0) + (isSelected ? 500 : 0);

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute select-none group",
        "flex items-center justify-center",
        "bg-card/70 backdrop-blur-sm rounded-md",
        isSelected
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl border-primary/50"
          : "shadow-md hover:shadow-lg border border-transparent hover:border-primary/30",
        element.type === "text" && !isEditingText && "hover:bg-accent/20"
        // Removed !isResizing && "cursor-grab"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: effectiveZIndex,
      }}
      onMouseDown={isResizing ? undefined : handleElementMouseDown}
      onTouchStart={isResizing ? undefined : handleElementTouchStart}
      onDoubleClick={
        element.type === "text" && !isEditingText && !isResizing
          ? handleDoubleClick
          : undefined
      }
      data-element-id={element.id}
      data-drag-handle={!isEditingText && !isResizing} // This attribute helps useDraggable differentiate
    >
      {renderContent()}
      {isSelected && !isEditingText && (
        <>
          <Button
            variant="default"
            size="icon"
            className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 p-1 shadow-lg opacity-0 group-hover:opacity-100 z-10"
            onClick={handleDelete}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag
            onTouchStart={(e) => e.stopPropagation()} // Prevent touch drag
            aria-label="Delete element"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
          {element.type === "text" && (
            <Button
              variant="default"
              size="icon"
              className="absolute -bottom-4 -right-4 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 p-1 shadow-lg opacity-0 group-hover:opacity-100 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleDoubleClick();
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag
              onTouchStart={(e) => e.stopPropagation()} // Prevent touch drag
              aria-label="Edit text"
            >
              <Edit3Icon className="h-4 w-4" />
            </Button>
          )}

          {resizeHandleConfig.map((handle) => (
            <div
              key={handle.id}
              className={cn(
                "absolute w-3 h-3 bg-background border border-primary rounded-sm",
                "opacity-0 group-hover:opacity-100", // Show handles on group hover (element hover)
                handle.classes
              )}
              style={{ zIndex: 5 }} // Removed specific cursor style
              onMouseDown={(e) => handleMouseDownResize(e, handle.id)}
              onTouchStart={(e) => handleTouchStartResize(e, handle.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}
