import { useState, useCallback } from 'react';
import { ElementData, HTMLContent, HistoryState } from '@/types';

export function useEditorState() {
  const [content, setContent] = useState<HTMLContent>({
    html: '',
    css: '',
    elements: []
  });
  
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const pushToHistory = useCallback((html: string) => {
    const newState: HistoryState = {
      html,
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);
  
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return history[historyIndex - 1];
    }
    return null;
  }, [history, historyIndex]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return history[historyIndex + 1];
    }
    return null;
  }, [history, historyIndex]);
  
  return {
    content,
    setContent,
    selectedElement,
    setSelectedElement,
    pushToHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
}