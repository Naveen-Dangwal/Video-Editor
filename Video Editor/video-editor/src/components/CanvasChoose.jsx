import { useState, useCallback } from 'react';

const CANVAS_SIZES = [
  { name: 'Wide Screen', ratio: '16:9', width: 1920, height: 1080 },
  { name: 'Full Portrait', ratio: '9:16', width: 1080, height: 1920 },
  { name: 'Square', ratio: '1:1', width: 1080, height: 1080 }
];

export default function CanvasChoose({ onSizeSelect }) {
  const [selectedSize, setSelectedSize] = useState(CANVAS_SIZES[1]); // Default to Full Portrait

  const handleSizeSelect = useCallback((size) => {
    setSelectedSize(size);
    onSizeSelect(size);
  }, [onSizeSelect]);

  return (
    <div className="bg-grey text-white h-full border border-white flex flex-col">
      <div className="p-4 border-b border-white">
        <h2 className="text-lg font-semibold">Canvas Size</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {CANVAS_SIZES.map((size) => (
            <button
              key={size.ratio}
              onClick={() => handleSizeSelect(size)}
              className={`w-full p-4 rounded-lg border transition-all ${
                selectedSize.ratio === size.ratio
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-gray-800 hover:bg-gray-700 border-yellow-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{size.name}</div>
                  <div className="text-sm opacity-75">{size.ratio}</div>
                </div>
                <div className="text-sm opacity-75">
                  {size.width} × {size.height}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 