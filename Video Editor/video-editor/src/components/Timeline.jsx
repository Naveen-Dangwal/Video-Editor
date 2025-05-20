import React, { useState, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const widthPerSecond = 120;
const defaultDuration = 30;

function SortableItem({ media, index, onDelete, onSelect, onTrim }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: media.url });
  const [isTrimmingLeft, setIsTrimmingLeft] = useState(false);
  const [isTrimmingRight, setIsTrimmingRight] = useState(false);
  const [trimStart, setTrimStart] = useState(media.trimStart || 0);
  const [trimEnd, setTrimEnd] = useState(
    media.trimEnd || media.duration || defaultDuration
  );
  const itemRef = useRef(null);

  const dur = media.trimmed
    ? trimEnd - trimStart
    : media.duration || defaultDuration;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${dur * widthPerSecond}px`,
    position: "absolute",
    left: `${media.start * widthPerSecond}px`,
    cursor: "pointer",
  };

  const handleMouseMove = (e) => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / widthPerSecond;

    if (isTrimmingLeft) {
      const newStart = Math.max(0, Math.min(position, trimEnd - 0.1));
      setTrimStart(newStart);
    } else if (isTrimmingRight) {
      const newEnd = Math.max(trimStart + 0.1, Math.min(position, dur));
      setTrimEnd(newEnd);
    }
  };

  const handleMouseUp = () => {
    if (isTrimmingLeft || isTrimmingRight) {
      setIsTrimmingLeft(false);
      setIsTrimmingRight(false);
      if (
        media.type === "image" &&
        (trimStart !== (media.trimStart || 0) ||
          trimEnd !== (media.trimEnd || media.duration || defaultDuration))
      ) {
        onTrim(index, trimStart, trimEnd);
      }
    }
  };

  useEffect(() => {
    if (isTrimmingLeft || isTrimmingRight) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isTrimmingLeft, isTrimmingRight, trimStart, trimEnd]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(index)}
      className="h-13 border-2 border-green-400 bg-gray rounded-lg overflow-hidden flex-shrink-0 p-1 shadow relative group"
    >
      {/* <div className="absolute top-0 left-0 w-full text-[10px] text-center text-gray-300 bg-black bg-opacity-50 z-3">
        {`Start: ${media.start || 0}s | Duration: ${dur.toFixed(1)}s${media.trimmed ? ' (trimmed)' : ''}`}
      </div> */}

      {media.type === "video" ? (
        <video src={media.url} className="w-full h-full object-cover" />
      ) : (
        <div ref={itemRef} className="relative w-full h-full">
          <img
            src={media.url}
            alt={media.name}
            className="w-full h-full object-cover"
          />
          {/* Left trim handle */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-2 cursor-col-resize ${
              media.type === "image"
                ? "group-hover:bg-yellow-400 bg-opacity-50"
                : ""
            }`}
            onMouseDown={(e) => {
              if (media.type === "image") {
                e.stopPropagation();
                setIsTrimmingLeft(true);
              }
            }}
          >
            {media.type === "image" && (
              <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-white" />
            )}
          </div>

          {/* Right trim handle */}
          <div
            className={`absolute top-0 bottom-0 right-0 w-2 cursor-col-resize ${
              media.type === "image"
                ? "group-hover:bg-yellow-400 bg-opacity-50"
                : ""
            }`}
            onMouseDown={(e) => {
              if (media.type === "image") {
                e.stopPropagation();
                setIsTrimmingRight(true);
              }
            }}
          >
            {media.type === "image" && (
              <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-white" />
            )}
          </div>
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        className="absolute mt-3 mr-5 top-0 right-1 p-0 bg-black bg-opacity-50 rounded-full text-white text-sm/0"
      >
        ❌
      </button>
    </div>
  );
}

function MusicTrack({ music, index, onDelete }) {
  return (
    <div className="relative h-13 border-2 border-blue-400 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 p-1 shadow group">
      <div className="flex items-center h-full">
        <div className="text-blue-400 mr-2">♪</div>
        <div className="text-sm truncate">{music.name}</div>
      </div>
      <button
        onClick={() => onDelete(index)}
        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ❌
      </button>
    </div>
  );
}

