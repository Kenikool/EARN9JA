import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMealPlanStore } from "../../stores/mealPlanStore";
import { mealPlanAPI } from "../../services/api";
import DayView from "./DayView";

interface MealCalendarProps {
  onSelectRecipe?: (mealType: string, date: string) => void;
}

export const MealCalendar: React.FC<MealCalendarProps> = ({
  onSelectRecipe,
}) => {
  const { currentDate, setCurrentDate } = useMealPlanStore();
  const [viewMode, setViewMode] = React.useState<"week" | "day">("week");

  // Calculate the start and end dates for the current view
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "week") {
      const dayOfWeek = start.getDay();
      start.setDate(start.getDate() - dayOfWeek);
      end.setDate(start.getDate() + 6);
    } else {
      // Day view - just show current day
      end.setDate(start.getDate());
    }

    return { start, end };
  };

  // Generate array of dates for the current view
  const getDatesArray = () => {
    const { start, end } = getDateRange();
    const dates = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Use React Query to fetch meal plans
  const { start, end } = getDateRange();
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const {
    data: mealPlansData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["mealPlans", startDate, endDate],
    queryFn: () => mealPlanAPI.getMealPlansByDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });

  const mealPlans = mealPlansData?.data?.data || [];

  // Get meal plan for a specific date
  const getMealPlanForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return mealPlans.find((mp: { date: string }) =>
      mp.date.startsWith(dateStr)
    );
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      (error as { response?: { status?: number } })?.response?.status === 401
        ? "Please log in to view your meal plans."
        : "Failed to load meal plans. Please try again.";

    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-600">
        <p className="text-red-600 mb-2">{errorMessage}</p>
        <p className="text-sm text-gray-500">
          You can start adding meals once you're logged in.
        </p>
      </div>
    );
  }

  const dates = getDatesArray();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 min-w-[150px] text-center">
            {formatMonthYear(currentDate)}
          </h2>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={goToToday}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("day")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                viewMode === "day"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                viewMode === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {viewMode === "week" ? (
          <>
            {/* Day headers - hidden on mobile */}
            <div className="hidden sm:grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center font-medium text-gray-500 text-xs sm:text-sm p-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Week view - responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-2 lg:gap-4">
              {dates.map((date) => (
                <div key={date.toISOString()} className="min-w-0">
                  <DayView
                    date={date}
                    mealPlan={getMealPlanForDate(date)}
                    onSelectRecipe={onSelectRecipe}
                    isToday={isToday(date)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Day view - single day full width */
          <div className="max-w-2xl mx-auto">
            {dates.map((date) => (
              <DayView
                key={date.toISOString()}
                date={date}
                mealPlan={getMealPlanForDate(date)}
                onSelectRecipe={onSelectRecipe}
                isToday={isToday(date)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>🥞</span>
          <span className="hidden sm:inline">Breakfast</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🍽️</span>
          <span className="hidden sm:inline">Lunch</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🍝</span>
          <span className="hidden sm:inline">Dinner</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🍪</span>
          <span className="hidden sm:inline">Snacks</span>
        </div>
      </div>
    </div>
  );
};

export default MealCalendar;
