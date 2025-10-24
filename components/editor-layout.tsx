"use client";

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { CanvasStage } from './ui/canvas-stage';
import { useEditorState } from '../hooks/use-editor-state';
import { ElementData } from '../types';
import { HTMLParser, sanitizeHTML } from '../lib/html-parser'; // Updated import
import { HTMLExporter } from '../lib/html-exporter';
import { ElementFactory } from '../lib/element-factory';
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
import { Toolbar } from './ui/toolbar';
import { ElementTree } from './ui/element-tree';
import { PropertiesPanel } from './ui/properties-panel';

export function EditorLayout() {
  const {
    content,
    setContent,
    selectedElement,
    setSelectedElement,
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useEditorState();

  const [elements, setElements] = useState<ElementData[]>([]);
  const [copiedElement, setCopiedElement] = useState<ElementData | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const handleImportHTML = useCallback((html: string) => {
    try {
      const sanitizedHTML = sanitizeHTML(html); // Use function import
      pushToHistory(content.html);
      
      setContent({
        html: sanitizedHTML,
        css: '',
        elements: []
      });
      
      toast.success('HTML imported successfully');
    } catch (error) {
      toast.error('Failed to import HTML');
      console.error('Import error:', error);
    }
  }, [content.html, pushToHistory, setContent]);

  const handleExportHTML = useCallback(() => {
    try {
      const stageElement = document.querySelector('.canvas-stage') as HTMLElement;
      if (!stageElement) {
        toast.error('No content to export');
        return;
      }

      // Clean up selection classes before export
      const clonedStage = stageElement.cloneNode(true) as HTMLElement;
      clonedStage.querySelectorAll('.element-selected').forEach(el => {
        el.classList.remove('element-selected');
      });

      const exportHTML = HTMLExporter.generateHTML(clonedStage.innerHTML);
      HTMLExporter.downloadHTML(exportHTML);
      
      toast.success('HTML exported successfully');
    } catch (error) {
      toast.error('Failed to export HTML');
      console.error('Export error:', error);
    }
  }, []);

  const handleAddText = useCallback(() => {
    try {
      const stageElement = document.querySelector('.canvas-stage') as HTMLElement;
      if (!stageElement) {
        toast.error('Stage not found');
        return;
      }

      pushToHistory(content.html);
      const newTextElement = ElementFactory.createTextElement(stageElement);
      
      setElements(prev => [...prev, newTextElement]);
      setSelectedElement(newTextElement);
      
      toast.success('Text element added');
    } catch (error) {
      toast.error('Failed to add text element');
      console.error('Add text error:', error);
    }
  }, [content.html, pushToHistory, setSelectedElement]);

  const handleAddImage = useCallback(() => {
    try {
      const stageElement = document.querySelector('.canvas-stage') as HTMLElement;
      if (!stageElement) {
        toast.error('Stage not found');
        return;
      }

      pushToHistory(content.html);
      const newImageElement = ElementFactory.createImageElement(stageElement);
      
      setElements(prev => [...prev, newImageElement]);
      setSelectedElement(newImageElement);
      
      toast.success('Image element added');
    } catch (error) {
      toast.error('Failed to add image element');
      console.error('Add image error:', error);
    }
  }, [content.html, pushToHistory, setSelectedElement]);

  const handleDelete = useCallback(() => {
    if (!selectedElement) {
      toast.error('No element selected');
      return;
    }

    try {
      pushToHistory(content.html);
      
      // Remove from DOM
      selectedElement.element.remove();
      
      // Remove from elements array
      setElements(prev => prev.filter(el => el.id !== selectedElement.id));
      setSelectedElement(null);
      
      toast.success('Element deleted');
    } catch (error) {
      toast.error('Failed to delete element');
      console.error('Delete error:', error);
    }
  }, [selectedElement, content.html, pushToHistory, setSelectedElement]);

  const handleUndo = useCallback(() => {
    const previousState = undo();
    if (previousState) {
      setContent(prev => ({ ...prev, html: previousState.html }));
      setSelectedElement(null);
      toast.success('Undone');
    }
  }, [undo, setContent, setSelectedElement]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setContent(prev => ({ ...prev, html: nextState.html }));
      setSelectedElement(null);
      toast.success('Redone');
    }
  }, [redo, setContent, setSelectedElement]);

  const handleCopy = useCallback(() => {
    if (!selectedElement) {
      toast.error('No element selected');
      return;
    }

    setCopiedElement(selectedElement);
    toast.success('Element copied');
  }, [selectedElement]);

  const handlePaste = useCallback(() => {
    if (!copiedElement) {
      toast.error('No element to paste');
      return;
    }

    try {
      const stageElement = document.querySelector('.canvas-stage') as HTMLElement;
      if (!stageElement) {
        toast.error('Stage not found');
        return;
      }

      pushToHistory(content.html);

      // Clone the element
      const clonedElement = copiedElement.element.cloneNode(true) as HTMLElement;
      const newId = `${copiedElement.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      clonedElement.id = newId;

      // Offset position
      const newX = copiedElement.position.x + 20;
      const newY = copiedElement.position.y + 20;
      clonedElement.style.left = `${newX}px`;
      clonedElement.style.top = `${newY}px`;

      stageElement.appendChild(clonedElement);

      const newElementData: ElementData = {
        id: newId,
        type: copiedElement.type,
        element: clonedElement,
        position: { x: newX, y: newY },
        properties: { ...copiedElement.properties }
      };

      setElements(prev => [...prev, newElementData]);
      setSelectedElement(newElementData);
      
      toast.success('Element pasted');
    } catch (error) {
      toast.error('Failed to paste element');
      console.error('Paste error:', error);
    }
  }, [copiedElement, content.html, pushToHistory, setSelectedElement]);

  const handleElementSelect = useCallback((element: ElementData | null) => {
    setSelectedElement(element);
  }, [setSelectedElement]);

  const handleElementMove = useCallback((elementId: string, position: { x: number; y: number }) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId 
          ? { ...el, position }
          : el
      )
    );
  }, []);

  const handleContentChange = useCallback((html: string) => {
    setContent(prev => ({ ...prev, html }));
  }, [setContent]);

  const handleElementUpdate = useCallback((elementId: string, updates: Partial<ElementData>) => {
    setElements(prev =>
      prev.map(el =>
        el.id === elementId
          ? { ...el, ...updates }
          : el
      )
    );
  }, []);

  const handleElementToggleVisibility = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const isHidden = element.element.style.display === 'none';
      element.element.style.display = isHidden ? '' : 'none';
      toast.success(`Element ${isHidden ? 'shown' : 'hidden'}`);
    }
  }, [elements]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: handleDelete,
    onCopy: handleCopy,
    onPaste: handlePaste
  });

  // Update elements when content changes
  const handleStageContentUpdate = useCallback((newElements: ElementData[]) => {
    setElements(newElements);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <Toolbar
        onImportHTML={handleImportHTML}
        onExportHTML={handleExportHTML}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onDelete={handleDelete}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCopy={handleCopy}
        onPaste={handlePaste}
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={!!selectedElement}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Element Tree */}
        <div className="w-80 border-r bg-muted/20 p-4 overflow-auto">
          <ElementTree
            elements={elements}
            selectedElement={selectedElement}
            onElementSelect={handleElementSelect}
            onElementToggleVisibility={handleElementToggleVisibility}
          />
        </div>

        {/* Center - Canvas Stage */}
        <div className="flex-1 overflow-hidden">
          <CanvasStage
            htmlContent={content.html}
            selectedElement={selectedElement}
            onElementSelect={handleElementSelect}
            onElementMove={handleElementMove}
            onContentChange={handleContentChange}
          />
        </div>

        {/* Right Sidebar - Properties Panel */}
        <div className="w-80 border-l bg-muted/20 p-4 overflow-auto">
          <PropertiesPanel
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t bg-muted/50 px-6 py-2 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>Elements: {elements.length}</span>
          {selectedElement && (
            <span>
              Selected: {selectedElement.element.tagName.toLowerCase()}#{selectedElement.id}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Canvas: 720×720</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}