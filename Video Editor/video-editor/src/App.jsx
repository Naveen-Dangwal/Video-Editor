import { useState, useCallback } from 'react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import Timeline from './components/Timeline';
import UploadPanel from './components/UploadPanel';
import TextPanel from './components/TextPanel';
import MusicPanel from './components/MusicPanel';
import SavePanel from './components/SavePanel';
import CanvasChoose from './components/CanvasChoose';
import TransitionPanel from './components/TransitionPanel';

function App() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [textElements, setTextElements] = useState([]);
  const [musicFiles, setMusicFiles] = useState([]);
  const [activePanel, setActivePanel] = useState('');
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [mergedVideoUrl, setMergedVideoUrl] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1920 }); // Default to Full Portrait
  const [selectedTransition, setSelectedTransition] = useState({ type: 'none', name: 'No Transition' }); // Default transition

  const resetProject = useCallback(() => {
    setMediaFiles([]);
    setTextElements([]);
    setMusicFiles([]);
    setActivePanel('');
    setSelectedMediaIndex(0);
    setMergedVideoUrl(null);
  }, []);

  const processFiles = useCallback((files) => {
    const newFiles = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
      name: file.name,
      start: 0,
      end: null,
    }));

    setMediaFiles((prev) => {
      const combined = [...prev, ...newFiles];
      return combined;
    });

    // Select first file if this is the first upload
    if (mediaFiles.length === 0 && newFiles.length > 0) {
      setSelectedMediaIndex(0);
    }

    setActivePanel('');
  }, [mediaFiles.length]);

  const processMusicFiles = useCallback((files) => {
    const newMusicFiles = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: 'audio',
      name: file.name,
      start: 0,
      end: null,
    }));

    setMusicFiles((prev) => [...prev, ...newMusicFiles]);
    setActivePanel('');
  }, []);

  const handleFileChange = useCallback((e) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
  }, [processFiles]);

  const handleMusicFileChange = useCallback((e) => {
    if (!e.target.files) return;
    processMusicFiles(Array.from(e.target.files));
  }, [processMusicFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const handleMusicDrop = useCallback((e) => {
    e.preventDefault();
    processMusicFiles(Array.from(e.dataTransfer.files));
  }, [processMusicFiles]);

  const handleDragOver = useCallback((e) => e.preventDefault(), []);

  const handleMenuClick = useCallback((menuName) => {
    setActivePanel((prev) => (prev === menuName ? '' : menuName));
  }, []);

  const handleAddText = useCallback((text, font) => {
    setTextElements((prev) => [
      ...prev,
      {
        text,
        font,
        x: 100,
        y: 100,
        fontSize: 28,
        color: '#ffffff'
      },
    ]);
    setActivePanel('');
  }, []);

  const handleRemoveMusic = useCallback((index) => {
    setMusicFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCanvasSizeSelect = useCallback((size) => {
    setCanvasSize({ width: size.width, height: size.height });
    setActivePanel('');
  }, []);

  const handleTransitionSelect = useCallback((transition) => {
    setSelectedTransition(transition);
    setActivePanel('');
  }, []);

  return (
    <div className="flex flex-col h-screen w-383">
      <Topbar onNewVideo={resetProject} />

      <div className="flex flex-1 relative">
        <Sidebar activePanel={activePanel} onMenuClick={handleMenuClick} />

        {/* Sidebar Panels */}
        <div className="absolute left-20 top-0 bottom-0 z-10">
          {activePanel === 'Files' && (
            <div className="w-80 h-full">
              <UploadPanel
                handleFileChange={handleFileChange}
                handleDrop={handleDrop}
                handleDragOver={handleDragOver}
              />
            </div>
          )}

          {activePanel === 'Text' && (
            <div className="w-80 h-full">
              <TextPanel handleAddText={handleAddText} />
            </div>
          )}

          {activePanel === 'Music' && (
            <div className="w-80 h-full">
              <MusicPanel
                handleFileChange={handleMusicFileChange}
                handleDrop={handleMusicDrop}
                handleDragOver={handleDragOver}
                musicFiles={musicFiles}
                onRemoveMusic={handleRemoveMusic}
              />
            </div>
          )}

          {activePanel === 'Canvas' && (
            <div className="w-80 h-full">
              <CanvasChoose onSizeSelect={handleCanvasSizeSelect} />
            </div>
          )}

          {activePanel === 'Transition' && (
            <div className="w-80 h-full">
              <TransitionPanel onTransitionSelect={handleTransitionSelect} />
            </div>
          )}

          {activePanel === 'Save' && (
            <div className="w-80 h-full">
              <SavePanel mergedVideoUrl={mergedVideoUrl} />
            </div>
          )}
        </div>

        {/* Canvas - Now it will stay in place */}
        <div className="flex-1 relative bg-gray">
          <Canvas
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            textElements={textElements}
            setTextElements={setTextElements}
            selectedMediaIndex={selectedMediaIndex}
            setSelectedMediaIndex={setSelectedMediaIndex}
            musicFiles={musicFiles}
            setMergedVideoUrl={setMergedVideoUrl}
            canvasSize={canvasSize}
            selectedTransition={selectedTransition}
          />
        </div>
      </div>

      <div className='border border-white'>
        <Timeline
          mediaFiles={mediaFiles}
          setMediaFiles={setMediaFiles}
          currentTime={0}
          onSelect={setSelectedMediaIndex}
          selectedMediaIndex={selectedMediaIndex}
          musicFiles={musicFiles}
        />
      </div>
    </div>
  );
}

export default App;