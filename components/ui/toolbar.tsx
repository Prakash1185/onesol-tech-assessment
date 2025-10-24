"use client";

import {
  Upload,
  Download,
  Type,
  Image,
  Trash2,
  Undo,
  Redo,
  Copy,
  ClipboardPaste,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "./button";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "./input";
import { Label } from "@radix-ui/react-label";
import { ModeToggle } from "../mode-toggle";

interface ToolbarProps {
  onImportHTML: (html: string) => void;
  onExportHTML: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

export function Toolbar({
  onImportHTML,
  onExportHTML,
  onAddText,
  onAddImage,
  onDelete,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  canUndo,
  canRedo,
  hasSelection
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const htmlInputRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/html') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const html = event.target?.result as string;
        onImportHTML(html);
      };
      reader.readAsText(file);
    }
  };

  const handleHTMLPaste = () => {
    const textarea = htmlInputRef.current;
    if (textarea && textarea.value.trim()) {
      onImportHTML(textarea.value);
      textarea.value = '';
    }
  };

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Import Section */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-9"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import HTML
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* History Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-9 w-9 p-0"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-9 w-9 p-0"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Clipboard Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              disabled={!hasSelection}
              className="h-9 w-9 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPaste}
              className="h-9 w-9 p-0"
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Add Elements */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddText}
              className="h-9"
            >
              <Type className="h-4 w-4 mr-2" />
              Add Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddImage}
              className="h-9"
            >
              <Image className="h-4 w-4 mr-2" />
              Add Image
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            disabled={!hasSelection}
            className="h-9"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="html-paste" className="text-sm">Quick HTML:</Label>
            <textarea
              ref={htmlInputRef}
              id="html-paste"
              placeholder="Paste HTML here..."
              className="w-48 h-9 px-3 py-2 text-xs border rounded-md resize-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleHTMLPaste}
              className="h-9"
            >
              Load
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="default"
            onClick={onExportHTML}
            className="h-9"
          >
            <Download className="h-4 w-4 mr-2" />
            Export HTML
          </Button>

          <ModeToggle />
        </div>
      </div>
    </div>
  );
}