"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, ThumbsUp, Plus, X, Send, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";

const seedFavorites = [
  {
    id: "seed1",
    userId: "u1",
    userName: "Jan B.",
    placeName: "Pike Place Market",
    city: "Seattle, WA",
    category: "Food",
    rating: 5,
    comment: "Go early (before 9am) to avoid crowds. The flower vendors on the lower level are half the price of upstairs.",
    tags: ["early-bird", "food", "local-tip"],
    createdAt: "2026-07-10",
  },
  {
    id: "seed2",
    userId: "u2",
    userName: "Priya M.",
    placeName: "Stanley Park Seawall",
    city: "Vancouver, BC",
    category: "Outdoors",
    rating: 5,
    comment: "Perfect morning run before work. The full loop is 10km. Best views are from the north side looking at the mountains.",
    tags: ["morning-activity", "outdoors", "running"],
    createdAt: "2026-07-09",
  },
  {
    id: "seed3",
    userId: "u3",
    userName: "Mike C.",
    placeName: "Lancaster Smokehouse",
    city: "Kitchener, ON",
    category: "Food",
    rating: 5,
    comment: "The brisket is unreal. Get there before 6pm on weekends or expect a 30-min wait. Their mac and cheese is a must-add.",
    tags: ["food", "bbq", "plan-ahead"],
    createdAt: "2026-07-08",
  },
  {
    id: "seed4",
    userId: "u4",
    userName: "Sarah K.",
    placeName: "Devil's Punchbowl",
    city: "Stoney Creek, ON",
    category: "Outdoors",
    rating: 4,
    comment: "Short hike but incredible views of the Escarpment. The cross at the top is a great photo spot. Combine with the Bruce Trail nearby.",
    tags: ["outdoors", "photography", "quick-trip"],
    createdAt: "2026-07-07",
  },
  {
    id: "seed5",
    userId: "u5",
    userName: "Dev P.",
    placeName: "Rainey Street",
    city: "Austin, TX",
    category: "Nightlife",
    rating: 4,
    comment: "Way better vibe than 6th St. Converted bungalows as bars, more relaxed crowd. Lucille's and Bungalow are my favorites.",
    tags: ["nightlife", "happy-hour", "chill"],
    createdAt: "2026-07-06",
  },
];

export default function CommunityPage() {
  const { favorites, addFavorite, user } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    placeName: "",
    city: "",
    category: "Food",
    rating: 5,
    comment: "",
    tags: "",
  });

  const allFavorites = [...seedFavorites, ...favorites];

  const handleSubmit = () => {
    if (!formData.placeName || !formData.comment || !formData.city) return;

    addFavorite({
      id: `fav-${Date.now()}`,
      userId: user?.id || "demo",
      userName: user?.displayName || "You",
      placeName: formData.placeName,
      city: formData.city,
      category: formData.category,
      rating: formData.rating,
      comment: formData.comment,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split("T")[0],
    });

    setFormData({ placeName: "", city: "", category: "Food", rating: 5, comment: "", tags: "" });
    setShowForm(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-amazon-dark">Community</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tips and favorites from Amazonians
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`p-2 rounded-lg transition-colors ${
            showForm ? "bg-red-50 text-red-500" : "bg-amazon-orange/10 text-amazon-orange"
          }`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Submit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated mb-6"
        >
          <h3 className="font-semibold text-gray-800 mb-3">Share a Favorite</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Place name"
              value={formData.placeName}
              onChange={(e) => setFormData({ ...formData, placeName: e.target.value })}
              className="input-field text-sm"
            />
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Select city</option>
              <option value="Vancouver, BC">Vancouver, BC</option>
              <option value="Seattle, WA">Seattle, WA</option>
              <option value="Oakville, ON">Oakville, ON</option>
              <option value="Stoney Creek, ON">Stoney Creek, ON</option>
              <option value="Cambridge, ON">Cambridge, ON</option>
              <option value="Kitchener, ON">Kitchener, ON</option>
              <option value="Austin, TX">Austin, TX</option>
              <option value="New York, NY">New York, NY</option>
              <option value="San Francisco, CA">San Francisco, CA</option>
              <option value="Nashville, TN">Nashville, TN</option>
              <option value="Arlington, VA">Arlington, VA</option>
            </select>
            <div className="flex gap-2">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field text-sm flex-1"
              >
                <option value="Food">Food</option>
                <option value="Outdoors">Outdoors</option>
                <option value="Nightlife">Nightlife</option>
                <option value="Culture">Culture</option>
                <option value="Wellness">Wellness</option>
              </select>
              <div className="flex items-center gap-1 px-3 border rounded-xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setFormData({ ...formData, rating: n })}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        n <= formData.rating
                          ? "text-amazon-orange fill-amazon-orange"
                          : "text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Your tip or review (what should people know?)"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="input-field text-sm min-h-[80px] resize-none"
            />
            <input
              type="text"
              placeholder="Tags (comma separated: food, hidden-gem, morning)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input-field text-sm"
            />
            <button
              onClick={handleSubmit}
              disabled={!formData.placeName || !formData.comment || !formData.city}
              className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              Share with Community
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="card bg-gradient-to-r from-amazon-dark to-amazon-dark-blue text-white mb-4 flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-amazon-orange" />
        <div>
          <span className="text-sm font-bold">{allFavorites.length}</span>
          <span className="text-xs text-gray-300 ml-1">community tips across all sites</span>
        </div>
      </div>

      {/* Favorites Feed */}
      <div className="space-y-3">
        {allFavorites
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((fav, index) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-blue flex items-center justify-center text-white text-[10px] font-bold">
                    {fav.userName.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-gray-700">{fav.userName}</span>
                </div>
                <span className="text-[10px] text-gray-400">{fav.createdAt}</span>
              </div>

              {/* Place */}
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-gray-800">{fav.placeName}</h4>
                  <span className="text-[10px] text-gray-400">{fav.city}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3 h-3 ${
                          n <= fav.rating
                            ? "text-amazon-orange fill-amazon-orange"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="badge bg-gray-100 text-gray-500 text-[9px] py-0.5">
                    {fav.category}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                {fav.comment}
              </p>

              {/* Tags */}
              {fav.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {fav.tags.map((tag) => (
                    <span key={tag} className="badge bg-gray-100 text-gray-500 text-[9px] py-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
      </div>
    </div>
  );
}
