export default function UploadPanel({
  handleFileChange,
  handleDrop,
  handleDragOver,
}) {
  return (
    <div
      className="bg-grey text-white p-4 border border-white flex flex-col items-center justify-center h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label
        htmlFor="file-upload"
        className="border-2 border-dashed border-yellow-400 p-10 text-center cursor-pointer w-full"
      >
        <p className="text-lg mb-2">Add Files</p>
        <p className="text-sm">or drop files here</p>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="video/*,image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
