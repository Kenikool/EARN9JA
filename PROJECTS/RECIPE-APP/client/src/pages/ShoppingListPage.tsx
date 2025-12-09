import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, X } from "lucide-react";
import { ShoppingList } from "../components/shopping/ShoppingList";
import { LoadingPage } from "../components/common/LoadingSpinner";
import { useShoppingListStore } from "../stores/shoppingListStore";
import { useAuthStore } from "../stores/authStore";
import { toast } from "react-hot-toast";

export const ShoppingListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentList,
    isLoading,
    fetchShoppingLists,
    updateItemStatus,
    removeItem,
    addItem,
    deleteShoppingList,
  } = useShoppingListStore();

  const [showAddItemModal, setShowAddItemModal] = React.useState(false);
  const [showGenerateModal, setShowGenerateModal] = React.useState(false);
  const [newItem, setNewItem] = React.useState({
    ingredient: "",
    amount: 1,
    unit: "piece",
    category: "other",
  });

  React.useEffect(() => {
    if (user) {
      loadShoppingList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadShoppingList = async () => {
    await fetchShoppingLists();
  };

  const handleToggleItem = async (index: number, checked: boolean) => {
    if (currentList) {
      await updateItemStatus(currentList._id, index, checked);
    }
  };

  const handleDeleteItem = async (index: number) => {
    if (currentList) {
      await removeItem(currentList._id, index);
    }
  };

  const handleAddItem = async () => {
    if (!currentList) {
      toast.error("No shopping list found");
      return;
    }

    if (!newItem.ingredient.trim()) {
      toast.error("Please enter an ingredient name");
      return;
    }

    await addItem(currentList._id, newItem);
    setNewItem({
      ingredient: "",
      amount: 1,
      unit: "piece",
      category: "other",
    });
    setShowAddItemModal(false);
  };

  const handleClearChecked = async () => {
    if (!currentList) return;

    const checkedIndices = currentList.items
      .map((item, index) => (item.checked ? index : -1))
      .filter((index) => index !== -1)
      .reverse(); // Remove from end to start to maintain indices

    for (const index of checkedIndices) {
      await removeItem(currentList._id, index);
    }

    toast.success("Checked items cleared");
  };

  const handleClearAll = async () => {
    if (!currentList) return;

    if (
      window.confirm(
        "Are you sure you want to clear all items from this shopping list?"
      )
    ) {
      await deleteShoppingList(currentList._id);
      toast.success("Shopping list cleared");
    }
  };

  const handleGenerateFromMealPlan = () => {
    navigate("/meal-planner");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to view your shopping list
          </h2>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shopping List
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your grocery shopping efficiently
              </p>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar size={16} className="mr-2" />
                Generate from Meal Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {currentList ? (
            <ShoppingList
              shoppingList={currentList}
              onToggleItem={handleToggleItem}
              onDeleteItem={handleDeleteItem}
              onAddItem={() => setShowAddItemModal(true)}
              onClearChecked={handleClearChecked}
              onClearAll={handleClearAll}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Shopping List Yet
              </h2>
              <p className="text-gray-600 mb-6">
                Create a shopping list from your meal plan or add items manually
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Create Custom List
                </button>
                <button
                  onClick={handleGenerateFromMealPlan}
                  className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={20} className="mr-2" />
                  Generate from Meal Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Item</h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient *
                </label>
                <input
                  type="text"
                  value={newItem.ingredient}
                  onChange={(e) =>
                    setNewItem({ ...newItem, ingredient: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g., Tomatoes"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    value={newItem.amount}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        amount: parseFloat(e.target.value) || 1,
                      })
                    }
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit *
                  </label>
                  <select
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="piece">piece</option>
                    <option value="lb">lb</option>
                    <option value="oz">oz</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="cup">cup</option>
                    <option value="tbsp">tbsp</option>
                    <option value="tsp">tsp</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="produce">Produce</option>
                  <option value="dairy">Dairy</option>
                  <option value="meat">Meat</option>
                  <option value="seafood">Seafood</option>
                  <option value="bakery">Bakery</option>
                  <option value="pantry">Pantry</option>
                  <option value="spices">Spices</option>
                  <option value="beverages">Beverages</option>
                  <option value="frozen">Frozen</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Generate Shopping List
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Go to your meal planner to generate a shopping list from your
              planned meals for the week.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateFromMealPlan}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Go to Meal Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListPage;
