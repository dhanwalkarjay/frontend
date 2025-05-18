"use client";

import { CanvasProvider, useCanvas } from "@/contexts/CanvasContext";
import { Canvas } from "@/components/canvasly/Canvas";
import React, { useRef, ChangeEvent, useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { ContextualToolbar } from "@/components/layout/ContextualToolbar";
import { useToast } from "@/hooks/use-toast";
import AnimatedPaperPlane from "@/components/ui/AnimatedPaperPlane";
import { FloatingDock, type DockItem } from "@/components/ui/FloatingDock";
import {
  ImageIcon,
  SmileIcon,
  TypeIcon,
  MousePointer2Icon,
  RefreshCwIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button"; // For sticker popover button
import { ScrollArea } from "@/components/ui/scroll-area"; // For sticker popover

const STICKERS = [
  // Travel & Places
  "✈️",
  "🗺️",
  "🌍",
  "📍",
  "⛰️",
  "🏕️",
  "🏖️",
  "☀️",
  "🚗",
  "🎒",
  "📸",
  "🛂",
  "🎟️",
  "🗽",
  "🗼",
  "🏰",
  "🏯",
  "🏟️",
  "🎡",
  "🎢",
  "🚢",
  "⛵",
  "🚤",
  "🚂",
  "🚄",
  "🚅",
  " मेट्रो",
  " स्टेशन",
  "⛽",
  "🚦",
  "🚧",
  // Nature & Animals
  "🌲",
  "🌳",
  "🌴",
  "🌵",
  "🌷",
  "🌸",
  "🌹",
  "🌺",
  "🌻",
  "🌼",
  "🌿",
  "🍀",
  "🍁",
  "🍂",
  "🍃",
  "🍄",
  "🌰",
  "🐚",
  "🌊",
  "🌬️",
  "🌀",
  "🌈",
  "🌕",
  "🌖",
  "🌗",
  "🌘",
  "🌑",
  "🌒",
  "🌓",
  "🌔",
  "⭐",
  "🌟",
  "🌠",
  "🐅",
  "🐆",
  "🦓",
  "🦍",
  "🐘",
  "🦏",
  "🐪",
  "🦒",
  "🦘",
  "🐃",
  "🐂",
  "🐄",
  "🐎",
  "🐖",
  "🐏",
  "🐑",
  "🐐",
  "🦌",
  "🐕",
  "🐩",
  "🦮",
  "🐕‍🦺",
  "🐈",
  "🐓",
  "🦃",
  "🦚",
  "🦜",
  "🦢",
  "🦩",
  "🕊️",
  "🐇",
  "🦝",
  "🦨",
  "🦦",
  "🦥",
  "🐁",
  "🐀",
  "🐿️",
  "🦋",
  "🐛",
  "🐜",
  "🐝",
  "🐞",
  "🦗",
  "🕷️",
  "🦂",
  "🦟",
  "🦠",
  // Food & Drink
  "🍏",
  "🍎",
  "🍐",
  "🍊",
  "🍋",
  "🍌",
  "🍉",
  "🍇",
  "🍓",
  "🍈",
  "🍒",
  "🍑",
  "🥭",
  "🍍",
  "🥥",
  "🥝",
  "🍅",
  "🍆",
  "🥑",
  "🥦",
  "🥬",
  "🥒",
  "🌶️",
  "🌽",
  "🥕",
  "🧄",
  "🧅",
  "🥔",
  "🍠",
  "🥐",
  "🥯",
  "🍞",
  "🥖",
  "🥨",
  "🧀",
  "🥚",
  "🍳",
  "🧈",
  "🥞",
  "🧇",
  "🥓",
  "🥩",
  "🍗",
  "🍖",
  "🦴",
  "핫도그",
  "🍔",
  "🍟",
  "🍕",
  "🥪",
  "🥙",
  "🧆",
  "🌮",
  "🌯",
  "🥗",
  "🥘",
  "🥫",
  "🍝",
  "🍜",
  "🍲",
  "🍛",
  "🍣",
  "🍱",
  "🥟",
  "🍢",
  "🍙",
  "🍚",
  "🍘",
  "🍥",
  "🥠",
  "🥮",
  "🍧",
  "🍨",
  "🍦",
  "🥧",
  "🧁",
  "🍰",
  "🎂",
  "🍮",
  "🍭",
  "🍬",
  "🍫",
  "🍿",
  "🍩",
  "🍪",
  "🥜",
  "🍯",
  "🥛",
  "🍼",
  "☕",
  "🍵",
  "🧃",
  "🥤",
  "🍶",
  "🍺",
  "🍻",
  "🥂",
  "🍷",
  "🥃",
  "🍸",
  "🍹",
  "🧉",
  "🧊",
  // Objects & Symbols
  "❤️",
  "💔",
  "💌",
  "💣",
  "🔥",
  "✨",
  "💫",
  "💯",
  "🎉",
  "🎊",
  "🎈",
  "🎁",
  "🎀",
  "👑",
  "💎",
  "💡",
  "💰",
  "💻",
  "📱",
  "☎️",
  "⏰",
  "⏳",
  "🔑",
  "🔒",
  "🔓",
  "⚙️",
  "🛠️",
  "⚖️",
  "🔗",
  "🏳️",
  "🏴",
  "🏁",
  "🚩",
  "🎌",
  "🏳️‍🌈",
  // Smileys & People (a few examples)
  "😀",
  "😂",
  "😍",
  "🤔",
  "😎",
  "😭",
  "🥳",
  "🤩",
  "👍",
  "🙏",
  "👋",
  "🙌",
  "👀",
  "🗣️",
  "👤",
  "👥",
];

function CanvasPageContent() {
  const { toast } = useToast();
  const { addElement, clearBoard, selectElement } = useCanvas();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStickerPopoverOpen, setIsStickerPopoverOpen] = useState(false);

  const handleAddImageElement = () => {
    selectElement(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addElement("image", {
          content: reader.result as string,
          "data-ai-hint": file.name.split(".")[0],
        });
        toast({ title: "Image added", description: file.name });
      };
      reader.readAsDataURL(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddStickerElement = (sticker: string) => {
    selectElement(null);
    addElement("sticker", { content: sticker });
    setIsStickerPopoverOpen(false);
    toast({ title: "Sticker added", description: sticker });
  };

  const handleAddTextElement = () => {
    selectElement(null);
    addElement("text");
    toast({ title: "Text element added" });
  };

  const handleClearBoard = () => {
    clearBoard();
    toast({ title: "Board Cleared", description: "Canvas has been reset." });
  };

  const handleSelectTool = () => {
    selectElement(null);
  };

  const dockItems: DockItem[] = [
    {
      title: "Select Tool",
      icon: <MousePointer2Icon className="w-full h-full" />,
      onClick: handleSelectTool,
    },
    {
      title: "Add Image",
      icon: <ImageIcon className="w-full h-full" />,
      onClick: handleAddImageElement,
    },
    {
      title: "Add Sticker",
      icon: <SmileIcon className="w-full h-full" />,
      component: (
        <Popover
          open={isStickerPopoverOpen}
          onOpenChange={setIsStickerPopoverOpen}
        >
          <PopoverTrigger asChild>
            <button
              title="Add Sticker"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground border border-transparent p-2 md:p-0"
              onClick={() => setIsStickerPopoverOpen((prev) => !prev)} // Ensure mobile click toggles
            >
              <SmileIcon className="w-full h-full" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-2 mb-2"
            side="top"
            align="center"
            style={{ maxWidth: "320px", zIndex: 70 }} // Ensure popover is above dock
          >
            <ScrollArea className="h-60">
              <div className="grid grid-cols-7 gap-1 p-1">
                {STICKERS.map((sticker) => (
                  <Button
                    key={sticker}
                    variant="ghost"
                    size="icon"
                    className="text-2xl w-10 h-10 hover:bg-accent active:scale-95 transition-transform cursor-default"
                    onClick={() => handleAddStickerElement(sticker)}
                  >
                    {sticker}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      ),
    },
    {
      title: "Add Text",
      icon: <TypeIcon className="w-full h-full" />,
      onClick: handleAddTextElement,
    },
    {
      title: "Clear Board",
      icon: <RefreshCwIcon className="w-full h-full" />,
      onClick: handleClearBoard,
    },
  ];

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
        <TopHeader toast={toast} />
        <main className="flex-1 relative overflow-hidden">
          <Canvas />
        </main>
        <FloatingDock items={dockItems} />
        <ContextualToolbar />
        <AnimatedPaperPlane />
      </div>
    </>
  );
}

export default function CanvasPage() {
  return (
    <CanvasProvider>
      <CanvasPageContent />
    </CanvasProvider>
  );
}
