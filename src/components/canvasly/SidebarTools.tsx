
"use client"

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
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./ThemeToggle"
import { useCanvas } from "@/contexts/CanvasContext"
import { ImageIcon, SmileIcon, TypeIcon, Trash2Icon, DownloadIcon, Settings2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { CanvasElementData } from "@/types/canvas"


export function SidebarTools() {
  const { addElement, deleteElement, selectedElementId } = useCanvas();
  const { toast } = useToast();

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
      <SidebarHeader className="p-4 items-center flex-row justify-between">
        <div className="flex items-center gap-2">
           <Settings2 className="h-6 w-6 text-primary" />
           <h2 className="font-semibold text-lg group-data-[collapsible=icon]:hidden">Canvasly Tools</h2>
        </div>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
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
             <div className="flex justify-center items-center group-data-[collapsible=icon]:justify-start group-data-[collapsible=icon]:pl-0.5">
                <ThemeToggle />
                <span className="ml-2 text-sm group-data-[collapsible=icon]:hidden">Toggle Theme</span>
             </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
