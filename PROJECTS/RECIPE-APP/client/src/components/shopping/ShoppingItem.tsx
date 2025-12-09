import React from "react";
import { Check, Edit2, Trash2 } from "lucide-react";
import type { ShoppingListItem } from "../../types/shopping";

interface ShoppingItemProps {
  item: ShoppingListItem;
  index: number;
  onToggle: (index: number, checked: boolean) => void;
  onEdit?: (index: number) => void;
  onDelete: (index: number) => void;
}

export const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  index,
  onToggle,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        item.checked
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-300 hover:border-orange-300"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(index, !item.checked)}
        className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
          item.checked
            ? "bg-orange-600 border-orange-600"
            : "border-gray-300 hover:border-orange-500"
        }`}
      >
        {item.checked && <Check size={16} className="text-white" />}
      </button>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium ${
            item.checked ? "line-through text-gray-400" : "text-gray-900"
          }`}
        >
          {item.ingredient}
        </div>
        <div
          className={`text-sm ${
            item.checked ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {item.amount} {item.unit}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {onEdit && !item.checked && (
          <button
            onClick={() => onEdit(index)}
            className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
            title="Edit item"
          >
            <Edit2 size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(index)}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ShoppingItem;
