
"use client"

import type { CanvasElementData } from '@/types/canvas';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

const generateRobustId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

interface CanvasContextType {
  elements: CanvasElementData[];
  selectedElementId: string | null;
  addElement: (type: CanvasElementData['type'], partialData?: Partial<CanvasElementData>) => string; // Returns new element ID
  updateElement: (id: string, updates: Partial<CanvasElementData>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  bringToFront: (id: string) => void;
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

const initialElements: CanvasElementData[] = [
  { 
    id: generateRobustId(), type: 'text', content: 'Welcome to Canvasly!', 
    x: 50, y: 50, width: 250, height: 50, rotation: 0, zIndex: 1, 
    fontSize: 24, textColor: 'hsl(var(--foreground))' // Theme-aware
  },
  { 
    id: generateRobustId(), type: 'image', content: 'https://placehold.co/300x200.png', 
    x: 150, y: 150, width: 300, height: 200, rotation: 0, zIndex: 2,
    'data-ai-hint': 'abstract design'
  },
];

export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children }) => {
  const [elements, setElements] = useState<CanvasElementData[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const getHighestZIndex = useCallback(() => {
    return elements.reduce((maxZ, el) => Math.max(maxZ, el.zIndex), 0);
  }, [elements]);

  const addElement = useCallback((type: CanvasElementData['type'], partialData?: Partial<CanvasElementData>) => {
    const newZIndex = getHighestZIndex() + 1;
    const newId = generateRobustId();
    const newElementBase = {
      id: newId,
      type,
      x: 50 + Math.random() * 50, // Default position with some variance
      y: 50 + Math.random() * 50,
      rotation: 0,
      zIndex: newZIndex,
    };

    let newElement: CanvasElementData;

    switch (type) {
      case 'text':
        newElement = {
          ...newElementBase,
          content: 'New Text',
          width: 150,
          height: 40,
          fontSize: 20,
          textColor: 'hsl(var(--foreground))', // Theme-aware
          ...partialData,
        };
        break;
      case 'image':
        newElement = {
          ...newElementBase,
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
          content: '✨', 
          width: 60, 
          height: 60,
          stickerSize: 48, // This will be used for font-size of emoji
          ...partialData,
        };
        break;
      default:
        throw new Error('Unknown element type');
    }
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    return newId;
  }, [getHighestZIndex]);

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
        })
      );
    }
  }, [elements, getHighestZIndex]);

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
    if (id) {
      bringToFront(id);
    }
  }, [bringToFront]);


  return (
    <CanvasContext.Provider
      value={{
        elements,
        selectedElementId,
        addElement,
        updateElement,
        deleteElement,
        selectElement,
        bringToFront,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};
