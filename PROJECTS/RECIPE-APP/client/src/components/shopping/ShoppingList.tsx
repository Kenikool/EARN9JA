import React from "react";
import { Plus, Trash2, CheckCircle2, ShoppingCart } from "lucide-react";
import { CategoryGroup } from "./CategoryGroup";
import type {
  ShoppingList as ShoppingListType,
  ShoppingListItem,
} from "../../types/shopping";

interface ShoppingListProps {
  shoppingList: ShoppingListType;
  onToggleItem: (index: number, checked: boolean) => void;
  onEditItem?: (index: number) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
  onClearChecked: () => void;
  onClearAll: () => void;
}

// Helper function to categorize items
const categorizeItems = (items: ShoppingListItem[]) => {
  const categories: Record<
    string,
    Array<{ item: ShoppingListItem; index: number }>
  > = {};

  items.forEach((item, index) => {
    const category = item.category || "other";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({ item, index });
  });

  return categories;
};

export const ShoppingList: React.FC<ShoppingListProps> = ({
  shoppingList,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onClearChecked,
  onClearAll,
}) => {
  const categorizedItems = categorizeItems(shoppingList.items);
  const checkedCount = shoppingList.items.filter((item) => item.checked).length;
  const totalCount = shoppingList.items.length;
  const hasCheckedItems = checkedCount > 0;
  const allChecked = checkedCount === totalCount && totalCount > 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Shopping List</h2>
              <p className="text-sm text-gray-600">
                {checkedCount} of {totalCount} items checked
              </p>
            </div>
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((checkedCount / totalCount) * 100)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={onAddItem}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Item
          </button>

          {hasCheckedItems && (
            <button
              onClick={onClearChecked}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 size={16} className="mr-2" />
              Clear Checked
            </button>
          )}

          {totalCount > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* All Complete Message */}
        {allChecked && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle2 size={20} />
              <span className="font-medium">
                All items checked! Ready to clear the list.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shopping List Items by Category */}
      {totalCount > 0 ? (
        <div className="space-y-4">
          {Object.entries(categorizedItems)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, items]) => (
              <CategoryGroup
                key={category}
                category={category}
                items={items}
                onToggle={onToggleItem}
                onEdit={onEditItem}
                onDelete={onDeleteItem}
              />
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your shopping list is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Add items manually or generate from your meal plan
          </p>
          <button
            onClick={onAddItem}
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Add Your First Item
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
