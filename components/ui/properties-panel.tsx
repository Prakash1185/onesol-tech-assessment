"use client";

import { useState, useEffect } from 'react';
import { Upload, Palette, Type, Move, Settings, Badge } from 'lucide-react';
import { ElementData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Label } from '@radix-ui/react-label';
import { Input } from './input';
import { Separator } from '@radix-ui/react-separator';
import { Textarea } from './textarea';
import { Button } from './button';

interface PropertiesPanelProps {
  selectedElement: ElementData | null;
  onElementUpdate: (elementId: string, updates: Partial<ElementData>) => void;
}

export function PropertiesPanel({
  selectedElement,
  onElementUpdate
}: PropertiesPanelProps) {
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedElement) {
      setProperties(selectedElement.properties);
    } else {
      setProperties({});
    }
  }, [selectedElement]);

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedElement) return;

    const updatedProperties = { ...properties, [key]: value };
    setProperties(updatedProperties);

    // Apply changes to the actual element
    applyChangesToElement(key, value);

    // Update element data
    onElementUpdate(selectedElement.id, {
      properties: updatedProperties
    });
  };

  const applyChangesToElement = (key: string, value: any) => {
    if (!selectedElement?.element) return;

    const element = selectedElement.element;

    switch (key) {
      case 'src':
        if (element.tagName.toLowerCase() === 'img') {
          (element as HTMLImageElement).src = value;
        }
        break;
      case 'alt':
        if (element.tagName.toLowerCase() === 'img') {
          (element as HTMLImageElement).alt = value;
        }
        break;
      case 'width':
        element.style.width = `${value}px`;
        break;
      case 'height':
        element.style.height = `${value}px`;
        break;
      case 'fontSize':
        element.style.fontSize = value;
        break;
      case 'color':
        element.style.color = value;
        break;
      case 'fontWeight':
        element.style.fontWeight = value;
        break;
      case 'textContent':
        element.textContent = value;
        break;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedElement) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handlePropertyChange('src', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextEdit = () => {
    if (!selectedElement?.element) return;

    setIsEditing(true);
    const element = selectedElement.element;
    
    // Make element contentEditable
    element.contentEditable = 'true';
    element.focus();
    
    const handleBlur = () => {
      element.contentEditable = 'false';
      setIsEditing(false);
      handlePropertyChange('textContent', element.textContent || '');
      element.removeEventListener('blur', handleBlur);
    };
    
    element.addEventListener('blur', handleBlur);
  };

  if (!selectedElement) {
    return (
      <Card className="w-80 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Properties</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Select an element to edit its properties
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Properties</span>
          </div>
          <Badge variant="outline">{selectedElement.type}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Element Info */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">ELEMENT INFO</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">ID</Label>
              <Input
                value={selectedElement.id}
                readOnly
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Tag</Label>
              <Input
                value={selectedElement.element.tagName.toLowerCase()}
                readOnly
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Position */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center">
            <Move className="h-3 w-3 mr-1" />
            POSITION
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={selectedElement.position.x}
                onChange={(e) => {
                  const newX = parseInt(e.target.value) || 0;
                  selectedElement.element.style.left = `${newX}px`;
                  onElementUpdate(selectedElement.id, {
                    position: { ...selectedElement.position, x: newX }
                  });
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={selectedElement.position.y}
                onChange={(e) => {
                  const newY = parseInt(e.target.value) || 0;
                  selectedElement.element.style.top = `${newY}px`;
                  onElementUpdate(selectedElement.id, {
                    position: { ...selectedElement.position, y: newY }
                  });
                }}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground flex items-center">
              <Upload className="h-3 w-3 mr-1" />
              IMAGE PROPERTIES
            </Label>
            
            <div>
              <Label className="text-xs">Source URL</Label>
              <Input
                value={properties.src || ''}
                onChange={(e) => handlePropertyChange('src', e.target.value)}
                className="h-8 text-xs"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <Label className="text-xs">Upload New Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="h-8 text-xs"
              />
            </div>
            
            <div>
              <Label className="text-xs">Alt Text</Label>
              <Input
                value={properties.alt || ''}
                onChange={(e) => handlePropertyChange('alt', e.target.value)}
                className="h-8 text-xs"
                placeholder="Image description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Width</Label>
                <Input
                  type="number"
                  value={parseInt(properties.width) || ''}
                  onChange={(e) => handlePropertyChange('width', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Input
                  type="number"
                  value={parseInt(properties.height) || ''}
                  onChange={(e) => handlePropertyChange('height', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground flex items-center">
              <Type className="h-3 w-3 mr-1" />
              TEXT PROPERTIES
            </Label>
            
            <div>
              <Label className="text-xs">Content</Label>
              <Textarea
                value={selectedElement.element.textContent || ''}
                onChange={(e) => handlePropertyChange('textContent', e.target.value)}
                className="h-20 text-xs"
                placeholder="Enter text content"
              />
            </div>
            
            <Button
              onClick={handleTextEdit}
              variant="outline"
              size="sm"
              className="w-full h-8"
              disabled={isEditing}
            >
              {isEditing ? 'Editing...' : 'Edit Inline'}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Font Size</Label>
                <Input
                  value={properties.fontSize || ''}
                  onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
                  className="h-8 text-xs"
                  placeholder="16px"
                />
              </div>
              <div>
                <Label className="text-xs">Font Weight</Label>
                <Input
                  value={properties.fontWeight || ''}
                  onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                  className="h-8 text-xs"
                  placeholder="400"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Color</Label>
              <div className="flex space-x-2">
                <Input
                  type="color"
                  value={properties.color || '#000000'}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="h-8 w-16 p-1"
                />
                <Input
                  value={properties.color || ''}
                  onChange={(e) => handlePropertyChange('color', e.target.value)}
                  className="h-8 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Style Properties */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground flex items-center">
            <Palette className="h-3 w-3 mr-1" />
            STYLING
          </Label>
          <div>
            <Label className="text-xs">CSS Classes</Label>
            <Input
              value={selectedElement.element.className}
              onChange={(e) => {
                selectedElement.element.className = e.target.value;
              }}
              className="h-8 text-xs"
              placeholder="class1 class2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}