function TimeScale({ duration = 0, interval = 1 }) {
  const marks = [];

  for (let i = 0; i <= duration; i += interval) {
    const majorLeft = i * widthPerSecond;

    // Major mark (every full second)
    marks.push(
      <div
        key={`major-${i}`}
        className="absolute flex flex-col items-center"
        style={{ left: `${majorLeft}px` }}
      >
        <div className="w-0.5 h-3 bg-blue-400 mb-0.5 rounded" />
        <span className="text-[10px] text-gray-300">{i}s</span>
      </div>
    );

    // Minor marks (1/5th second ticks)
    if (i < duration) {
      for (let j = 1; j < 5; j++) {
        const minorLeft = majorLeft + (j * widthPerSecond) / 5;
        marks.push(
          <div
            key={`minor-${i}-${j}`}
            className="absolute"
            style={{ left: `${minorLeft}px` }}
          >
            <div className="w-0.5 h-1 bg-gray-400 rounded" />
          </div>
        );
      }
    }
  }

  return (
    <div className="relative h-6 mb-2 bg-black rounded-md shadow-inner overflow-hidden">
      <div
        className="relative h-full"
        style={{ width: `${duration * widthPerSecond}px` }}
      >
        {marks}
      </div>
    </div>
  );
}

export default function Timeline({
  mediaFiles,
  setMediaFiles,
  currentTime = 0,
  onSelect,
  selectedMediaIndex,
  musicFiles,
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMediaFiles((files) => {
        const oldIndex = files.findIndex((m) => m.url === active.id);
        const newIndex = files.findIndex((m) => m.url === over.id);
        const reordered = arrayMove(files, oldIndex, newIndex);

        let current = 0;
        return reordered.map((m) => {
          const duration = m.trimmed
            ? m.trimEnd - m.trimStart
            : m.duration || defaultDuration;
          const updated = { ...m, start: current, duration };
          current += duration;
          return updated;
        });
      });
    }
  };

  const handleDelete = (idx) => {
    setMediaFiles((files) => {
      const updated = files.filter((_, i) => i !== idx);
      let current = 0;
      return updated.map((m) => {
        const duration = m.trimmed
          ? m.trimEnd - m.trimStart
          : m.duration || defaultDuration;
        const updatedItem = { ...m, start: current, duration };
        current += duration;
        return updatedItem;
      });
    });
  };

  const handleTrim = (index, start, end) => {
    setMediaFiles((files) => {
      const duration = end - start;
      return files.map((m, i) => {
        if (i === index) {
          return {
            ...m,
            trimmed: true,
            trimStart: start,
            trimEnd: end,
            duration: duration,
          };
        }
        return m;
      });
    });
  };

  const handleDeleteMusic = (idx) => {
    setMusicFiles((files) => files.filter((_, i) => i !== idx));
  };

  const spacedMedia = mediaFiles.map((m, idx) => {
    const start =
      idx === 0
        ? 0
        : mediaFiles
            .slice(0, idx)
            .reduce(
              (sum, mf) =>
                sum +
                (mf.trimmed
                  ? mf.trimEnd - mf.trimStart
                  : mf.type === "image"
                  ? 5
                  : mf.duration || defaultDuration),
              0
            );

    const duration = m.trimmed
      ? m.trimEnd - m.trimStart
      : m.type === "image"
      ? 5
      : m.duration || defaultDuration;

    return { ...m, start, duration };
  });

  const totalDuration = spacedMedia.reduce(
    (sum, media) => sum + media.duration,
    0
  );

  return (
    <div className="h-30 bg-yellow px-4 py-3 text-white overflow-x-auto whitespace-nowrap w-full">
      {mediaFiles.length === 0 && musicFiles.length === 0 ? (
        <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm select-none border border-white">
          Time Line Section
        </div>
      ) : (
        <>
          <TimeScale duration={totalDuration} />

          {/* Music Tracks */}
          {musicFiles.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Music Tracks</div>
              <div className="flex gap-2">
                {musicFiles.map((music, idx) => (
                  <MusicTrack
                    key={music.url}
                    music={music}
                    index={idx}
                    onDelete={handleDeleteMusic}
                  />
                ))}
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={spacedMedia.map((m) => m.url)}
              strategy={horizontalListSortingStrategy}
            >
              <div
                className="relative h-24"
                style={{ width: `${totalDuration * widthPerSecond}px` }}
              >
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20"
                  style={{ left: `${currentTime * widthPerSecond}px` }}
                />
                {spacedMedia.map((media, idx) => (
                  <SortableItem
                    key={media.url}
                    media={media}
                    index={idx}
                    onDelete={handleDelete}
                    onSelect={onSelect}
                    onTrim={handleTrim}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
