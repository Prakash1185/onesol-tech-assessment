"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Upload, Download, Trash2, Image, Type, 
  ZoomIn, ZoomOut, RotateCcw, Settings,
  FileText, Plus
} from 'lucide-react';

interface ElementData {
  id: string;
  element: HTMLElement;
  type: 'text' | 'image';
}

export default function HTMLEditor() {
  const [htmlContent, setHtmlContent] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [zoom, setZoom] = useState(100);
  const [htmlInput, setHtmlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Sample HTML as per assignment
  const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Sample Poster</title>
<style>
body { margin: 0; padding: 0; }
.poster {
width: 720px; height: 720px; position: relative;
background: #f3f4f6; overflow: hidden; font-family: sans-serif;
}
.title {
position: absolute; top: 80px; left: 40px;
font-size: 48px; font-weight: bold; color: #111827;
}
.subtitle {
position: absolute; top: 160px; left: 40px;
font-size: 20px; color: #374151;
}
.hero {
position: absolute; bottom: 0; right: 0; width: 380px; height: 380px;
object-fit: cover; border-top-left-radius: 16px;
}
</style>
</head>
<body>
<div class="poster">
<h1 class="title">Summer Sale</h1>
<p class="subtitle">Up to <strong>50% off</strong> on select items!</p>
<img class="hero" src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1215" alt="Model" />
</div>
</body>
</html>`;

  // Import HTML file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const html = event.target?.result as string;
        loadHTML(html);
      };
      reader.readAsText(file);
    }
  };

  // Load HTML content into stage
  const loadHTML = (html: string) => {
    setHtmlContent(html);
    setSelectedElement(null);
    
    // Parse and inject into stage
    setTimeout(() => {
      if (stageRef.current) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.body.innerHTML;
        
        stageRef.current.innerHTML = bodyContent;
        setupElementInteraction();
      }
    }, 100);
  };

  // Setup click handlers for elements
  const setupElementInteraction = () => {
    if (!stageRef.current) return;
    
    const elements = stageRef.current.querySelectorAll('*');
    elements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      // Make elements selectable
      htmlElement.addEventListener('click', (e) => {
        e.stopPropagation();
        selectElement(htmlElement);
      });

      // Make elements draggable
      htmlElement.style.cursor = 'move';
      htmlElement.addEventListener('mousedown', handleMouseDown);
    });
  };

  // Element selection
  const selectElement = (element: HTMLElement) => {
    // Remove previous selection
    if (selectedElement) {
      selectedElement.style.outline = '';
    }
    
    // Add selection outline
    element.style.outline = '2px solid #3b82f6';
    element.style.outlineOffset = '2px';
    setSelectedElement(element);
  };

  // Drag functionality
  const handleMouseDown = (e: MouseEvent) => {
    const element = e.target as HTMLElement;
    if (!element) return;

    setIsDragging(true);
    selectElement(element);
    
    const rect = element.getBoundingClientRect();
    const stageRect = stageRef.current?.getBoundingClientRect();
    
    if (stageRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement || !stageRef.current) return;

    const stageRect = stageRef.current.getBoundingClientRect();
    const elementRect = selectedElement.getBoundingClientRect();
    
    let newX = e.clientX - stageRect.left - dragOffset.x;
    let newY = e.clientY - stageRect.top - dragOffset.y;
    
    // Constrain to stage bounds
    newX = Math.max(0, Math.min(newX, 720 - elementRect.width));
    newY = Math.max(0, Math.min(newY, 720 - elementRect.height));
    
    selectedElement.style.position = 'absolute';
    selectedElement.style.left = `${newX}px`;
    selectedElement.style.top = `${newY}px`;
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        deleteSelected();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  // Add new text element
  const addTextElement = () => {
    if (!stageRef.current) return;
    
    const textElement = document.createElement('p');
    textElement.textContent = 'New Text';
    textElement.style.position = 'absolute';
    textElement.style.left = '50px';
    textElement.style.top = '50px';
    textElement.style.fontSize = '16px';
    textElement.style.color = '#000000';
    textElement.style.cursor = 'move';
    
    stageRef.current.appendChild(textElement);
    
    // Setup interaction
    textElement.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(textElement);
    });
    textElement.addEventListener('mousedown', handleMouseDown);
    
    // Auto-select
    selectElement(textElement);
  };

  // Add new image element
  const addImageElement = () => {
    if (!stageRef.current) return;
    
    const imgElement = document.createElement('img');
    imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3ENew Image%3C/text%3E%3C/svg%3E';
    imgElement.alt = 'New Image';
    imgElement.style.position = 'absolute';
    imgElement.style.left = '100px';
    imgElement.style.top = '100px';
    imgElement.style.width = '200px';
    imgElement.style.height = '150px';
    imgElement.style.cursor = 'move';
    
    stageRef.current.appendChild(imgElement);
    
    // Setup interaction
    imgElement.addEventListener('click', (e) => {
      e.stopPropagation();
      selectElement(imgElement);
    });
    imgElement.addEventListener('mousedown', handleMouseDown);
    
    // Auto-select
    selectElement(imgElement);
  };

  // Delete selected element
  const deleteSelected = () => {
    if (selectedElement) {
      selectedElement.remove();
      setSelectedElement(null);
    }
  };

  // Text editing (double-click)
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const element = e.target as HTMLElement;
      if (element && element.tagName !== 'IMG') {
        const newText = prompt('Enter new text:', element.textContent || '');
        if (newText !== null) {
          element.textContent = newText;
        }
      }
    };

    if (stageRef.current) {
      stageRef.current.addEventListener('dblclick', handleDoubleClick);
      return () => {
        stageRef.current?.removeEventListener('dblclick', handleDoubleClick);
      };
    }
  }, []);

  // Export HTML
  const exportHTML = () => {
    if (!stageRef.current) return;
    
    // Clean up selection outlines
    const elements = stageRef.current.querySelectorAll('*');
    elements.forEach(el => {
      (el as HTMLElement).style.outline = '';
    });
    
    const exportedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta data-generated-by="editable-html-poster" />
    <title>Editable HTML Poster</title>
    <style>
        body { margin: 0; padding: 0; font-family: sans-serif; }
        .poster-container { width: 720px; height: 720px; position: relative; overflow: hidden; margin: 0 auto; background: #f3f4f6; }
    </style>
</head>
<body>
    <div class="poster-container">
        ${stageRef.current.innerHTML}
    </div>
</body>
</html>`;

    const blob = new Blob([exportedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'poster.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Update selected element properties
  const updateElementProperty = (property: string, value: string) => {
    if (!selectedElement) return;
    
    if (property === 'src' && selectedElement.tagName === 'IMG') {
      (selectedElement as HTMLImageElement).src = value;
    } else if (property === 'alt' && selectedElement.tagName === 'IMG') {
      (selectedElement as HTMLImageElement).alt = value;
    } else if (property === 'content' && selectedElement.tagName !== 'IMG') {
      selectedElement.textContent = value;
    } else if (property === 'fontSize') {
      selectedElement.style.fontSize = value;
    } else if (property === 'color') {
      selectedElement.style.color = value;
    } else if (property === 'width') {
      selectedElement.style.width = value;
    } else if (property === 'height') {
      selectedElement.style.height = value;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Import Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import HTML
              </Button>
              <Button
                variant="outline"
                onClick={() => loadHTML(sampleHTML)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Load Sample
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Add Elements */}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={addTextElement}>
                <Type className="h-4 w-4 mr-2" />
                Add Text
              </Button>
              <Button variant="outline" onClick={addImageElement}>
                <Image className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteSelected}
                disabled={!selectedElement}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Export */}
            <Button onClick={exportHTML}>
              <Download className="h-4 w-4 mr-2" />
              Export HTML
            </Button>
          </div>

          {/* HTML Input */}
          <div className="mt-4 flex gap-2">
            <Textarea
              placeholder="Or paste HTML content here..."
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              className="flex-1"
              rows={3}
            />
            <Button 
              onClick={() => {
                if (htmlInput.trim()) {
                  loadHTML(htmlInput);
                  setHtmlInput('');
                }
              }}
            >
              Load HTML
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Canvas */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge>720 × 720 Canvas</Badge>
                  <Badge variant="outline">{zoom}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(50, zoom - 25))}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(100)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(200, zoom + 25))}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stage */}
              <div className="bg-gray-100 p-8 rounded-lg overflow-auto">
                <div className="flex justify-center">
                  <div
                    ref={stageRef}
                    className="bg-white shadow-lg border-2 border-gray-300"
                    style={{
                      width: '720px',
                      height: '720px',
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                      position: 'relative'
                    }}
                    onClick={() => setSelectedElement(null)}
                  >
                    {/* Content will be injected here */}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Properties Panel */}
          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5" />
                <h3 className="font-semibold">Properties</h3>
              </div>

              {selectedElement ? (
                <div className="space-y-4">
                  <div>
                    <Label>Element Type</Label>
                    <Input value={selectedElement.tagName.toLowerCase()} readOnly />
                  </div>

                  {selectedElement.tagName === 'IMG' ? (
                    <>
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={(selectedElement as HTMLImageElement).src}
                          onChange={(e) => updateElementProperty('src', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Alt Text</Label>
                        <Input
                          value={(selectedElement as HTMLImageElement).alt}
                          onChange={(e) => updateElementProperty('alt', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Width</Label>
                        <Input
                          value={selectedElement.style.width}
                          onChange={(e) => updateElementProperty('width', e.target.value)}
                          placeholder="e.g., 200px"
                        />
                      </div>
                      <div>
                        <Label>Height</Label>
                        <Input
                          value={selectedElement.style.height}
                          onChange={(e) => updateElementProperty('height', e.target.value)}
                          placeholder="e.g., 150px"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>Text Content</Label>
                        <Textarea
                          value={selectedElement.textContent || ''}
                          onChange={(e) => updateElementProperty('content', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Font Size</Label>
                        <Input
                          value={selectedElement.style.fontSize}
                          onChange={(e) => updateElementProperty('fontSize', e.target.value)}
                          placeholder="e.g., 16px"
                        />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input
                          type="color"
                          value={selectedElement.style.color || '#000000'}
                          onChange={(e) => updateElementProperty('color', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select an element to edit its properties
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}