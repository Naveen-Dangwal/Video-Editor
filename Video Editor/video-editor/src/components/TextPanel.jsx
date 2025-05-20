// src/components/TextPanel.jsx
import { useState, useEffect } from "react";
import WebFont from "webfontloader";

const fonts = [
  "Open Sans",
  "Pacifico",
  "Amatic SC",
  "Yanone Kaffeesatz",
  "Oswald",
  "Lora",
  "Kelly Slab",
];

export default function TextPanel({ handleAddText }) {
  const [text, setText] = useState("");

  useEffect(() => {
    WebFont.load({
      google: { families: fonts },
    });
  }, []);

  return (
    <div className="bg-black text-white p-4 h-full overflow-y-auto border border-white">
      <h2 className="text-white text-lg font-semibold mb-4">Add text</h2>

      {/* Text input */}
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text..."
        className="w-full mb-4 p-2 bg-gray-800 rounded-md text-white focus:outline-none border border-white"
      />

      {/* Font buttons */}
      <div className="flex flex-col gap-3">
        {fonts.map((font) => (
          <button
            key={font}
            onClick={() => {
              if (text.trim()) {
                handleAddText(text.trim(), font);
                setText("");
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 p-3 rounded-md text-center transition-all border border-gray-700"
            style={{ fontFamily: font }}
          >
            {font}
          </button>
        ))}
      </div>
    </div>
  );
}
