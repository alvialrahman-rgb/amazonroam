"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Star, SlidersHorizontal } from "lucide-react";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { Place, PlaceCategory } from "@/types";

const categories: { id: PlaceCategory | "ALL"; label: string; emoji: string }[] = [
  { id: "ALL", label: "All", emoji: "✨" },
  { id: "FOOD", label: "Food", emoji: "🍽️" },
  { id: "CULTURE", label: "Culture", emoji: "🏛️" },
  { id: "OUTDOORS", label: "Outdoors", emoji: "🌿" },
  { id: "NIGHTLIFE", label: "Nightlife", emoji: "🍸" },
  { id: "WELLNESS", label: "Wellness", emoji: "🧘" },
  { id: "ENTERTAINMENT", label: "Shows", emoji: "🎭" },
];

const samplePlaces: Place[] = [
  {
    id: "e1",
    name: "Pike Place Market",
    category: "FOOD",
    address: "85 Pike St, Seattle, WA",
    latitude: 47.6097,
    longitude: -122.3425,
    rating: 4.8,
    amazonRating: 4.9,
    priceLevel: 2,
    description: "Iconic farmer's market - a must-visit for any Seattle trip.",
    imageUrl: "",
  },
  {
    id: "e2",
    name: "Museum of Pop Culture",
    category: "CULTURE",
    address: "325 5th Ave N, Seattle, WA",
    latitude: 47.6215,
    longitude: -122.3481,
    rating: 4.6,
    amazonRating: 4.7,
    priceLevel: 2,
    description: "Interactive museum with music, sci-fi, and pop culture exhibits.",
    imageUrl: "",
  },
  {
    id: "e3",
    name: "Discovery Park",
    category: "OUTDOORS",
    address: "3801 Discovery Park Blvd, Seattle, WA",
    latitude: 47.6573,
    longitude: -122.4057,
    rating: 4.7,
    amazonRating: 4.8,
    priceLevel: 0,
    description: "Beautiful coastal trails with views of Puget Sound and the Olympics.",
    imageUrl: "",
  },
  {
    id: "e4",
    name: "The Walrus and the Carpenter",
    category: "NIGHTLIFE",
    address: "4743 Ballard Ave NW, Seattle, WA",
    latitude: 47.6644,
    longitude: -122.3841,
    rating: 4.6,
    amazonRating: 4.7,
    priceLevel: 3,
    description: "Trendy oyster bar with craft cocktails in the Ballard neighborhood.",
    imageUrl: "",
  },
  {
    id: "e5",
    name: "Banya 5",
    category: "WELLNESS",
    address: "216 9th Ave N, Seattle, WA",
    latitude: 47.6193,
    longitude: -122.3423,
    rating: 4.5,
    amazonRating: 4.6,
    priceLevel: 3,
    description: "Russian-style bathhouse - perfect for unwinding after a long day.",
    imageUrl: "",
  },
  {
    id: "e6",
    name: "Kerry Park",
    category: "OUTDOORS",
    address: "211 W Highland Dr, Seattle, WA",
    latitude: 47.6295,
    longitude: -122.3596,
    rating: 4.7,
    amazonRating: 4.6,
    priceLevel: 0,
    description: "The most iconic viewpoint in Seattle. Best at sunset.",
    imageUrl: "",
  },
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaces = samplePlaces.filter((place) => {
    const matchesCategory =
      selectedCategory === "ALL" || place.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-amazon-dark">Explore</h1>
        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search places, activities..."
          className="input-field pl-12"
        />
      </div>

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
        {filteredPlaces.map((place, index) => (
          <motion.div
            key={place.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card flex gap-3"
          >
            {/* Placeholder Image */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-gray-400" />
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
                {place.priceLevel !== undefined && (
                  <span className="text-[10px] text-gray-400">
                    {"$".repeat(place.priceLevel || 1)}
                  </span>
                )}
              </div>

              {place.description && (
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                  {place.description}
                </p>
              )}

              {place.amazonRating && (
                <div className="mt-1.5 inline-flex items-center gap-1 badge bg-amazon-teal/10 text-amazon-teal text-[10px]">
                  🏢 Amazon Rating: {place.amazonRating}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
