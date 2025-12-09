import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ShoppingItem } from "./ShoppingItem";
import type { ShoppingListItem } from "../../types/shopping";

interface CategoryGroupProps {
  category: string;
  items: Array<{ item: ShoppingListItem; index: number }>;
  onToggle: (index: number, checked: boolean) => void;
  onEdit?: (index: number) => void;
  onDelete: (index: number) => void;
}

const categoryIcons: Record<string, string> = {
  produce: "🥬",
  dairy: "🥛",
  meat: "🥩",
  seafood: "🐟",
  bakery: "🍞",
  pantry: "🥫",
  spices: "🧂",
  beverages: "🥤",
  frozen: "❄️",
  other: "📦",
};

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  category,
  items,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const checkedCount = items.filter((i) => i.item.checked).length;
  const totalCount = items.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Category Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {categoryIcons[category.toLowerCase()] || categoryIcons.other}
          </span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 capitalize">
              {category}
            </h3>
            <p className="text-sm text-gray-500">
              {checkedCount} of {totalCount} checked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {checkedCount === totalCount && totalCount > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Complete
            </span>
          )}
          {isCollapsed ? (
            <ChevronDown size={20} className="text-gray-400" />
          ) : (
            <ChevronUp size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Category Items */}
      {!isCollapsed && (
        <div className="p-4 pt-0 space-y-2">
          {items.map(({ item, index }) => (
            <ShoppingItem
              key={index}
              item={item}
              index={index}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryGroup;
