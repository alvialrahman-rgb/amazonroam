"use client";

import { motion } from "framer-motion";
import { Edit3, MapPin, Award, Globe, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Badge } from "@/types";

const allBadges: Badge[] = [
  {
    id: "b1",
    type: "FIRST_TRIP",
    label: "First Trip",
    description: "Planned your first trip",
    icon: "🎉",
    earnedAt: "2025-07-08",
    progress: 1,
    target: 1,
  },
  {
    id: "b2",
    type: "EXPLORER",
    label: "Explorer",
    description: "Visit 5 different cities",
    icon: "🧭",
    progress: 1,
    target: 5,
  },
  {
    id: "b3",
    type: "GLOBETROTTER",
    label: "Globetrotter",
    description: "Visit 10 different cities",
    icon: "✈️",
    progress: 1,
    target: 10,
  },
  {
    id: "b4",
    type: "FOODIE",
    label: "Foodie",
    description: "Visit 10 restaurants",
    icon: "🍕",
    progress: 3,
    target: 10,
  },
  {
    id: "b5",
    type: "CULTURE_VULTURE",
    label: "Culture Vulture",
    description: "Visit 10 cultural sites",
    icon: "🏛️",
    progress: 2,
    target: 10,
  },
  {
    id: "b6",
    type: "REVIEWER",
    label: "Reviewer",
    description: "Write 5 reviews",
    icon: "✍️",
    progress: 0,
    target: 5,
  },
  {
    id: "b7",
    type: "CONNECTOR",
    label: "Connector",
    description: "Attend 3 meetups",
    icon: "🤝",
    progress: 0,
    target: 3,
  },
  {
    id: "b8",
    type: "STREAK_7",
    label: "Week Warrior",
    description: "7-day engagement streak",
    icon: "🔥",
    progress: 2,
    target: 7,
  },
];

const interestEmojis: Record<string, string> = {
  food: "🍽️",
  culture: "🏛️",
  outdoors: "🌿",
  nightlife: "🍸",
  wellness: "🧘",
  shopping: "🛍️",
  entertainment: "🎭",
  sports: "⚽",
};

export default function ProfilePage() {
  const { user, trips } = useStore();

  const earnedBadges = allBadges.filter((b) => b.earnedAt);
  const inProgressBadges = allBadges.filter((b) => !b.earnedAt && (b.progress || 0) > 0);
  const lockedBadges = allBadges.filter((b) => !b.earnedAt && (b.progress || 0) === 0);

  return (
    <div className="page-container">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated text-center mb-6 relative"
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Edit profile"
        >
          <Edit3 className="w-4 h-4 text-gray-400" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amazon-orange to-amazon-blue flex items-center justify-center text-white text-2xl font-bold mb-3">
          {user?.displayName?.charAt(0) || "A"}
        </div>
        <h2 className="text-xl font-bold text-amazon-dark">
          {user?.displayName || "Explorer"}
        </h2>
        <p className="text-sm text-gray-500">@{user?.amazonAlias || "alias"}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">
              {trips.length}
            </p>
            <p className="text-[10px] text-gray-400">Trips</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">
              {earnedBadges.length}
            </p>
            <p className="text-[10px] text-gray-400">Badges</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">0</p>
            <p className="text-[10px] text-gray-400">Reviews</p>
          </div>
        </div>
      </motion.div>

      {/* Interests */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-amazon-orange" />
          Interests
        </h3>
        <div className="flex flex-wrap gap-2">
          {user?.interests?.map((interest) => (
            <span
              key={interest}
              className="badge bg-amazon-orange/10 text-amazon-orange py-1.5 px-3"
            >
              {interestEmojis[interest] || "✨"} {interest}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amazon-orange" />
          Badges & Achievements
        </h3>

        {/* Earned */}
        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Earned</p>
            <div className="grid grid-cols-4 gap-2">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="card text-center py-3 border-amazon-orange/20 bg-orange-50/30"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-[9px] font-medium text-gray-700 mt-1">
                    {badge.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        {inProgressBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">In Progress</p>
            <div className="space-y-2">
              {inProgressBadges.map((badge) => (
                <div key={badge.id} className="card flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {badge.label}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {badge.description}
                    </p>
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amazon-orange rounded-full transition-all"
                        style={{
                          width: `${((badge.progress || 0) / (badge.target || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {badge.progress}/{badge.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedBadges.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Locked</p>
            <div className="grid grid-cols-4 gap-2">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="card text-center py-3 opacity-40"
                >
                  <span className="text-2xl grayscale">{badge.icon}</span>
                  <p className="text-[9px] font-medium text-gray-500 mt-1">
                    {badge.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
