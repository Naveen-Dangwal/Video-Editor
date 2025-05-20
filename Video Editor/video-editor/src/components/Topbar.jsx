export default function Topbar({ onNewVideo }) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray text-white border border-white">
      <div>
        <button className="mr-4">← My Projects</button>
        <button onClick={onNewVideo}>New Video</button>
      </div>
      <div>
        <button>Log In</button>
      </div>
    </div>
  );
}
