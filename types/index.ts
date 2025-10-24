export type ElementType = 'text' | 'image' | 'div';

export interface ElementPosition {
  x: number;
  y: number;
}

export interface BaseElementProperties {
  fontSize?: string;
  color?: string;
  fontWeight?: string;
}

export interface ImageProperties extends BaseElementProperties {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface TextProperties extends BaseElementProperties {
  textContent: string;
}

export type ElementProperties = ImageProperties | TextProperties | BaseElementProperties;

export interface ElementData {
  id: string;
  type: 'text' | 'image' | 'div';
  tagName: string;
  content: string;
  position: { x: number; y: number };
  styles: Record<string, string>;
  attributes: Record<string, string>;
}

export interface CanvasState {
  html: string;
  elements: ElementData[];
  selectedElementId: string | null;
}

export interface HTMLContent {
  html: string;
  css: string;
  elements: ElementData[];
}

export interface HistoryState {
  html: string;
  timestamp: number;
}

export interface EditorActions {
  onImportHTML: (html: string) => void;
  onExportHTML: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onPaste: () => void;
}