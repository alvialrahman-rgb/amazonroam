"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { useStore } from "@/lib/store";

const popularDestinations = [
  { name: "Vancouver, BC", lat: 49.2827, lng: -123.1207, emoji: "🏔" },
  { name: "Seattle, WA", lat: 47.6062, lng: -122.3321, emoji: "🌲" },
  { name: "Oakville, ON", lat: 43.4675, lng: -79.6877, emoji: "🍁" },
  { name: "Stoney Creek, ON", lat: 43.2173, lng: -79.7164, emoji: "🌊" },
  { name: "Cambridge, ON", lat: 43.3616, lng: -80.3144, emoji: "🦋" },
  { name: "Kitchener, ON", lat: 43.4516, lng: -80.4925, emoji: "🍺" },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431, emoji: "🤠" },
  { name: "New York, NY", lat: 40.7128, lng: -74.006, emoji: "🗽" },
  { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, emoji: "🌉" },
  { name: "Nashville, TN", lat: 36.1627, lng: -86.7816, emoji: "🎸" },
  { name: "Arlington, VA", lat: 38.8816, lng: -77.0910, emoji: "🏛" },
];

export function StepDestination() {
  const { tripDraft, updateTripDraft } = useStore();
  const [searchQuery, setSearchQuery] = useState(tripDraft.destination || "");

  const handleSelect = (dest: (typeof popularDestinations)[0]) => {
    setSearchQuery(dest.name);
    updateTripDraft({
      destination: dest.name,
      latitude: dest.lat,
      longitude: dest.lng,
    });
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    updateTripDraft({ destination: value });
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Search city or address..."
          className="input-field pl-12"
          autoFocus
        />
      </div>

      {/* Popular Destinations */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-3">
          Popular Amazon destinations
        </p>
        <div className="grid grid-cols-2 gap-2">
          {popularDestinations.map((dest) => (
            <button
              key={dest.name}
              onClick={() => handleSelect(dest)}
              className={`card flex items-center gap-2 text-left transition-all ${
                tripDraft.destination === dest.name
                  ? "border-amazon-orange bg-orange-50/50 ring-2 ring-amazon-orange/20"
                  : "hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{dest.emoji}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{dest.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Amazon site
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
