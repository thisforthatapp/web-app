import { FC, useState } from "react";

interface NavItem {
  id: string;
  label: string;
  emoji: string;
}

interface UserNavigationProps {
  onNavigationChange: (id: string) => void;
}

const navItems: NavItem[] = [
  { id: "nfts_ok", label: "NFTs I Will Trade", emoji: "✅" },
  { id: "nfts_not_ok", label: "NFTS I Won't Trade", emoji: "❌" },
  { id: "swaps", label: "Swaps", emoji: "🤝" },
  { id: "pinned", label: "Pinned", emoji: "📌" },
];

const UserNavigation: FC<UserNavigationProps> = ({ onNavigationChange }) => {
  const [activeItem, setActiveItem] = useState<string>("home");

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    onNavigationChange(id);
  };

  return (
    <ul className="flex flex-wrap justify-center items-center p-2">
      {navItems.map((item) => (
        <li key={item.id} className="m-2">
          <button
            onClick={() => handleItemClick(item.id)}
            className={`
                flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border borer-gray-200
                ${
                  activeItem === item.id
                    ? "bg-gray-800 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
          >
            <span className="mr-2 text-lg">{item.emoji}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default UserNavigation;
