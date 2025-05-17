
"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger, // Standard trigger (PanelLeft)
  SidebarSeparator,
  useSidebar, // To get sidebar state
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { useCanvas } from "@/contexts/CanvasContext"
import { ImageIcon, SmileIcon, TypeIcon, Trash2Icon, DownloadIcon, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CanvasElementData } from "@/types/canvas"
import { Button } from "@/components/ui/button" // For the Settings2 trigger button
import { cn } from "@/lib/utils"

export function SidebarTools() {
  const { addElement, deleteElement, selectedElementId } = useCanvas();
  const { toast } = useToast();
  // `open` is true if desktop sidebar is expanded, false if collapsed (icon mode)
  // `isMobile` is true if on mobile viewport
  // `toggleSidebar` toggles desktop state or mobile sheet
  const { open, toggleSidebar, isMobile } = useSidebar();

  const desktopExpanded = !isMobile && open;
  const desktopCollapsed = !isMobile && !open;
  // Mobile state is handled by `isMobile` flag. `open` is relevant for desktop.

  const handleAddElement = (type: CanvasElementData['type']) => {
    let partialData: Partial<CanvasElementData> = {};
    if (type === 'image') {
      const imagePrompts = ["abstract nature", "geometric pattern", "city skyline", "minimalist landscape", "vibrant food"];
      const randomPrompt = imagePrompts[Math.floor(Math.random() * imagePrompts.length)];
      partialData = { content: `https://placehold.co/300x200.png`, 'data-ai-hint': randomPrompt };
    } else if (type === 'sticker') {
      const stickers = ['🎨', '💡', '🚀', '🌟', '🧩', '🎉', '✨'];
      partialData = { content: stickers[Math.floor(Math.random() * stickers.length)] };
    }
    addElement(type, partialData);
  };

  const handleDeleteSelected = () => {
    if (selectedElementId) {
      deleteElement(selectedElementId);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Canvas",
      description: "Canvas export to PNG is not yet implemented.",
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r shadow-md">
      <SidebarHeader 
        className={cn(
          "p-4 items-center flex-row",
          // If desktop & expanded OR on mobile: justify-between (for text and PanelLeft trigger)
          // If desktop & collapsed: justify-center (for Settings2 trigger)
          desktopExpanded || isMobile ? "justify-between" : "justify-center" 
        )}
      >
        {/* Left part: Settings2 icon and optional text, or Settings2 as button */}
        {desktopCollapsed ? (
          // Desktop Collapsed: Settings2 icon is the expand trigger
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="h-8 w-8" 
          >
            <Settings2 className="h-6 w-6 text-primary" />
          </Button>
        ) : (
          // Desktop Expanded OR Mobile: Settings2 icon + "Canvasly Tools" text
          <div className="flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            {/* Text is always shown here because this block is for desktop-expanded or mobile */}
            <h2 className="font-semibold text-lg">Canvasly Tools</h2>
          </div>
        )}

        {/* Right part: Original SidebarTrigger (PanelLeft icon) */}
        {/* Show if (desktop AND expanded to allow collapse) OR (on mobile, to control the sheet) */}
        { (desktopExpanded || isMobile) && <SidebarTrigger /> }
        
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => handleAddElement('image')} tooltip="Add Image">
              <ImageIcon />
              <span>Add Image</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => handleAddElement('sticker')} tooltip="Add Sticker">
              <SmileIcon />
              <span>Add Sticker</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => handleAddElement('text')} tooltip="Add Text">
              <TypeIcon />
              <span>Add Text</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
            <SidebarMenuButton onClick={handleExport} tooltip="Export Canvas">
              <DownloadIcon />
              <span>Export Canvas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem className="mt-2">
             <div className="flex items-center group-data-[collapsible=icon]:justify-center"> {/* Ensure wrapper div centers content in icon mode */}
                <ThemeToggle className="[&_button]:group-data-[collapsible=icon]:w-8 [&_button]:group-data-[collapsible=icon]:h-8" /> {/* Resize internal button in icon mode */}
                <span className="ml-2 text-sm group-data-[collapsible=icon]:hidden">Toggle Theme</span>
             </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
