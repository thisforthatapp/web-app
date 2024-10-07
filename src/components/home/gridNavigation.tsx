import { FC } from "react";
import { GridTabOption } from "@/types/main";

interface GridNavItem {
  id: string;
  label: string;
  emoji: string;
}

interface GridNavigationProps {
  tabOption: string;
  onNavigationChange: (tabOption: GridTabOption) => void;
}

const navItems: GridNavItem[] = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "followers", label: "Following", emoji: "👥" },
  { id: "offers", label: "Offers", emoji: "🤝" },
  { id: "pinned", label: "Pinned", emoji: "📌" },
];

const GridNavigation: FC<GridNavigationProps> = ({
  tabOption,
  onNavigationChange,
}) => {
  const handleItemClick = (id: string) => {
    onNavigationChange(id as GridTabOption);
  };

  return (
    <ul className="flex flex-wrap justify-center items-center p-2 mt-4">
      {navItems.map((item) => (
        <li key={item.id} className="m-2">
          <button
            onClick={() => handleItemClick(item.id)}
            className={`
                flex items-center px-4 py-2 rounded-full transition-all duration-300 ease-in-out border borer-gray-200
                ${
                  tabOption === item.id
                    ? "bg-gray-700 text-white shadow-lg transform scale-105"
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

export default GridNavigation;
