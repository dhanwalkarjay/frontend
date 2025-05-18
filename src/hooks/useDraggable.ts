"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import { useCanvas } from "@/contexts/CanvasContext";

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

  const processDragStart = (
    clientX: number,
    clientY: number,
    event?: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>
  ) => {
    const target = event?.target as HTMLElement;

    // Check if the target or its parent is explicitly marked as not draggable or is an interactive element like textarea/input
    let currentTarget: HTMLElement | null = target;
    while (
      currentTarget &&
      currentTarget !== elementRef.current?.parentElement
    ) {
      if (
        currentTarget.getAttribute("data-drag-handle") === "false" ||
        (["TEXTAREA", "INPUT", "BUTTON", "A"].includes(
          currentTarget.nodeName
        ) &&
          !currentTarget.closest('[data-drag-handle="true"]'))
      ) {
        // Allow drag if a button IS the handle
        return false;
      }
      if (currentTarget === elementRef.current) break; // Reached the draggable element itself
      currentTarget = currentTarget.parentElement;
    }

    if (
      event &&
      "preventDefault" in event &&
      (event.target as HTMLElement).getAttribute("data-drag-handle") !== "false"
    ) {
      // Only preventDefault if we are sure we're starting a drag.
      // This helps with text selection and double-click issues if the target is not meant to be dragged.
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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (e.button !== 0) return; // Only main button
      const target = e.target as HTMLElement;
      // If the click is on a resize handle or an explicit non-drag area, don't start drag
      if (
        target.closest(
          '[style*="cursor: nwse-resize"], [style*="cursor: ns-resize"], [style*="cursor: nesw-resize"], [style*="cursor: ew-resize"]'
        ) ||
        target.getAttribute("data-drag-handle") === "false" ||
        target.nodeName === "TEXTAREA"
      ) {
        return;
      }
      processDragStart(e.clientX, e.clientY, e);
    },
    [position.x, position.y, onDragStart, elementRef, zoom, panOffset]
  );

  const handleTouchStartDraggable = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (e.touches.length === 1) {
        const target = e.target as HTMLElement;
        if (
          target.closest(
            '[style*="cursor: nwse-resize"], [style*="cursor: ns-resize"], [style*="cursor: nesw-resize"], [style*="cursor: ew-resize"]'
          ) ||
          target.getAttribute("data-drag-handle") === "false" ||
          target.nodeName === "TEXTAREA"
        ) {
          return;
        }
        if (processDragStart(e.touches[0].clientX, e.touches[0].clientY, e)) {
          // e.preventDefault() called inside processDragMove if necessary
        }
      }
    },
    [position.x, position.y, onDragStart, elementRef, zoom, panOffset]
  );

  const processDragMove = (
    clientX: number,
    clientY: number,
    event?: MouseEvent | TouchEvent
  ) => {
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

      const minWorldX = -panOffset.x / zoom;
      const minWorldY = -panOffset.y / zoom;
      const maxWorldX = (boundsRect.width - panOffset.x) / zoom - elementWidth;
      const maxWorldY =
        (boundsRect.height - panOffset.y) / zoom - elementHeight;

      newWorldX = Math.max(minWorldX, Math.min(maxWorldX, newWorldX));
      newWorldY = Math.max(minWorldY, Math.min(maxWorldY, newWorldY));
    }

    setPosition({ x: newWorldX, y: newWorldY });
    onDrag?.(newWorldX, newWorldY);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      processDragMove(e.clientX, e.clientY, e);
    },
    [isDragging, dragOrigin, zoom, panOffset, bounds, elementRef, onDrag]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 1) {
        processDragMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    },
    [isDragging, dragOrigin, zoom, panOffset, bounds, elementRef, onDrag]
  );

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
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
      document.body.style.userSelect = "none";
      // document.body.style.cursor = 'grabbing'; // Removed
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      document.body.style.userSelect = "";
      // document.body.style.cursor = ''; // Removed
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      document.body.style.userSelect = "";
      // document.body.style.cursor = ''; // Removed
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  useEffect(() => {
    if (!isDragging) {
      setPosition({ x: initialX, y: initialY });
    }
  }, [initialX, initialY, isDragging]);

  return {
    position,
    isDragging,
    handleMouseDown,
    handleTouchStartDraggable,
    setPosition,
  };
}
