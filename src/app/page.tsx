"use client";

import { CanvasProvider } from "@/contexts/CanvasContext";
import { SidebarTools } from "@/components/canvasly/SidebarTools";
import { Canvas } from "@/components/canvasly/Canvas";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SmoothCursor } from "@/components/ui/newCursor";

export default function CanvasPage() {
  return (
    <>
      <SmoothCursor />
      <CanvasProvider>
        <SidebarProvider>
          <div className="flex h-screen w-full bg-background">
            <SidebarTools />
            <SidebarInset>
              <div className="flex-1 h-full relative overflow-hidden">
                <Canvas />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </CanvasProvider>
    </>
  );
}
