"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, SlidersHorizontal, DollarSign, X } from "lucide-react";
import { CategoryBadge } from "@/components/ui/category-badge";
import { useStore } from "@/lib/store";
import { getAllPlaces } from "@/lib/places-data";
import type { Place, PlaceCategory } from "@/types";

const categories: { id: PlaceCategory | "ALL"; label: string; emoji: string }[] = [
  { id: "ALL", label: "All", emoji: "✨" },
  { id: "FOOD", label: "Food", emoji: "🍽" },
  { id: "CULTURE", label: "Culture", emoji: "🏛" },
  { id: "OUTDOORS", label: "Outdoors", emoji: "🌿" },
  { id: "NIGHTLIFE", label: "Nightlife", emoji: "🍸" },
  { id: "WELLNESS", label: "Wellness", emoji: "🧘" },
  { id: "ENTERTAINMENT", label: "Shows", emoji: "🎭" },
];

const cities = [
  "All Cities",
  "Seattle, WA",
  "Austin, TX",
  "New York, NY",
  "San Francisco, CA",
  "Nashville, TN",
  "Arlington, VA",
  "Vancouver, BC",
  "Oakville, ON",
  "Stoney Creek, ON",
  "Cambridge, ON",
  "Kitchener, ON",
];

const budgetOptions = [
  { id: "ALL", label: "Any Budget" },
  { id: "0", label: "Free" },
  { id: "1", label: "$" },
  { id: "2", label: "$$" },
  { id: "3", label: "$$$" },
];

export default function ExplorePage() {
  const { user } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "ALL">("ALL");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedBudget, setSelectedBudget] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(30);

  const allPlaces = useMemo(() => getAllPlaces(), []);

  const filteredPlaces = useMemo(() => {
    return allPlaces.filter((place) => {
      const matchesCategory =
        selectedCategory === "ALL" || place.category === selectedCategory;
      const matchesCity =
        selectedCity === "All Cities" ||
        place.address.toLowerCase().includes(selectedCity.toLowerCase().split(",")[0]);
      const matchesBudget =
        selectedBudget === "ALL" ||
        (place.priceLevel !== undefined && place.priceLevel <= parseInt(selectedBudget));
      const matchesSearch =
        !searchQuery ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesCity && matchesBudget && matchesSearch;
    });
  }, [allPlaces, selectedCategory, selectedCity, selectedBudget, searchQuery]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-amazon-dark">Explore</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {filteredPlaces.length} places found
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${
            showFilters ? "bg-amazon-orange/10 text-amazon-orange" : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search places, restaurants, parks..."
          className="input-field pl-12 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="card mb-4 space-y-3"
        >
          {/* City Filter */}
          <div>
            <label htmlFor="city-filter" className="text-xs font-medium text-gray-500 mb-1 block">
              City
            </label>
            <select
              id="city-filter"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field text-sm py-2"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Budget
            </label>
            <div className="flex gap-1.5">
              {budgetOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedBudget(opt.id)}
                  className={`badge py-1.5 px-3 transition-all text-xs ${
                    selectedBudget === opt.id
                      ? "bg-amazon-orange text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 badge py-2 px-3 transition-all ${
              selectedCategory === cat.id
                ? "bg-amazon-orange text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-amazon-orange/30"
            }`}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredPlaces.slice(0, visibleCount).map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="card flex gap-3"
          >
            {/* Category Icon */}
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">
                {place.category === "FOOD" && "🍽"}
                {place.category === "CULTURE" && "🏛"}
                {place.category === "OUTDOORS" && "🌿"}
                {place.category === "NIGHTLIFE" && "🍸"}
                {place.category === "WELLNESS" && "🧘"}
                {place.category === "SHOPPING" && "🛍"}
                {place.category === "ENTERTAINMENT" && "🎭"}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm text-gray-800 truncate">
                  {place.name}
                </h3>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Star className="w-3 h-3 text-amazon-orange fill-amazon-orange" />
                  <span className="text-xs font-medium">{place.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <CategoryBadge category={place.category} />
                {place.priceLevel !== undefined && place.priceLevel > 0 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    {"$".repeat(place.priceLevel)}
                  </span>
                )}
                {place.priceLevel === 0 && (
                  <span className="text-[10px] text-amazon-teal font-medium">
                    Free
                  </span>
                )}
              </div>

              {place.description && (
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                  {place.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {place.address.length > 35
                    ? place.address.substring(0, 35) + "..."
                    : place.address}
                </span>
                {place.amazonRating && (
                  <span className="badge bg-amazon-teal/10 text-amazon-teal text-[9px] py-0.5">
                    Amazon {place.amazonRating}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPlaces.length === 0 && (
          <div className="card text-center py-10">
            <Search className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">No places match your filters</p>
            <p className="text-xs text-gray-300 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {filteredPlaces.length > visibleCount && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 30)}
            className="btn-secondary w-full text-sm"
          >
            Load More ({filteredPlaces.length - visibleCount} remaining)
          </button>
        )}
      </div>
    </div>
  );
}
