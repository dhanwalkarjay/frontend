"use client";

import type { CanvasElementData, ElementType } from "@/types/canvas";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";

const generateRobustId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);
const LOCAL_STORAGE_KEY = "tripBoard_v2_singleBoard"; // Updated key for clarity
const NEW_DEFAULT_FONT = "Comic Sans MS, cursive, sans-serif";
const OLD_DEFAULT_FONT_PATTERNS = ["Arial", "Arial, sans-serif"];

interface CanvasContextType {
  elements: CanvasElementData[];
  selectedElementId: string | null;
  zoom: number;
  panOffset: { x: number; y: number };

  // Element actions
  addElement: (
    type: CanvasElementData["type"],
    partialData?: Partial<CanvasElementData>
  ) => string | null;
  updateElement: (
    elementId: string,
    updates: Partial<CanvasElementData>
  ) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (elementId: string | null) => void;
  bringToFront: (elementId: string) => void;

  setZoom: (zoomLevel: number | ((prevZoom: number) => number)) => void;
  setPanOffset: (
    offset:
      | { x: number; y: number }
      | ((prevOffset: { x: number; y: number }) => { x: number; y: number })
  ) => void;

  loadFromLocalStorage: () => void;
  clearBoard: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

const createDefaultElements = (): CanvasElementData[] => [
  {
    id: generateRobustId(),
    type: "text",
    content: "Welcome to TripBoard!",
    x: 50,
    y: 50,
    width: 350,
    height: 50,
    rotation: 0,
    zIndex: 1,
    fontSize: 24,
    textColor: "hsl(var(--foreground))",
    fontFamily: NEW_DEFAULT_FONT,
    isNewlyAdded: true,
    placementTime: Date.now() - 10000,
  },
];

interface StoredCanvasState {
  elements: CanvasElementData[];
  zoom: number;
  panOffset: { x: number; y: number };
  selectedElementId?: string | null;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [elements, setElements] = useState<CanvasElementData[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [zoom, setZoomState] = useState<number>(1);
  const [panOffset, setPanOffsetState] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
          const parsedState: StoredCanvasState = JSON.parse(savedState);
          if (
            parsedState.elements &&
            Array.isArray(parsedState.elements) &&
            typeof parsedState.zoom === "number" &&
            parsedState.panOffset
          ) {
            const loadedElements = parsedState.elements.map((el) => {
              let fontFamily = el.fontFamily;
              if (el.type === "text") {
                if (
                  !fontFamily ||
                  OLD_DEFAULT_FONT_PATTERNS.includes(fontFamily)
                ) {
                  fontFamily = NEW_DEFAULT_FONT;
                }
              }
              return {
                ...el,
                fontFamily: fontFamily,
                textColor: el.textColor || "hsl(var(--foreground))",
                isNewlyAdded: false,
                placementTime: el.placementTime || Date.now(),
                backgroundColor: el.backgroundColor,
              };
            });
            setElements(loadedElements);
            setZoomState(parsedState.zoom);
            setPanOffsetState(parsedState.panOffset);
            setSelectedElementId(parsedState.selectedElementId || null);
          } else {
            setElements(createDefaultElements());
          }
        } else {
          setElements(createDefaultElements());
        }
      } catch (error) {
        console.error("Failed to load canvas state from localStorage:", error);
        setElements(createDefaultElements());
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      try {
        const stateToSave: StoredCanvasState = {
          elements,
          zoom,
          panOffset,
          selectedElementId,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save canvas state to localStorage:", error);
      }
    }
  }, [elements, zoom, panOffset, selectedElementId, isLoaded]);

  const getHighestZIndex = useCallback(() => {
    return elements.reduce((maxZ, el) => Math.max(maxZ, el.zIndex || 0), 0);
  }, [elements]);

  const addElement = useCallback(
    (
      type: CanvasElementData["type"],
      partialData?: Partial<CanvasElementData>
    ) => {
      const newZIndex = getHighestZIndex() + 1;
      const newId = generateRobustId();

      const viewportCenterX =
        typeof window !== "undefined" ? window.innerWidth / 2 : 400;
      const viewportCenterY =
        typeof window !== "undefined" ? window.innerHeight / 2 : 300;

      const initialWidth = partialData?.width || (type === "image" ? 200 : 150);
      const initialHeight =
        partialData?.height ||
        (type === "text" ? 40 : type === "sticker" ? 60 : 150);

      const initialX =
        (viewportCenterX - panOffset.x - initialWidth / 2) / zoom;
      const initialY =
        (viewportCenterY - panOffset.y - initialHeight / 2) / zoom;

      const newElementBase: Omit<
        CanvasElementData,
        | "content"
        | "width"
        | "height"
        | "type"
        | "fontFamily"
        | "textColor"
        | "fontSize"
        | "stickerSize"
        | "data-ai-hint"
        | "placementTime"
        | "backgroundColor"
      > & { type: ElementType; isNewlyAdded: boolean } = {
        id: newId,
        type,
        x: initialX,
        y: initialY,
        rotation: 0,
        zIndex: newZIndex,
        isNewlyAdded: true,
      };

      let newElement: CanvasElementData;
      const currentTime = Date.now();

      switch (type) {
        case "text":
          newElement = {
            ...newElementBase,
            type: "text",
            content: "New Journey Entry",
            width: 150,
            height: 40,
            fontSize: 20,
            textColor: "hsl(var(--foreground))",
            fontFamily: NEW_DEFAULT_FONT,
            placementTime: currentTime,
            ...partialData,
          };
          break;
        case "image":
          newElement = {
            ...newElementBase,
            type: "image",
            content: "https://placehold.co/200x150.png",
            width: 200,
            height: 150,
            "data-ai-hint": "travel photo",
            placementTime: currentTime,
            ...partialData,
          };
          break;
        case "sticker":
          newElement = {
            ...newElementBase,
            type: "sticker",
            content: "✈️",
            width: 60,
            height: 60,
            stickerSize: 48,
            placementTime: currentTime,
            ...partialData,
          };
          break;
        default:
          throw new Error("Unknown element type");
      }

      setElements((prev) => [...prev, newElement]);
      setSelectedElementId(newElement.id);
      return newId;
    },
    [getHighestZIndex, panOffset, zoom, elements]
  );

  const updateElement = useCallback(
    (elementId: string, updates: Partial<CanvasElementData>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
      );
    },
    []
  );

  const deleteElement = useCallback(
    (elementId: string) => {
      setElements((prev) => prev.filter((el) => el.id !== elementId));
      if (selectedElementId === elementId) {
        setSelectedElementId(null);
      }
    },
    [selectedElementId]
  );

  const bringToFront = useCallback(
    (elementId: string) => {
      const currentElement = elements.find((el) => el.id === elementId);
      if (!currentElement) return;

      const highestZIndexOnBoard = getHighestZIndex();

      if (
        currentElement.zIndex <= highestZIndexOnBoard ||
        elements.length === 1
      ) {
        setElements((prevElements) =>
          prevElements
            .map((el) => {
              if (el.id === elementId) {
                return { ...el, zIndex: highestZIndexOnBoard + 1 };
              }
              return el;
            })
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        );
      }
    },
    [elements, getHighestZIndex]
  );

  const selectElement = useCallback(
    (id: string | null) => {
      setSelectedElementId(id);
      if (id) {
        bringToFront(id);
      }
    },
    [bringToFront]
  );

  const setZoomCb = useCallback(
    (zoomLevel: number | ((prevZoom: number) => number)) => {
      setZoomState(zoomLevel);
    },
    []
  );

  const setPanOffsetCb = useCallback(
    (
      offset:
        | { x: number; y: number }
        | ((prevOffset: { x: number; y: number }) => { x: number; y: number })
    ) => {
      setPanOffsetState(offset);
    },
    []
  );

  const clearBoard = useCallback(() => {
    setElements(createDefaultElements());
    setZoomState(1);
    setPanOffsetState({ x: 0, y: 0 });
    setSelectedElementId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        elements,
        selectedElementId,
        zoom,
        panOffset,
        addElement,
        updateElement,
        deleteElement,
        selectElement,
        bringToFront,
        setZoom: setZoomCb,
        setPanOffset: setPanOffsetCb,
        loadFromLocalStorage,
        clearBoard,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
