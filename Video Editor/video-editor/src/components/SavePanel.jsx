import { useState, useRef } from 'react';

export default function SavePanel({ mergedVideoUrl }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef(null);

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleDownload = () => {
    if (!mergedVideoUrl) return;
    
    const link = document.createElement('a');
    link.href = mergedVideoUrl;
    link.download = 'merged-video.webm';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-grey text-white p-4 h-full border border-white">
      <h2 className="text-lg font-semibold mb-4">Save Video</h2>
      
      {mergedVideoUrl ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={mergedVideoUrl}
              controls
              className="w-full"
              style={{ maxHeight: '300px' }}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Playback Speed</label>
            <div className="flex gap-1">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`px-1 py-1 rounded ${
                    playbackSpeed === speed
                      ? 'bg-yellow-400 text-black'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Video
          </button>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <p>No video available to save.</p>
          <p className="text-sm mt-2">Merge your files first to save the video.</p>
        </div>
      )}
    </div>
  );
} 