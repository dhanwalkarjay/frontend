
"use client"

import { CanvasProvider } from "@/contexts/CanvasContext";
import { SidebarTools } from "@/components/canvasly/SidebarTools";
import { Canvas } from "@/components/canvasly/Canvas";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"; 

export default function CanvaslyPage() {
  return (
    <CanvasProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full bg-background overflow-hidden"> {/* Prevent body scroll */}
          <SidebarTools />
          <SidebarInset className="flex-1 overflow-hidden flex flex-col"> {/* Ensure SidebarInset controls its own scroll if needed */}
            {/* Canvas will be flex-1 if SidebarInset needs more children, or just fill it */}
            <Canvas /> 
          </SidebarInset>
        </div>
      </SidebarProvider>
    </CanvasProvider>
  );
}

