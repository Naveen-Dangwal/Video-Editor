import { FaFileAlt, FaFont, FaFolderOpen, FaPaintBrush, FaRandom, FaMicrophone, FaSave, FaMusic } from 'react-icons/fa';

const menus = [
  { name: "Files", icon: <FaFileAlt /> },
  { name: "Text", icon: <FaFont /> },
  { name: "Music", icon: <FaMusic /> },
  { name: "Content Library", icon: <FaFolderOpen /> },
  { name: "Canvas", icon: <FaPaintBrush /> },
  { name: "Transition", icon: <FaRandom /> },
  { name: "Save", icon: <FaSave /> },
];

export default function Sidebar({ activePanel, onMenuClick }) {
  return (
    <div className="bg-gray text-white w-20 h-full p-4 flex flex-col items-center border border-y-white">
      {menus.map((menu) => (
        <div
          key={menu.name}
          className={`flex flex-col items-center mb-6 cursor-pointer text-xs ${
            activePanel === menu.name ? 'text-yellow-400' : 'hover:text-yellow-400'
          }`}
          onClick={() => onMenuClick(menu.name)}
        >
          <div className="text-2xl mb-1">{menu.icon}</div>
          <div className="text-[10px] text-center">{menu.name}</div>
        </div>
      ))}
    </div>
  );
}
