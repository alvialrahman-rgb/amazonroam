"use client";

import { useStore } from "@/lib/store";

const interests = [
  { id: "coffee", emoji: "☕", label: "Coffee Chats" },
  { id: "running", emoji: "🏃", label: "Running" },
  { id: "hiking", emoji: "🥾", label: "Hiking" },
  { id: "foodie", emoji: "🍜", label: "Foodie" },
  { id: "happy-hour", emoji: "🍻", label: "Happy Hour" },
  { id: "board-games", emoji: "🎲", label: "Board Games" },
  { id: "sports", emoji: "⚽", label: "Sports Fan" },
  { id: "photography", emoji: "📸", label: "Photography" },
  { id: "yoga", emoji: "🧘", label: "Yoga & Wellness" },
  { id: "music", emoji: "🎵", label: "Live Music" },
  { id: "reading", emoji: "📚", label: "Book Club" },
  { id: "tech-talks", emoji: "💻", label: "Tech Talks" },
  { id: "cooking", emoji: "👨\u200D🍳", label: "Cooking" },
  { id: "cycling", emoji: "🚴", label: "Cycling" },
  { id: "volunteering", emoji: "🤝", label: "Volunteering" },
];

const energyLevels = [
  {
    id: "LOW_KEY" as const,
    emoji: "😌",
    label: "Low-key",
    desc: "Chill spots, cafes, parks",
  },
  {
    id: "MODERATE" as const,
    emoji: "😊",
    label: "Moderate",
    desc: "Mix of relaxed & active",
  },
  {
    id: "HIGH_ENERGY" as const,
    emoji: "🔥",
    label: "High-energy",
    desc: "Adventure, nightlife, events",
  },
];

const budgetLevels = [
  { id: "FREE" as const, label: "Free", desc: "Parks, trails, free events" },
  { id: "LOW" as const, label: "$", desc: "Budget-friendly" },
  { id: "MODERATE" as const, label: "$$", desc: "Mid-range" },
  { id: "HIGH" as const, label: "$$$", desc: "Splurge-worthy" },
];

export function StepPreferences() {
  const { user, setUser } = useStore();

  const toggleInterest = (interestId: string) => {
    if (!user) return;
    const current = user.interests || [];
    const updated = current.includes(interestId)
      ? current.filter((i) => i !== interestId)
      : [...current, interestId];
    setUser({ ...user, interests: updated });
  };

  return (
    <div className="space-y-6">
      {/* Interests */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">
          What are you into? (pick up to 5 - these help match you with people)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {interests.map((interest) => {
            const isSelected = user?.interests?.includes(interest.id);
            return (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`card flex items-center gap-2 py-3 transition-all ${
                  isSelected
                    ? "border-amazon-orange bg-orange-50/50 ring-2 ring-amazon-orange/20"
                    : "hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{interest.emoji}</span>
                <span className="text-sm font-medium text-gray-700">
                  {interest.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy Level */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">Energy level</p>
        <div className="space-y-2">
          {energyLevels.map((level) => {
            const isSelected = user?.energyLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => user && setUser({ ...user, energyLevel: level.id })}
                className={`card w-full flex items-center gap-3 py-3 text-left transition-all ${
                  isSelected
                    ? "border-amazon-orange bg-orange-50/50 ring-2 ring-amazon-orange/20"
                    : "hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{level.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {level.label}
                  </p>
                  <p className="text-xs text-gray-400">{level.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Budget */}
      <div>
        <p className="text-sm font-medium text-gray-600 mb-3">Budget</p>
        <div className="flex gap-2">
          {budgetLevels.map((level) => {
            const isSelected = user?.budget === level.id;
            return (
              <button
                key={level.id}
                onClick={() => user && setUser({ ...user, budget: level.id })}
                className={`card flex-1 text-center py-3 transition-all ${
                  isSelected
                    ? "border-amazon-orange bg-orange-50/50 ring-2 ring-amazon-orange/20"
                    : "hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-bold text-gray-800">{level.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{level.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
