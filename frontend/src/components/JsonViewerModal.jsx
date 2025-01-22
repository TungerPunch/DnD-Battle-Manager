import { useEffect, useRef } from 'react';

export default function JsonViewerModal({ isOpen, onClose, jsonData }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format the JSON with tiles in one line but preserve spaces in text
  const formatJson = (data) => {
    // First convert the entire object to a string with proper formatting
    let jsonString = JSON.stringify(data, null, 2);

    // Find the tiles section and replace it with a compact version
    const tilesMatch = jsonString.match(/"tiles":\s*{[\s\S]+?}/);
    if (tilesMatch) {
      // Get the tiles object and convert it to a compact format
      const tilesObj = JSON.parse(tilesMatch[0].replace(/"tiles":\s*/, ''));
      
      // Create formatted tiles string with arrays on single lines
      const formattedTiles = Object.entries(tilesObj)
        .map(([type, coords]) => `  "${type}": ${JSON.stringify(coords).replace(/\s+/g, '')}`)
        .join(',\n');

      // Create the final tiles section
      const formattedTilesSection = `"tiles": {\n${formattedTiles}\n}`;

      // Replace the original tiles section with the formatted version
      jsonString = jsonString.replace(tilesMatch[0], formattedTilesSection);
    }

    // Remove extra whitespace from arrays of coordinates but preserve spaces in text
    return jsonString.replace(/\[\s+(-?\d+)\s*,\s*(-?\d+)\s*\]/g, '[$1,$2]');
  };

  const formattedJson = formatJson(jsonData);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-[var(--color-bg-secondary)] rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Текущее Состояние Игры
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm font-mono text-[var(--color-text-primary)] whitespace-pre-wrap">
            {formattedJson}
          </pre>
        </div>
        
        <div className="p-4 border-t border-[var(--color-border)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-bg-hover)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-accent)] transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
} 