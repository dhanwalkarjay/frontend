"use client";

import React from "react";
import { useCanvas } from "@/contexts/CanvasContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrushIcon,
  PaletteIcon,
  TextCursorInputIcon,
  CaseSensitiveIcon,
  EraserIcon,
  RulerIcon,
  RefreshCcwIcon,
  GripVerticalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const FONT_OPTIONS = [
  { label: "Trip Font (Default)", value: "Comic Sans MS, cursive, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif" },
  { label: "Courier New", value: "Courier New, Courier, monospace" },
  { label: "Brush Script MT", value: "Brush Script MT, cursive" },
  { label: "Impact", value: "Impact, Charcoal, sans-serif" },
];
const DEFAULT_TEXT_COLOR = "hsl(var(--foreground))";
const DEFAULT_ELEMENT_BG = "";

export function ContextualToolbar() {
  const { selectedElementId, elements, updateElement } = useCanvas(); // Changed: elements directly, no pages or activePageId

  const selectedElement = elements.find((el) => el.id === selectedElementId);

  if (!selectedElement) {
    return null;
  }

  const handleUpdate = (property: string, value: any) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { [property]: value });
    }
  };

  const handleResetBackgroundColor = () => {
    if (selectedElementId) {
      updateElement(selectedElementId, { backgroundColor: DEFAULT_ELEMENT_BG });
    }
  };

  const currentTextColor = selectedElement.textColor || DEFAULT_TEXT_COLOR;
  const currentBackgroundColor =
    selectedElement.backgroundColor || DEFAULT_ELEMENT_BG;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragControls={undefined}
      className={cn(
        "bg-card text-card-foreground p-3 rounded-lg shadow-xl border border-border",
        "flex flex-col gap-4 w-60 max-h-[calc(100vh-8rem)] overflow-y-auto z-50 cursor-default"
      )}
      style={{
        position: "fixed",
        top: "50%",
        left: "1rem",
        transform: "translateY(-50%)",
      }}
    >
      <div
        className="flex items-center justify-between pb-2 mb-1 border-b cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-medium text-muted-foreground">
          Customize Element
        </h3>
        <GripVerticalIcon className="w-4 h-4 text-muted-foreground/50" />
      </div>

      {/* Element Background Color - Common for all types */}
      <div className="space-y-1.5">
        <Label
          htmlFor="element-bg-color"
          className="text-xs flex items-center gap-1.5"
        >
          <PaletteIcon className="h-3.5 w-3.5" /> Element Background
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="element-bg-color"
            type="color"
            value={
              currentBackgroundColor.startsWith("hsl")
                ? "#ffffff"
                : currentBackgroundColor || "#ffffff"
            }
            onChange={(e) => handleUpdate("backgroundColor", e.target.value)}
            className="h-8 w-full p-1"
            aria-label="Element background color"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetBackgroundColor}
            className="h-8 w-8 hover:bg-accent cursor-default"
            title="Reset background color"
            disabled={!selectedElement.backgroundColor}
          >
            <EraserIcon className="h-4 w-4" />
          </Button>
        </div>
        {currentBackgroundColor.startsWith("hsl") && (
          <p className="text-xs text-muted-foreground">Using theme default</p>
        )}
      </div>

      {selectedElement.type === "text" && (
        <>
          <div className="h-px bg-border my-1"></div>
          <div className="space-y-1.5">
            <Label
              htmlFor="text-color"
              className="text-xs flex items-center gap-1.5"
            >
              <BrushIcon className="h-3.5 w-3.5" /> Text Color
            </Label>
            <Input
              id="text-color"
              type="color"
              value={
                currentTextColor.startsWith("hsl")
                  ? "#000000"
                  : currentTextColor
              }
              onChange={(e) => handleUpdate("textColor", e.target.value)}
              className="h-8 w-full p-1"
              aria-label="Text color"
            />
            {currentTextColor.startsWith("hsl") && (
              <p className="text-xs text-muted-foreground">
                Using theme default
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="font-family"
              className="text-xs flex items-center gap-1.5"
            >
              <TextCursorInputIcon className="h-3.5 w-3.5" /> Font Family
            </Label>
            <Select
              value={selectedElement.fontFamily || FONT_OPTIONS[0].value}
              onValueChange={(value) => handleUpdate("fontFamily", value)}
            >
              <SelectTrigger
                id="font-family"
                className="h-8 text-xs cursor-default"
              >
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent className="cursor-default">
                {FONT_OPTIONS.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    className="text-xs cursor-default"
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="font-size"
              className="text-xs flex items-center gap-1.5"
            >
              <CaseSensitiveIcon className="h-3.5 w-3.5" /> Font Size (px)
            </Label>
            <Input
              id="font-size"
              type="number"
              min="8"
              max="128"
              value={selectedElement.fontSize || 20}
              onChange={(e) =>
                handleUpdate("fontSize", parseInt(e.target.value, 10))
              }
              className="h-8 text-xs"
              aria-label="Font size"
            />
          </div>
        </>
      )}

      {selectedElement.type === "sticker" && (
        <>
          <div className="h-px bg-border my-1"></div>
          <div className="space-y-1.5">
            <Label
              htmlFor="sticker-size"
              className="text-xs flex items-center gap-1.5"
            >
              <RulerIcon className="h-3.5 w-3.5" /> Sticker Size
            </Label>
            <Input
              id="sticker-size"
              type="number"
              min="12"
              max="256"
              value={selectedElement.stickerSize || 48}
              onChange={(e) =>
                handleUpdate("stickerSize", parseInt(e.target.value, 10))
              }
              className="h-8 text-xs"
              aria-label="Sticker size"
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
