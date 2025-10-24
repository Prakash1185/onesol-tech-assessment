import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            onRedo();
            break;
          case 'c':
            e.preventDefault();
            onCopy();
            break;
          case 'v':
            e.preventDefault();
            onPaste();
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, onDelete, onCopy, onPaste]);
}