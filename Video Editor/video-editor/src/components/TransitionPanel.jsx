import { useState, useCallback } from 'react';

const TRANSITIONS = [
  { name: 'No Transition', type: 'none', description: 'Simple cut between clips' },
  { name: 'Fade', type: 'fade', description: 'Smooth fade between clips' },
  { name: 'Slide Left', type: 'slideLeft', description: 'Slide from right to left' },
  { name: 'Slide Right', type: 'slideRight', description: 'Slide from left to right' },
  { name: 'Slide Up', type: 'slideUp', description: 'Slide from bottom to top' },
  { name: 'Slide Down', type: 'slideDown', description: 'Slide from top to bottom' },
  { name: 'Zoom In', type: 'zoomIn', description: 'Zoom in effect' },
  { name: 'Zoom Out', type: 'zoomOut', description: 'Zoom out effect' },
  { name: 'Blur', type: 'blur', description: 'Blur transition' }
];

export default function TransitionPanel({ onTransitionSelect }) {
  const [selectedTransition, setSelectedTransition] = useState(TRANSITIONS[0]); // Default to No Transition

  const handleTransitionSelect = useCallback((transition) => {
    setSelectedTransition(transition);
    onTransitionSelect(transition);
  }, [onTransitionSelect]);

  return (
    <div className="bg-grey text-white h-full border border-white flex flex-col">
      <div className="p-4 border-b border-white">
        <h2 className="text-lg font-semibold">Transitions</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {TRANSITIONS.map((transition) => (
            <button
              key={transition.type}
              onClick={() => handleTransitionSelect(transition)}
              className={`w-full p-3 rounded-lg border transition-all ${
                selectedTransition.type === transition.type
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-gray-800 hover:bg-gray-700 border-gray-700'
              }`}
            >
              <div className="flex flex-col items-start">
                <div className="font-medium">{transition.name}</div>
                <div className="text-sm opacity-75">{transition.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 