import { FaTrash } from 'react-icons/fa';

export default function FileGrid({ mediaFiles, onDelete, onSelect, selectedMediaIndex }) {
  return (
    <div className="absolute right-0 top-0 w-80 h-full bg-gray border border-white p-4 overflow-y-auto">
      <h2 className="text-white text-lg font-semibold mb-4">Upoaded Files</h2>
      <div className="grid grid-cols-3 gap-4">
        {mediaFiles.map((media, idx) => (
          <div
            key={idx}
            className={`relative group cursor-pointer ${
              idx === selectedMediaIndex ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={() => onSelect(idx)}
          >
            {media.type === 'video' ? (
              <video
                src={media.url}
                className="w-full h-24 object-cover rounded"
                muted
              />
            ) : (
              <img
                src={media.url}
                alt={media.name}
                className="w-full h-24 object-cover rounded"
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(idx);
              }}
              className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash size={12} />
            </button>
            <div className="text-xs text-white mt-1 truncate">{media.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 