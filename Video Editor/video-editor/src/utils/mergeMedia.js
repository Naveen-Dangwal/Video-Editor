export async function mergeMediaFiles(mediaFiles, musicFiles, canvasSize, selectedTransition, progressCallback) {
  try {
    if (!mediaFiles || mediaFiles.length === 0) {
      throw new Error("No media files to merge");
    }

    progressCallback(5);

    // Create canvas for processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Set canvas dimensions based on selected size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Process each media file with proper timing
    const mediaElements = [];
    for (let i = 0; i < mediaFiles.length; i++) {
      const media = mediaFiles[i];
      const element = await createMediaElement(media, canvas);
      if (element) {
        mediaElements.push(element);
      }
      progressCallback(5 + (i / mediaFiles.length) * 70);
    }

    if (mediaElements.length === 0) {
      throw new Error("No valid media elements to merge");
    }

    // Create final video with audio
    const outputBlob = await recordMediaElements(mediaElements, canvas, musicFiles, selectedTransition, progressCallback);
    progressCallback(95);

    const mergedUrl = URL.createObjectURL(outputBlob);
    progressCallback(100);
    return mergedUrl;
  } catch (error) {
    console.error('Error merging media:', error);
    throw error;
  }
}

async function getMediaDimensions(media) {
  return new Promise((resolve) => {
    if (media.type === 'video') {
      const video = document.createElement('video');
      video.src = media.url;
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight });
        video.remove();
      };
      video.onerror = () => resolve({ width: 0, height: 0 });
    } else {
      const img = new Image();
      img.src = media.url;
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => resolve({ width: 0, height: 0 });
    }
  });
}

async function createMediaElement(media, canvas) {
  if (media.type === 'video') {
    return await createVideoElement(media, canvas);
  } else {
    return await createImageElement(media, canvas);
  }
}

function createVideoElement(videoMedia) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoMedia.url;
    video.muted = true;
    video.playsInline = true;
    
    video.onloadedmetadata = () => {
      resolve({
        type: 'video',
        element: video,
        duration: video.duration * 1000, // convert to ms
        width: video.videoWidth,
        height: video.videoHeight
      });
    };
    
    video.onerror = () => resolve(null);
  });
}

function createImageElement(imageMedia) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageMedia.url;
    
    img.onload = () => {
      // Use trimmed duration if available, otherwise default to 5 seconds
      const duration = imageMedia.trimmed 
        ? (imageMedia.trimEnd - imageMedia.trimStart) * 1000 // convert to ms
        : 5000; // default 5 seconds for images
      
      resolve({
        type: 'image',
        element: img,
        duration: duration,
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = () => resolve(null);
  });
}

async function recordMediaElements(mediaElements, canvas, musicFiles, selectedTransition, progressCallback) {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream();
    
    // Add audio tracks if available
    if (musicFiles && musicFiles.length > 0) {
      const audioContext = new AudioContext();
      const audioDestination = audioContext.createMediaStreamDestination();
      
      musicFiles.forEach(music => {
        const audio = new Audio(music.url);
        const source = audioContext.createMediaElementSource(audio);
        source.connect(audioDestination);
        audio.loop = true;
        audio.play();
      });

      audioDestination.stream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });
    }

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000
    });

    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    let currentElementIndex = 0;
    let startTime = 0;
    let isPlaying = false;
    const transitionDuration = 500; // 500ms transition duration

    function drawFrame() {
      if (currentElementIndex >= mediaElements.length) {
        mediaRecorder.stop();
        return;
      }

      const currentElement = mediaElements[currentElementIndex];
      const currentTime = performance.now() - startTime;
      const nextElement = mediaElements[currentElementIndex + 1];

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw current element
      if (currentElement.type === 'video') {
        const video = currentElement.element;
        if (!isPlaying) {
          video.currentTime = 0;
          video.play().catch(e => console.error("Video play error:", e));
          isPlaying = true;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(currentElement.element, 0, 0, canvas.width, canvas.height);
      }

      // Apply transition if needed
      if (nextElement && currentTime >= currentElement.duration - transitionDuration) {
        const transitionProgress = (currentTime - (currentElement.duration - transitionDuration)) / transitionDuration;
        
        if (selectedTransition.type !== 'none') {
          ctx.globalAlpha = 1 - transitionProgress;
          ctx.drawImage(currentElement.type === 'video' ? currentElement.element : currentElement.element, 0, 0, canvas.width, canvas.height);
          
          ctx.globalAlpha = transitionProgress;
          if (nextElement.type === 'video') {
            const nextVideo = nextElement.element;
            nextVideo.currentTime = 0;
            nextVideo.play().catch(e => console.error("Video play error:", e));
          }
          
          // Apply transition effect
          switch (selectedTransition.type) {
            case 'fade':
              // Fade is handled by globalAlpha above
              break;
            case 'slideLeft':
              ctx.drawImage(nextElement.element, 
                -canvas.width * (1 - transitionProgress), 0, canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height);
              break;
            case 'slideRight':
              ctx.drawImage(nextElement.element,
                canvas.width * (1 - transitionProgress), 0, canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height);
              break;
            case 'slideUp':
              ctx.drawImage(nextElement.element,
                0, canvas.height * (1 - transitionProgress), canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height);
              break;
            case 'slideDown':
              ctx.drawImage(nextElement.element,
                0, -canvas.height * (1 - transitionProgress), canvas.width, canvas.height,
                0, 0, canvas.width, canvas.height);
              break;
            case 'zoomIn':
              const scale = 1 + transitionProgress;
              ctx.drawImage(nextElement.element,
                canvas.width / 2 - (canvas.width * scale) / 2,
                canvas.height / 2 - (canvas.height * scale) / 2,
                canvas.width * scale,
                canvas.height * scale);
              break;
            case 'zoomOut':
              const scaleOut = 2 - transitionProgress;
              ctx.drawImage(nextElement.element,
                canvas.width / 2 - (canvas.width * scaleOut) / 2,
                canvas.height / 2 - (canvas.height * scaleOut) / 2,
                canvas.width * scaleOut,
                canvas.height * scaleOut);
              break;
            case 'blur':
              ctx.filter = `blur(${(1 - transitionProgress) * 10}px)`;
              ctx.drawImage(nextElement.element, 0, 0, canvas.width, canvas.height);
              ctx.filter = 'none';
              break;
          }
        }
      }

      // Check if we should move to next element
      if (currentTime >= currentElement.duration) {
        if (currentElement.type === 'video') {
          currentElement.element.pause();
        }
        currentElementIndex++;
        startTime = performance.now();
        isPlaying = false;
      }

      requestAnimationFrame(drawFrame);
    }

    mediaRecorder.start();
    startTime = performance.now();
    drawFrame();
  });
}