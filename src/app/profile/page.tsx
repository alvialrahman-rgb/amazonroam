"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Check, MapPin, Award, Star, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { interestOptions } from "@/lib/mock-network";
import type { Badge } from "@/types";

export default function ProfilePage() {
  const { user, updateUserInterests, updateUserBudget, updateUserEnergy, stats, trips, favorites } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editInterests, setEditInterests] = useState<string[]>(user?.interests || []);

  const allBadges: Badge[] = [
    {
      id: "b1",
      type: "FIRST_TRIP",
      label: "First Trip",
      description: "Planned your first trip",
      icon: "🎉",
      earnedAt: stats.tripsPlanned >= 1 ? "earned" : undefined,
      progress: stats.tripsPlanned,
      target: 1,
    },
    {
      id: "b2",
      type: "EXPLORER",
      label: "Explorer",
      description: "Plan 5 trips",
      icon: "🧭",
      earnedAt: stats.tripsPlanned >= 5 ? "earned" : undefined,
      progress: stats.tripsPlanned,
      target: 5,
    },
    {
      id: "b3",
      type: "CONNECTOR",
      label: "Connector",
      description: "Connect with 5 Amazonians",
      icon: "🤝",
      earnedAt: stats.connectionsMade >= 5 ? "earned" : undefined,
      progress: stats.connectionsMade,
      target: 5,
    },
    {
      id: "b4",
      type: "NETWORKER",
      label: "Super Networker",
      description: "Connect with 20 Amazonians",
      icon: "🌐",
      earnedAt: stats.connectionsMade >= 20 ? "earned" : undefined,
      progress: stats.connectionsMade,
      target: 20,
    },
    {
      id: "b5",
      type: "REVIEWER",
      label: "Reviewer",
      description: "Submit 3 favorites",
      icon: "✍",
      earnedAt: stats.favoritesSubmitted >= 3 ? "earned" : undefined,
      progress: stats.favoritesSubmitted,
      target: 3,
    },
    {
      id: "b6",
      type: "CHECK_IN",
      label: "Regular",
      description: "Check in 3 times",
      icon: "🔥",
      earnedAt: stats.checkIns >= 3 ? "earned" : undefined,
      progress: stats.checkIns,
      target: 3,
    },
  ];

  const earnedBadges = allBadges.filter((b) => b.earnedAt);
  const inProgressBadges = allBadges.filter((b) => !b.earnedAt && (b.progress || 0) > 0);
  const lockedBadges = allBadges.filter((b) => !b.earnedAt && (b.progress || 0) === 0);

  const handleSaveProfile = () => {
    updateUserInterests(editInterests);
    setIsEditing(false);
  };

  const toggleEditInterest = (id: string) => {
    setEditInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(0, 5)
    );
  };

  return (
    <div className="page-container">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated text-center mb-6 relative"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amazon-orange to-amazon-blue flex items-center justify-center text-white text-2xl font-bold mb-3">
          {user?.displayName?.charAt(0) || "A"}
        </div>
        <h2 className="text-xl font-bold text-amazon-dark">
          {user?.displayName || "Explorer"}
        </h2>
        <p className="text-sm text-gray-500">@{user?.amazonAlias || "alias"}</p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">{trips.length}</p>
            <p className="text-[10px] text-gray-400">Trips</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">{earnedBadges.length}</p>
            <p className="text-[10px] text-gray-400">Badges</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">{favorites.length}</p>
            <p className="text-[10px] text-gray-400">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-amazon-dark">{stats.connectionsMade}</p>
            <p className="text-[10px] text-gray-400">Connects</p>
          </div>
        </div>
      </motion.div>

      {/* Interests - Editable */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-amazon-orange" />
            Interests
          </h3>
          {!isEditing ? (
            <button
              onClick={() => {
                setEditInterests(user?.interests || []);
                setIsEditing(true);
              }}
              className="text-xs text-amazon-orange font-medium flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-gray-400 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="text-xs text-amazon-teal font-medium flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Save
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="flex flex-wrap gap-2">
            {user?.interests?.map((interest) => {
              const opt = interestOptions.find((o) => o.id === interest);
              return (
                <span
                  key={interest}
                  className="badge bg-amazon-orange/10 text-amazon-orange py-1.5 px-3"
                >
                  {opt?.emoji || "✨"} {opt?.label || interest}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {interestOptions.map((opt) => {
              const isSelected = editInterests.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleEditInterest(opt.id)}
                  className={`badge py-2 px-3 text-left transition-all ${
                    isSelected
                      ? "bg-amazon-orange/10 text-amazon-orange border border-amazon-orange/30"
                      : "bg-gray-50 text-gray-600 border border-transparent"
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              );
            })}
            <p className="col-span-2 text-[10px] text-gray-400 mt-1">
              Select up to 5 interests ({editInterests.length}/5)
            </p>
          </div>
        )}
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-amazon-orange" />
          Badges & Achievements
        </h3>

        {earnedBadges.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Earned</p>
            <div className="grid grid-cols-3 gap-2">
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
                    <p className="text-[10px] text-gray-400">{badge.description}</p>
                    <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amazon-orange rounded-full"
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

        {lockedBadges.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Locked</p>
            <div className="grid grid-cols-3 gap-2">
              {lockedBadges.map((badge) => (
                <div key={badge.id} className="card text-center py-3 opacity-40">
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
