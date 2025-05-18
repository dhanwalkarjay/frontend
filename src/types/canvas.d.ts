export type ElementType = "image" | "text" | "sticker";

export interface CanvasElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  zIndex: number;
  content: string; // URL for image, text content for text, emoji for sticker

  // Text-specific properties
  fontSize?: number; // e.g., 16
  textColor?: string; // e.g., '#000000' or 'hsl(var(--foreground))'
  fontFamily?: string; // e.g., 'Arial', 'Verdana'

  // Sticker-specific properties (could be part of general styling)
  stickerSize?: number; // For font-size based stickers

  // For AI hint on images
  "data-ai-hint"?: string;

  // For controlling initial animation
  isNewlyAdded?: boolean;

  // For time-based placement
  placementTime?: number; // Unix timestamp
}
