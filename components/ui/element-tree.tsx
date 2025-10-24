"use client";

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Image, 
  Type, 
  Box,
  TreePine,
  Badge
} from 'lucide-react';
import { ElementData } from '../../types';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface ElementTreeProps {
  elements: ElementData[];
  selectedElement: ElementData | null;
  onElementSelect: (element: ElementData) => void;
  onElementToggleVisibility: (elementId: string) => void;
}

interface TreeNode {
  element: ElementData;
  children: TreeNode[];
  isVisible: boolean;
  isExpanded: boolean;
}

export function ElementTree({
  elements,
  selectedElement,
  onElementSelect,
  onElementToggleVisibility
}: ElementTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [hiddenElements, setHiddenElements] = useState<Set<string>>(new Set());

  const buildTree = (): TreeNode[] => {
    const nodeMap = new Map<HTMLElement, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Create nodes for all elements
    elements.forEach(elementData => {
      const node: TreeNode = {
        element: elementData,
        children: [],
        isVisible: true,
        isExpanded: expandedNodes.has(elementData.id)
      };
      nodeMap.set(elementData.element, node);
    });

    // Build parent-child relationships
    elements.forEach(elementData => {
      const node = nodeMap.get(elementData.element);
      if (!node) return;

      const parent = elementData.element.parentElement;
      const parentNode = parent ? nodeMap.get(parent) : null;

      if (parentNode) {
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const toggleNodeExpansion = (elementId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(elementId)) {
      newExpanded.delete(elementId);
    } else {
      newExpanded.add(elementId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleElementVisibility = (elementId: string) => {
    const newHidden = new Set(hiddenElements);
    if (newHidden.has(elementId)) {
      newHidden.delete(elementId);
    } else {
      newHidden.add(elementId);
    }
    setHiddenElements(newHidden);
    onElementToggleVisibility(elementId);
  };

  const getElementIcon = (type: ElementData['type']) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      default:
        return <Box className="h-4 w-4" />;
    }
  };

  const getElementLabel = (element: ElementData): string => {
    const tagName = element.element.tagName.toLowerCase();
    const textContent = element.element.textContent?.slice(0, 20) || '';
    const className = element.element.className;
    
    let label = tagName;
    
    if (className) {
      label += `.${className.split(' ')[0]}`;
    }
    
    if (textContent && element.type === 'text') {
      label += ` "${textContent}${textContent.length > 20 ? '...' : ''}"`;
    }
    
    return label;
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const isSelected = selectedElement?.id === node.element.id;
    const isHidden = hiddenElements.has(node.element.id);
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.element.id);

    return (
      <div key={node.element.id} className="select-none">
        <div
          className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
            isSelected 
              ? 'bg-primary text-primary-foreground' 
              : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onElementSelect(node.element)}
        >
          {/* Expansion Toggle */}
          <div className="w-4 flex justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(node.element.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : null}
          </div>

          {/* Element Icon */}
          <div className="text-muted-foreground">
            {getElementIcon(node.element.type)}
          </div>

          {/* Element Label */}
          <span className="flex-1 text-sm font-medium truncate">
            {getElementLabel(node.element)}
          </span>

          {/* Type Badge */}
          <Badge variant="secondary" className="text-xs">
            {node.element.type}
          </Badge>

          {/* Visibility Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleElementVisibility(node.element.id);
            }}
          >
            {isHidden ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Render Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeNodes = buildTree();

  return (
    <Card className="w-80 h-96">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <TreePine className="h-5 w-5" />
          <span>Elements</span>
          <Badge variant="outline">{elements.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="p-3 space-y-1">
            {treeNodes.length > 0 ? (
              treeNodes.map(node => renderTreeNode(node))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No elements found. Import HTML to get started.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}