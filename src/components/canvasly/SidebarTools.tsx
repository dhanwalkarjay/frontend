
"use client"

import React, { useRef, useState, ChangeEvent } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import { ThemeToggle } from "./ThemeToggle"
import { useCanvas } from "@/contexts/CanvasContext"
import { ImageIcon, SmileIcon, TypeIcon, Trash2Icon, DownloadIcon, Settings2, RefreshCwIcon, SaveIcon, UploadCloudIcon, PanelLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CanvasElementData } from "@/types/canvas"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import html2canvas from 'html2canvas';

const STICKERS = ['🎨', '💡', '🚀', '🌟', '🧩', '🎉', '✨', '😀', '😍', '👍', '💯', '🔥', '❤️', '✅', '⚠️'];
const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, Times, serif', label: 'Times New Roman' },
  { value: 'Courier New, Courier, monospace', label: 'Courier New' },
  { value: 'Impact, Charcoal, sans-serif', label: 'Impact' },
  { value: 'Comic Sans MS, cursive, sans-serif', label: 'Comic Sans MS' },
];


export function SidebarTools() {
  const {
    elements,
    addElement,
    deleteElement,
    selectedElementId,
    updateElement,
    loadFromLocalStorage,
    clearBoard
  } = useCanvas();
  const { toast } = useToast();
  const { open, toggleSidebar, isMobile, state } = useSidebar(); // Added state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStickerPopoverOpen, setIsStickerPopoverOpen] = useState(false);

  const desktopExpanded = !isMobile && open;
  const desktopCollapsed = !isMobile && !open && state === 'collapsed'; // More specific for icon mode

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleAddImageElement = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addElement('image', { content: reader.result as string, 'data-ai-hint': file.name });
        toast({ title: "Image added", description: file.name });
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    }
  };

  const handleAddSticker = (sticker: string) => {
    addElement('sticker', { content: sticker });
    setIsStickerPopoverOpen(false);
    toast({ title: "Sticker added", description: sticker });
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
      toast({ title: "Element deleted" });
    }
  };

  const handleExport = async () => {
    toast({ title: "Preparing download..."});
    const canvasToExport = document.getElementById('canvas-viewport-for-export'); // Changed target ID
    if (canvasToExport) {
      try {
        const canvas = await html2canvas(canvasToExport, { // Use the new target
          useCORS: true,
          backgroundColor: null,
          scale: 2,
          logging: false,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'canvasly-board.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Download started!", description: "canvasly-board.png" });
      } catch (error) {
        console.error("Error exporting canvas: ", error);
        toast({ variant: "destructive", title: "Export failed", description: "Could not generate image." });
      }
    } else {
      toast({ variant: "destructive", title: "Export failed", description: "Canvas export target element not found." });
    }
  };

  const handleClearBoard = () => {
    clearBoard();
    toast({ title: "Board Cleared", description: "Loaded default elements."});
  }

  const handleUpdateTextColor = (color: string) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { textColor: color });
    }
  };

  const handleUpdateFontFamily = (font: string) => {
    if (selectedElementId) {
      updateElement(selectedElementId, { fontFamily: font });
    }
  };
   const handleUpdateFontSize = (size: string) => {
    if (selectedElementId) {
      const newSize = parseInt(size, 10);
      if (!isNaN(newSize) && newSize > 0) {
        updateElement(selectedElementId, { fontSize: newSize });
      }
    }
  };


  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Sidebar collapsible="icon" className="border-r shadow-md">
        <SidebarHeader
          className={cn(
            "p-4 items-center flex-row",
            (desktopExpanded || isMobile) ? "justify-between" : "justify-center"
          )}
        >
          {desktopCollapsed && !isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="h-8 w-8 hover:bg-transparent"
            >
              <Settings2 className="h-6 w-6 text-primary" />
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Settings2 className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">Canvasly Tools</h2>
            </div>
          )}
          { (desktopExpanded || isMobile) && <SidebarTrigger /> }
          {/* Ensure SidebarTrigger for mobile is always present if sidebar is sheet-like */}
          { isMobile && !open && <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden"><PanelLeft /></Button> }
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleAddImageElement} tooltip="Add Image from Device">
                <UploadCloudIcon />
                <span>Add Image</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
             <Popover open={isStickerPopoverOpen} onOpenChange={setIsStickerPopoverOpen}>
                <PopoverTrigger asChild>
                   <SidebarMenuButton tooltip="Add Sticker">
                    <SmileIcon />
                    <span>Add Sticker</span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" side="right" align="start">
                  <div className="grid grid-cols-5 gap-1">
                    {STICKERS.map(sticker => (
                      <Button
                        key={sticker}
                        variant="ghost"
                        size="icon"
                        className="text-2xl w-10 h-10"
                        onClick={() => handleAddSticker(sticker)}
                      >
                        {sticker}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => addElement('text')} tooltip="Add Text">
                <TypeIcon />
                <span>Add Text</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {selectedElement && selectedElement.type === 'text' && (
            <>
              <SidebarSeparator />
              <div className={cn("p-2 space-y-3", desktopCollapsed && "hidden")}>
                <h3 className="text-sm font-medium text-muted-foreground px-1">Text Properties</h3>
                <div className="space-y-2">
                  <Label htmlFor="text-color-picker" className="text-xs px-1">Color</Label>
                  <Input
                    id="text-color-picker"
                    type="color"
                    value={selectedElement.textColor?.startsWith('hsl') ? '#000000' : selectedElement.textColor || '#000000'} // Input type color expects hex
                    onChange={(e) => handleUpdateTextColor(e.target.value)}
                    className="h-8 w-full"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="font-family-select" className="text-xs px-1">Font</Label>
                  <Select
                    value={selectedElement.fontFamily || 'Arial, sans-serif'}
                    onValueChange={handleUpdateFontFamily}
                  >
                    <SelectTrigger id="font-family-select" className="h-8 text-xs">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(font => (
                        <SelectItem key={font.value} value={font.value} className="text-xs">
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="font-size-input" className="text-xs px-1">Size (px)</Label>
                  <Input
                    id="font-size-input"
                    type="number"
                    min="1"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => handleUpdateFontSize(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </>
          )}

        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="p-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleDeleteSelected}
                disabled={!selectedElementId}
                variant={selectedElementId ? "destructive" : "default"}
                tooltip="Delete Selected"
                className={!selectedElementId ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Trash2Icon />
                <span>Delete Selected</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={handleClearBoard} tooltip="Clear Board" variant="outline">
                <RefreshCwIcon />
                <span>Clear Board</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={loadFromLocalStorage} tooltip="Reload from Storage" variant="outline">
                <SaveIcon />
                <span>Reload Board</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleExport} tooltip="Download as PNG">
                <DownloadIcon />
                <span>Download</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="mt-2">
              <div className={cn("flex items-center gap-2", desktopCollapsed && "justify-center")}>
                <ThemeToggle className={cn(desktopCollapsed && "[&_button]:w-8 [&_button]:h-8")} />
                <span className={cn("text-sm", desktopCollapsed && "hidden")}>Toggle Theme</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
