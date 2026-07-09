"use client";

import { motion } from "framer-motion";
import { Star, ThumbsUp, MessageCircle, TrendingUp } from "lucide-react";

const amazonFavorites = [
  {
    id: "r1",
    place: "Pike Place Market",
    city: "Seattle, WA",
    user: { alias: "janbez", name: "Jan B." },
    rating: 5,
    comment:
      "Go early (before 9am) to avoid crowds. The flower vendors on the lower level are half the price of upstairs. Pro tip: Rachel's Ginger Beer is right around the corner.",
    tags: ["early-bird", "food", "local-tip"],
    helpful: 28,
    date: "3 days ago",
  },
  {
    id: "r2",
    place: "Lady Bird Lake Trail",
    city: "Austin, TX",
    user: { alias: "priyam", name: "Priya M." },
    rating: 5,
    comment:
      "Perfect morning run before work. The loop is about 10 miles but you can do shorter sections. Kayak rentals available on the south side. Best sunset views from the Pfluger Pedestrian Bridge.",
    tags: ["morning-activity", "outdoors", "exercise"],
    helpful: 34,
    date: "1 week ago",
  },
  {
    id: "r3",
    place: "The Met Cloisters",
    city: "New York, NY",
    user: { alias: "mikech", name: "Mike C." },
    rating: 5,
    comment:
      "Hidden gem that most tourists miss. Medieval art in a castle-like setting in Fort Tryon Park. Way less crowded than the main Met. Take the A train to 190th St. Allow 2-3 hours.",
    tags: ["hidden-gem", "culture", "quiet"],
    helpful: 19,
    date: "2 weeks ago",
  },
  {
    id: "r4",
    place: "Franklin Barbecue",
    city: "Austin, TX",
    user: { alias: "sarahk", name: "Sarah K." },
    rating: 4,
    comment:
      "The brisket is legendary but the line is NO JOKE. Get there by 8am for an 11am open. Bring a lawn chair and a book. Or use their online ordering - it's faster but limited slots. Worth it once.",
    tags: ["food", "plan-ahead", "worth-the-wait"],
    helpful: 41,
    date: "5 days ago",
  },
  {
    id: "r5",
    place: "Banya 5",
    city: "Seattle, WA",
    user: { alias: "devpat", name: "Dev P." },
    rating: 5,
    comment:
      "Best way to recover after a grueling sprint review. Book the evening slot on a weekday - much less busy. The cold plunge is intense but amazing. Their borscht is surprisingly good.",
    tags: ["wellness", "after-work", "recovery"],
    helpful: 22,
    date: "4 days ago",
  },
];

const stats = [
  { label: "Active Roamers", value: "2,847", icon: "🌍" },
  { label: "Reviews Shared", value: "12.4K", icon: "⭐" },
  { label: "Cities Covered", value: "156", icon: "📍" },
  { label: "Meetups This Month", value: "89", icon: "🤝" },
];

export default function CommunityPage() {
  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-amazon-dark">Community</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tips and favorites from fellow Amazonians
        </p>
      </div>

      {/* Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated bg-gradient-to-br from-amazon-dark to-amazon-dark-blue text-white mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-amazon-orange" />
          <span className="text-xs font-medium text-gray-300">
            AmazonRoam Community
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="text-lg">{stat.icon}</span>
              <p className="text-sm font-bold mt-0.5">{stat.value}</p>
              <p className="text-[9px] text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          🔥 Amazon Favorites
        </h2>
        <span className="text-xs text-amazon-orange font-medium">
          Latest tips
        </span>
      </div>

      {/* Reviews Feed */}
      <div className="space-y-4">
        {amazonFavorites.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="card"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-blue flex items-center justify-center text-white text-xs font-bold">
                  {review.user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">
                    {review.user.name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    @{review.user.alias}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-gray-400">{review.date}</span>
            </div>

            {/* Place Info */}
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-800">
                  {review.place}
                </h4>
                <span className="text-[10px] text-gray-400">
                  {review.city}
                </span>
              </div>
              <div className="flex items-center gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < review.rating
                        ? "text-amazon-orange fill-amazon-orange"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {review.comment}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="badge bg-gray-100 text-gray-500 text-[10px]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-amazon-teal transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{review.helpful} helpful</span>
              </button>
              <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-amazon-blue transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
