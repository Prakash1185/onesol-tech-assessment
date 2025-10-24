"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { Badge } from "./badge";
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { ElementData } from '../../types';
import { HTMLParser, sanitizeHTML, extractElementsFromContainer } from '../../lib/html-parser'; // Updated import
import { Button } from './button';
import { Card } from './card';

interface CanvasStageProps {
  htmlContent: string;
  selectedElement: ElementData | null;
  onElementSelect: (element: ElementData | null) => void;
  onElementMove: (elementId: string, position: { x: number; y: number }) => void;
  onContentChange: (html: string) => void;
}

export function CanvasStage({
  htmlContent,
  selectedElement,
  onElementSelect,
  onElementMove,
  onContentChange
}: CanvasStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<ElementData[]>([]);

  // Initialize content in stage
  useEffect(() => {
    if (stageRef.current && htmlContent) {
      const sanitizedHTML = sanitizeHTML(htmlContent); // Use function import
      stageRef.current.innerHTML = sanitizedHTML;
      
      // Extract and track elements
      const extractedElements = extractElementsFromContainer(stageRef.current); // Use function import
      setElements(extractedElements);
      
      // Add event listeners to all elements
      addElementListeners();
      
      // Add selection styling
      addSelectionStyles();
    }
  }, [htmlContent]);

  // Update selection styling when selectedElement changes
  useEffect(() => {
    updateSelectionDisplay();
  }, [selectedElement]);

  const addSelectionStyles = useCallback(() => {
    // Add CSS for selection styling
    const styleId = 'canvas-selection-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      .element-selected {
        outline: 2px solid hsl(var(--primary)) !important;
        outline-offset: 2px !important;
        position: relative !important;
      }
      
      .element-selected::after {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border: 1px dashed hsl(var(--primary));
        pointer-events: none;
        z-index: 1000;
      }
      
      .canvas-stage * {
        transition: outline 0.2s ease;
      }
      
      .canvas-stage *:hover:not(.element-selected) {
        outline: 1px solid hsl(var(--muted-foreground)) !important;
        outline-offset: 1px !important;
      }
    `;
  }, []);

  const updateSelectionDisplay = useCallback(() => {
    // Clear all previous selections
    document.querySelectorAll('.element-selected').forEach(el => {
      el.classList.remove('element-selected');
    });
    
    // Add selection to current element
    if (selectedElement?.element) {
      selectedElement.element.classList.add('element-selected');
    }
  }, [selectedElement]);

  const addElementListeners = useCallback(() => {
    if (!stageRef.current) return;

    const allElements = stageRef.current.querySelectorAll('*:not(.canvas-stage)');
    allElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Remove existing listeners to prevent duplicates
      htmlElement.removeEventListener('click', handleElementClick);
      htmlElement.removeEventListener('mousedown', handleMouseDown);
      
      // Add new listeners
      htmlElement.addEventListener('click', handleElementClick);
      htmlElement.addEventListener('mousedown', handleMouseDown);
      
      // Make elements appear interactive
      htmlElement.style.cursor = 'pointer';
      htmlElement.setAttribute('draggable', 'false');
      
      // Ensure absolute positioning for draggable elements
      if (!htmlElement.style.position) {
        htmlElement.style.position = 'absolute';
      }
    });
  }, []);

  const handleElementClick = useCallback((e: Event) => {
    e.stopPropagation();
    const element = e.target as HTMLElement;
    
    // Find corresponding element data
    const elementData = elements.find(el => el.element === element);
    if (elementData) {
      onElementSelect(elementData);
    } else {
      // Create element data for dynamically added elements
      const newElementData: ElementData = {
        id: element.id || `element-${Date.now()}`,
        type: element.tagName.toLowerCase() === 'img' ? 'image' : 'text',
        element,
        position: {
          x: parseInt(element.style.left) || 0,
          y: parseInt(element.style.top) || 0
        },
        properties: extractElementsFromContainer(element.parentElement || document.body)
          .find(el => el.element === element)?.properties || {}
      };
      
      setElements(prev => [...prev, newElementData]);
      onElementSelect(newElementData);
    }
  }, [elements, onElementSelect]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = e.target as HTMLElement;
    
    // Don't drag if clicking on certain elements
    if (element.tagName.toLowerCase() === 'button' || element.closest('button')) {
      return;
    }
    
    setIsDragging(true);
    const rect = element.getBoundingClientRect();
    const stageRect = stageRef.current?.getBoundingClientRect();
    
    if (stageRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!stageRef.current) return;
      
      const stageRect = stageRef.current.getBoundingClientRect();
      const zoomFactor = zoom / 100;
      
      const newX = (moveEvent.clientX - stageRect.left - dragOffset.x) / zoomFactor;
      const newY = (moveEvent.clientY - stageRect.top - dragOffset.y) / zoomFactor;
      
      // Constrain to stage boundaries
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;
      const constrainedX = Math.max(0, Math.min(newX, 720 - elementWidth));
      const constrainedY = Math.max(0, Math.min(newY, 720 - elementHeight));
      
      element.style.position = 'absolute';
      element.style.left = `${constrainedX}px`;
      element.style.top = `${constrainedY}px`;
      
      // Update element data
      const elementData = elements.find(el => el.element === element);
      if (elementData) {
        onElementMove(elementData.id, { x: constrainedX, y: constrainedY });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Update HTML content
      if (stageRef.current) {
        onContentChange(stageRef.current.innerHTML);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [elements, zoom, dragOffset, onElementMove, onContentChange]);

  const handleStageClick = useCallback((e: React.MouseEvent) => {
    if (e.target === stageRef.current) {
      onElementSelect(null);
    }
  }, [onElementSelect]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="flex flex-col h-full">
      {/* Stage Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">720 × 720</Badge>
          <Badge variant="outline">{zoom}%</Badge>
          {selectedElement && (
            <Badge variant="default">
              {selectedElement.element.tagName.toLowerCase()}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="h-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="h-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gradient-to-br from-muted/20 to-muted/40 p-8"
      >
        <div className="flex justify-center items-start min-h-full">
          <Card className="p-0 shadow-2xl ring-1 ring-border/50">
            <div
              ref={stageRef}
              className="canvas-stage bg-background relative"
              onClick={handleStageClick}
              style={{
                width: '720px',
                height: '720px',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                overflow: 'hidden',
                cursor: isDragging ? 'grabbing' : 'default'
              }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}