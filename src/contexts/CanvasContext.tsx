
"use client"

import type { CanvasElementData } from '@/types/canvas';
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

const generateRobustId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
const LOCAL_STORAGE_KEY = 'canvaslyBoard_v1';

interface CanvasContextType {
  elements: CanvasElementData[];
  selectedElementId: string | null;
  zoom: number;
  panOffset: { x: number; y: number };
  addElement: (type: CanvasElementData['type'], partialData?: Partial<CanvasElementData>) => string;
  updateElement: (id: string, updates: Partial<CanvasElementData>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  bringToFront: (id: string) => void;
  setZoom: (zoomLevel: number | ((prevZoom: number) => number)) => void;
  setPanOffset: (offset: { x: number; y: number } | ((prevOffset: { x: number; y: number }) => { x: number; y: number })) => void;
  loadFromLocalStorage: () => void;
  clearBoard: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

const defaultInitialElements: CanvasElementData[] = [
  { 
    id: generateRobustId(), type: 'text', content: 'Welcome to Canvasly!', 
    x: 50, y: 50, width: 250, height: 50, rotation: 0, zIndex: 1, 
    fontSize: 24, textColor: 'hsl(var(--foreground))', fontFamily: 'Arial',
    isNewlyAdded: true,
  },
  { 
    id: generateRobustId(), type: 'image', content: 'https://placehold.co/300x200.png', 
    x: 150, y: 150, width: 300, height: 200, rotation: 0, zIndex: 2,
    'data-ai-hint': 'abstract design',
    isNewlyAdded: true,
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoomState] = useState<number>(1);
  const [panOffset, setPanOffsetState] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);


  const loadFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
          const parsedState: StoredCanvasState = JSON.parse(savedState);
          if (parsedState.elements && typeof parsedState.zoom === 'number' && parsedState.panOffset) {
            setElements(parsedState.elements.map(el => ({
              ...el,
              fontFamily: el.fontFamily || 'Arial', 
              textColor: el.textColor || 'hsl(var(--foreground))',
              isNewlyAdded: false, // Mark loaded elements as not newly added
            })));
            setZoomState(parsedState.zoom);
            setPanOffsetState(parsedState.panOffset);
            setSelectedElementId(parsedState.selectedElementId || null); 
          } else {
            setElements(defaultInitialElements.map(el => ({ ...el, isNewlyAdded: true })));
          }
        } else {
           setElements(defaultInitialElements.map(el => ({ ...el, isNewlyAdded: true })));
        }
      } catch (error) {
        console.error("Failed to load canvas state from localStorage:", error);
        setElements(defaultInitialElements.map(el => ({ ...el, isNewlyAdded: true })));
      }
      setIsLoaded(true);
    }
  }, []);
  
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) { 
      try {
        const stateToSave: StoredCanvasState = { elements, zoom, panOffset, selectedElementId };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Failed to save canvas state to localStorage:", error);
      }
    }
  }, [elements, zoom, panOffset, selectedElementId, isLoaded]);


  const getHighestZIndex = useCallback(() => {
    return elements.reduce((maxZ, el) => Math.max(maxZ, el.zIndex || 0), 0);
  }, [elements]);

  const addElement = useCallback((type: CanvasElementData['type'], partialData?: Partial<CanvasElementData>) => {
    const newZIndex = getHighestZIndex() + 1;
    const newId = generateRobustId();
    
    const viewportCenterX = (typeof window !== "undefined" ? window.innerWidth / 2 : 400);
    const viewportCenterY = (typeof window !== "undefined" ? window.innerHeight / 2 : 300);
    
    const initialWidth = partialData?.width || (type === 'image' ? 200 : 150);
    const initialHeight = partialData?.height || (type === 'text' ? 40 : (type === 'sticker' ? 60 : 150));

    const initialX = (viewportCenterX - panOffset.x - initialWidth / 2 ) / zoom;
    const initialY = (viewportCenterY - panOffset.y - initialHeight / 2) / zoom;

    const newElementBase: Omit<CanvasElementData, 'content' | 'width' | 'height' | 'type'> & { type: ElementType, isNewlyAdded: boolean } = {
      id: newId,
      type,
      x: initialX,
      y: initialY,
      rotation: 0,
      zIndex: newZIndex,
      isNewlyAdded: true, // Mark as newly added
    };

    let newElement: CanvasElementData;

    switch (type) {
      case 'text':
        newElement = {
          ...newElementBase,
          type: 'text',
          content: 'New Text',
          width: 150,
          height: 40,
          fontSize: 20,
          textColor: 'hsl(var(--foreground))',
          fontFamily: 'Arial',
          ...partialData,
        };
        break;
      case 'image':
        newElement = {
          ...newElementBase,
          type: 'image',
          content: 'https://placehold.co/200x150.png', 
          width: 200,
          height: 150,
          'data-ai-hint': 'random placeholder',
          ...partialData,
        };
        break;
      case 'sticker':
        newElement = {
          ...newElementBase,
          type: 'sticker',
          content: '✨', 
          width: 60, 
          height: 60,
          stickerSize: 48,
          ...partialData,
        };
        break;
      default:
        throw new Error('Unknown element type');
    }
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    return newId;
  }, [getHighestZIndex, panOffset, zoom]);

  const updateElement = useCallback((id: string, updates: Partial<CanvasElementData>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }, [selectedElementId]);
  
  const bringToFront = useCallback((id: string) => {
    const currentElement = elements.find(el => el.id === id);
    if (!currentElement) return;

    const highestZIndex = getHighestZIndex();
    
    if (currentElement.zIndex <= highestZIndex || elements.length === 1) {
       setElements(prevElements =>
        prevElements.map(el => {
          if (el.id === id) {
            return { ...el, zIndex: highestZIndex + 1 };
          }
          return el;
        }).sort((a,b) => (a.zIndex || 0) - (b.zIndex || 0))
      );
    }
  }, [elements, getHighestZIndex]);

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      bringToFront(id);
    }
  }, [bringToFront]);

  const setZoomCb = useCallback((zoomLevel: number | ((prevZoom: number) => number)) => {
    setZoomState(zoomLevel);
  }, []);

  const setPanOffsetCb = useCallback((offset: { x: number; y: number } | ((prevOffset: {x:number; y:number}) => {x:number; y:number})) => {
    setPanOffsetState(offset);
  }, []);

  const clearBoard = useCallback(() => {
    setElements(defaultInitialElements.map(el => ({ ...el, isNewlyAdded: true })));
    setZoomState(1);
    setPanOffsetState({ x: 0, y: 0 });
    setSelectedElementId(null);
    if (typeof window !== 'undefined') {
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
