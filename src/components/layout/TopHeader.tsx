"use client";

import React from "react";
import {
  DownloadIcon,
  HistoryIcon,
  PaletteIcon,
  SearchIcon,
  UsersIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/canvasly/ThemeToggle";
import type { useToast } from "@/hooks/use-toast"; // Import type
import html2canvas from "html2canvas";
import { useCanvas } from "@/contexts/CanvasContext";
import { motion } from "framer-motion";

interface TopHeaderProps {
  onExportSuccess?: () => void;
  toast: ReturnType<typeof useToast>["toast"];
}

export function TopHeader({ onExportSuccess, toast }: TopHeaderProps) {
  const { elements } = useCanvas();

  const handleExport = async () => {
    if (toast) {
      toast({ title: "Preparing download..." });
    }
    const canvasToExport = document.getElementById(
      "canvas-viewport-for-export"
    );
    if (canvasToExport) {
      try {
        const canvas = await html2canvas(canvasToExport, {
          useCORS: true,
          backgroundColor: null,
          scale: 2,
          logging: false,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const downloadFileName = "canvasly.png";
        link.href = image;
        link.download = downloadFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (toast) {
          toast({ title: "Download started!", description: downloadFileName });
        }
        onExportSuccess?.();
      } catch (error) {
        console.error("Error exporting canvas: ", error);
        if (toast) {
          toast({
            variant: "destructive",
            title: "Export failed",
            description: "Could not generate image.",
          });
        }
      }
    } else {
      if (toast) {
        toast({
          variant: "destructive",
          title: "Export failed",
          description: "Canvas export target element not found.",
        });
      }
    }
  };

  return (
    <header className="bg-card text-card-foreground p-2 border-b border-border shadow-sm flex items-center justify-between shrink-0 h-14 overflow-hidden">
      {" "}
      {/* Added overflow-hidden for animations */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExport}
          className="hover:bg-accent active:scale-95 transition-transform cursor-default"
        >
          <DownloadIcon className="h-5 w-5" />
          <span className="sr-only">Download</span>
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <motion.div
          className="overflow-hidden whitespace-nowrap"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="text-primary text-3xl font-['Comic_Sans_MS',_cursive]">
            Can
          </span>
          <span className="text-secondary text-3xl font-['Comic_Sans_MS',_cursive]">
            Vasly
          </span>
        </motion.div>
        <motion.div
          className="overflow-hidden"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "120px", opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
        >
          <svg
            width="120"
            height="10"
            viewBox="0 0 120 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-[-2px]"
          >
            <path
              d="M2 6 Q30 2, 60 7 T118 5"
              stroke="hsl(var(--foreground))"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </motion.div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle className="cursor-default" />
      </div>
    </header>
  );
}
