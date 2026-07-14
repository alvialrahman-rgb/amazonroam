"use client";

import { motion } from "framer-motion";
import { MapPin, Compass, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { user, activeTrip } = useStore();

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-amazon-dark">
            Hey, {user?.displayName?.split(" ")[0] || "Explorer"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Where are you headed next?
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-blue flex items-center justify-center text-white font-bold text-sm">
          {user?.displayName?.charAt(0) || "A"}
        </div>
      </motion.div>

      {/* Active Trip Card */}
      {activeTrip ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href={`/trips/${activeTrip.id}`}>
            <div className="card-elevated mb-6 bg-gradient-to-br from-amazon-dark to-amazon-dark-blue text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amazon-orange/10 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative">
                <span className="badge bg-amazon-orange/20 text-amazon-orange mb-3">
                  <Compass className="w-3 h-3 mr-1" />
                  Active Trip
                </span>
                <h2 className="text-xl font-bold mb-1">
                  {activeTrip.destination}
                </h2>
                <p className="text-gray-300 text-sm">
                  {activeTrip.startDate} - {activeTrip.endDate}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-category-food" />
                    <div className="w-6 h-6 rounded-full bg-category-culture" />
                    <div className="w-6 h-6 rounded-full bg-category-outdoors" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {activeTrip.activities?.length || 0} activities planned
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ) : null}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Link href="/trips/new">
          <div className="btn-primary w-full text-center text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Plan a New Trip
          </div>
        </Link>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mb-8"
      >
        <Link href="/explore">
          <div className="card text-center py-6 hover:border-amazon-orange/30">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-amazon-orange" />
            <span className="text-sm font-medium text-gray-700">Explore</span>
            <p className="text-xs text-gray-400 mt-1">Discover nearby</p>
          </div>
        </Link>
        <Link href="/network">
          <div className="card text-center py-6 hover:border-amazon-blue/30">
            <Users className="w-8 h-8 mx-auto mb-2 text-amazon-blue" />
            <span className="text-sm font-medium text-gray-700">Network</span>
            <p className="text-xs text-gray-400 mt-1">Who's here</p>
          </div>
        </Link>
      </motion.div>

      {/* Amazon Favorites Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">
            🔥 Trending on AmazonRoam
          </h3>
          <Link
            href="/community"
            className="text-xs text-amazon-orange font-medium"
          >
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {sampleTrending.map((item, i) => (
            <div key={i} className="card flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: item.color }}
              >
                {item.emoji}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.location}</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-amazon-orange">
                  ⭐ {item.rating}
                </div>
                <div className="text-xs text-gray-400">
                  {item.reviews} reviews
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const sampleTrending = [
  {
    name: "Pike Place Market",
    location: "Seattle, WA",
    rating: 4.8,
    reviews: 42,
    emoji: "🐟",
    color: "#FF6B35",
  },
  {
    name: "Lady Bird Lake Trail",
    location: "Austin, TX",
    rating: 4.7,
    reviews: 38,
    emoji: "🚴",
    color: "#2ECC71",
  },
  {
    name: "The Met Cloisters",
    location: "New York, NY",
    rating: 4.9,
    reviews: 27,
    emoji: "🏛️",
    color: "#7B61FF",
  },
];
