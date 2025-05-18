"use client";

import type { CanvasElementData } from "@/types/canvas";
import { useCanvas } from "@/contexts/CanvasContext";
import React, { useRef, useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { useDraggable } from "@/hooks/useDraggable";
import { cn } from "@/lib/utils";
import { Trash2Icon, Edit3Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContainer, CardItem } from "@/components/ui/3d-card-effect";

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

const MIN_DIMENSION = 20;
const DEFAULT_TEXT_FONT_FAMILY = "Comic Sans MS, cursive, sans-serif";
const PADDING_AROUND_TEXT_PX = 0;

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
  const positionedElementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    elementRef: positionedElementRef,
    bounds: canvasBoundsRef,
    onDragStart: () => {
      if (isResizing) return;
      if (selectedElementId !== element.id) {
        selectElement(element.id);
      } else {
        bringToFront(element.id);
      }
    },
    onDragEnd: (x, y) => {
      if (isResizing) return;
      updateElement(element.id, { x, y });
    },
  });

  useEffect(() => {
    if (positionedElementRef.current && element.isNewlyAdded) {
      const el = positionedElementRef.current;
      el.classList.add("animate-bounce-fade-in");
      const timer = setTimeout(() => {
        if (el?.classList.contains("animate-bounce-fade-in")) {
          el.classList.remove("animate-bounce-fade-in");
        }
        if (element.isNewlyAdded) {
          updateElement(element.id, { isNewlyAdded: false });
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [element.isNewlyAdded, element.id, updateElement]);

  useEffect(() => {
    if (isEditingText && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    if (element.type === "text" && !isEditingText) {
      setIsEditingText(true);
      setEditText(element.content);
      if (selectedElementId !== element.id) {
        selectElement(element.id);
      }
    }
  };

  const handleTextEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleTextEditBlur = () => {
    setIsEditingText(false);
    updateElement(element.id, { content: editText });
  };

  const handleTextEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextEditBlur();
    }
    if (e.key === "Escape") {
      setIsEditingText(false);
      setEditText(element.content);
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditingText && !isResizing) {
      handleDragMouseDown(e);
    }
    if (selectedElementId !== element.id && !isEditingText) {
      selectElement(element.id);
    } else if (isSelected && !isEditingText && !isResizing) {
      bringToFront(element.id);
    }
  };

  const handleElementTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isEditingText && !isResizing) {
      handleTouchStartDraggable(e);
    }
    if (selectedElementId !== element.id && !isEditingText) {
      selectElement(element.id);
    } else if (isSelected && !isEditingText && !isResizing) {
      bringToFront(element.id);
    }
  };

  const startResize = useCallback(
    (clientX: number, clientY: number, handleId: ResizeHandleType) => {
      setIsResizing(true);
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

      const deltaX = (currentClientX - initialClientX) / zoom;
      const deltaY = (currentClientY - initialClientY) / zoom;

      let newX = elementInitialX;
      let newY = elementInitialY;
      let newWidth = elementInitialWidth;
      let newHeight = elementInitialHeight;

      if (handleId.includes("r"))
        newWidth = Math.max(MIN_DIMENSION, elementInitialWidth + deltaX);
      if (handleId.includes("l")) {
        const potentialNewWidth = elementInitialWidth - deltaX;
        newWidth = Math.max(MIN_DIMENSION, potentialNewWidth);
        newX = elementInitialX + (elementInitialWidth - newWidth);
      }
      if (handleId.includes("b"))
        newHeight = Math.max(MIN_DIMENSION, elementInitialHeight + deltaY);
      if (handleId.includes("t")) {
        const potentialNewHeight = elementInitialHeight - deltaY;
        newHeight = Math.max(MIN_DIMENSION, potentialNewHeight);
        newY = elementInitialY + (elementInitialHeight - newHeight);
      }
      if (handleId === "tm" || handleId === "bm") {
        newX = elementInitialX;
        newWidth = elementInitialWidth;
      }
      if (handleId === "ml" || handleId === "mr") {
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
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("touchmove", handleGlobalMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleGlobalMouseUpOrTouchEnd);
      document.addEventListener("touchend", handleGlobalMouseUpOrTouchEnd);
      document.addEventListener("touchcancel", handleGlobalMouseUpOrTouchEnd);
    }
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("touchmove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUpOrTouchEnd);
      document.removeEventListener("touchend", handleGlobalMouseUpOrTouchEnd);
      document.removeEventListener(
        "touchcancel",
        handleGlobalMouseUpOrTouchEnd
      );
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
            priority={true}
          />
        );
      case "text":
        if (isEditingText) {
          return (
            <Input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={handleTextEditChange}
              onBlur={handleTextEditBlur}
              onKeyDown={handleTextEditKeyDown}
              className="w-full h-full bg-transparent border-dashed border-primary/50 text-foreground p-0"
              style={{
                fontSize: `${element.fontSize || 16}px`,
                color: element.textColor || "hsl(var(--foreground))",
                fontFamily: element.fontFamily || DEFAULT_TEXT_FONT_FAMILY,
                backgroundColor: "transparent",
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center justify-center break-words overflow-hidden whitespace-pre-wrap select-none p-0"
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

  const effectiveZIndex =
    isSelected && isResizing
      ? 1000
      : (element.zIndex || 0) + (isSelected ? 500 : 0);

  return (
    <div
      ref={positionedElementRef}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: effectiveZIndex,
        position: "absolute",
      }}
      onMouseDown={isResizing ? undefined : handleElementMouseDown}
      onTouchStart={isResizing ? undefined : handleElementTouchStart}
      onDoubleClick={
        element.type === "text" && !isEditingText && !isResizing
          ? handleDoubleClick
          : undefined
      }
      data-element-id={element.id}
      data-drag-handle={!isEditingText && !isResizing}
      className="group"
    >
      <CardContainer
        containerClassName="w-full h-full"
        className={cn(
          "w-full h-full flex items-center justify-center select-none",
          !element.backgroundColor && "bg-card",
          "backdrop-blur-sm rounded-md",
          isSelected
            ? isEditingText
              ? "shadow-xl"
              : isResizing
              ? "shadow-xl border border-primary/50"
              : "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-xl border-primary/50"
            : "shadow-md hover:shadow-lg border border-transparent hover:border-primary/30",
          element.type === "text" && !isEditingText && "hover:bg-accent/20"
        )}
      >
        <CardItem
          className="w-full h-full flex items-center justify-center"
          translateZ={element.type === "image" ? 50 : 30}
          style={{
            ...(element.backgroundColor && {
              backgroundColor: element.backgroundColor,
            }),
            pointerEvents:
              element.type === "text" && !isEditingText ? "none" : "auto",
          }}
        >
          {renderContent()}
        </CardItem>

        {isSelected && !isEditingText && (
          <>
            <CardItem
              className="!absolute -top-4 -right-4 z-10"
              translateZ={20}
            >
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 p-1 shadow-lg opacity-0 group-hover:opacity-100"
                onClick={handleDelete}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Delete element"
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </CardItem>

            {element.type === "text" && (
              <CardItem
                className="!absolute -bottom-4 -right-4 z-10"
                translateZ={20}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 p-1 shadow-lg opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDoubleClick();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  aria-label="Edit text"
                >
                  <Edit3Icon className="h-4 w-4" />
                </Button>
              </CardItem>
            )}

            {resizeHandleConfig.map((handle) => (
              <CardItem
                key={handle.id}
                className={cn("!absolute", handle.classes)}
                style={{ zIndex: 5 }}
                translateZ={15}
              >
                <div
                  className={cn(
                    "w-3 h-3 bg-background border border-primary rounded-sm",
                    "opacity-0 group-hover:opacity-100"
                  )}
                  onMouseDown={(e) => handleMouseDownResize(e, handle.id)}
                  onTouchStart={(e) => handleTouchStartResize(e, handle.id)}
                />
              </CardItem>
            ))}
          </>
        )}
      </CardContainer>
    </div>
  );
}
