import { useState } from 'react';

export default function MusicPanel({
  handleFileChange,
  handleDrop,
  handleDragOver,
  musicFiles,
  onRemoveMusic,
}) {
  const [playingIndex, setPlayingIndex] = useState(null);
  const [audioRefs] = useState({});

  const handlePlay = (index) => {
    if (playingIndex !== null) {
      audioRefs[playingIndex]?.pause();
    }
    if (playingIndex === index) {
      setPlayingIndex(null);
    } else {
      audioRefs[index]?.play();
      setPlayingIndex(index);
    }
  };

  return (
    <div
      className="bg-grey text-white p-4 border border-white flex flex-col h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label
        htmlFor="music-upload"
        className="border-2 border-dashed border-yellow-400 p-10 text-center cursor-pointer w-full mb-4"
      >
        <p className="text-lg mb-2">Add Music</p>
        <p className="text-sm">or drop audio files here</p>
        <input
          id="music-upload"
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <div className="flex-1 overflow-y-auto">
        {musicFiles.map((music, index) => (
          <div
            key={index}
            className="bg-black p-3 mb-2 rounded flex items-center justify-between"
          >
            <div className="flex items-center flex-1">
              <button
                onClick={() => handlePlay(index)}
                className="mr-3 text-yellow-400 hover:text-yellow-300"
              >
                {playingIndex === index ? '⏸' : '▶'}
              </button>
              <span className="text-xs truncate">{music.name}</span>
            </div>
            <button
              onClick={() => onRemoveMusic(index)}
              className="text-white-400 hover:text-red-300 ml-2"
            >
              🗑
            </button>
            <audio
              ref={(el) => (audioRefs[index] = el)}
              src={music.url}
              onEnded={() => setPlayingIndex(null)}
              className="hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 