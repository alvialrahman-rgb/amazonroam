"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MapPin,
  Filter,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  mockNetworkUsers,
  getSharedInterests,
  getInterestEmoji,
  getInterestLabel,
  amazonSites,
} from "@/lib/mock-network";
import type { NetworkUser } from "@/types";

export default function NetworkPage() {
  const { user } = useStore();
  const [selectedSite, setSelectedSite] = useState("YVR14");
  const [filterMode, setFilterMode] = useState<"all" | "shared">("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const currentSite = amazonSites.find((s) => s.code === selectedSite);

  const usersAtSite = useMemo(() => {
    const siteUsers = mockNetworkUsers.filter(
      (u) => u.siteCode === selectedSite
    );

    // Sort by shared interest count (descending)
    return siteUsers.sort((a, b) => {
      const aShared = getSharedInterests(user?.interests || [], a.interests).length;
      const bShared = getSharedInterests(user?.interests || [], b.interests).length;
      return bShared - aShared;
    });
  }, [selectedSite, user?.interests]);

  const filteredUsers = useMemo(() => {
    if (filterMode === "shared") {
      return usersAtSite.filter(
        (u) => getSharedInterests(user?.interests || [], u.interests).length > 0
      );
    }
    return usersAtSite;
  }, [usersAtSite, filterMode, user?.interests]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-amazon-dark">Network</h1>
          <p className="text-sm text-gray-500 mt-1">
            Find Amazonians near you with shared interests
          </p>
        </div>
        <Link
          href="/checkin"
          className="badge bg-amazon-orange text-white py-2 px-3 text-xs font-medium"
        >
          Check In
        </Link>
      </div>

      {/* Site Selector */}
      <div className="mb-4">
        <label htmlFor="site-select" className="text-xs font-medium text-gray-500 mb-1.5 block">
          Your Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-orange" />
          <select
            id="site-select"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="input-field pl-10 pr-4 text-sm appearance-none cursor-pointer"
          >
            {amazonSites.map((site) => (
              <option key={site.code} value={site.code}>
                {site.code} - {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-gradient-to-r from-amazon-dark to-amazon-dark-blue text-white mb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-amazon-orange" />
          </div>
          <div>
            <p className="text-lg font-bold">{usersAtSite.length}</p>
            <p className="text-[10px] text-gray-300">Amazonians here now</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">
            {usersAtSite.filter(
              (u) => getSharedInterests(user?.interests || [], u.interests).length > 0
            ).length}
          </p>
          <p className="text-[10px] text-gray-300">Shared interests</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilterMode("all")}
          className={`badge py-2 px-4 transition-all ${
            filterMode === "all"
              ? "bg-amazon-orange text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          All ({usersAtSite.length})
        </button>
        <button
          onClick={() => setFilterMode("shared")}
          className={`badge py-2 px-4 transition-all ${
            filterMode === "shared"
              ? "bg-amazon-orange text-white"
              : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          <Sparkles className="w-3 h-3 mr-1 inline" />
          Shared Interests
        </button>
      </div>

      {/* People List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredUsers.map((person, index) => (
            <PersonCard
              key={person.id}
              person={person}
              userInterests={user?.interests || []}
              index={index}
              isExpanded={expandedUser === person.id}
              onToggle={() =>
                setExpandedUser(expandedUser === person.id ? null : person.id)
              }
            />
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <div className="card text-center py-10">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm">
              No one with shared interests at this site right now
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Try selecting "All" or check another site
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PersonCard({
  person,
  userInterests,
  index,
  isExpanded,
  onToggle,
}: {
  person: NetworkUser;
  userInterests: string[];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const shared = getSharedInterests(userInterests, person.interests);
  const hasShared = shared.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={`card cursor-pointer transition-all ${
          hasShared ? "border-amazon-orange/20 hover:border-amazon-orange/40" : "hover:border-gray-300"
        }`}
        onClick={onToggle}
      >
        {/* Main Row */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: person.avatarColor }}
          >
            {person.displayName.split(" ").map((n) => n[0]).join("")}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm text-gray-800 truncate">
                {person.displayName}
              </h4>
              {hasShared && (
                <span className="badge bg-amazon-orange/10 text-amazon-orange text-[9px] py-0.5">
                  {shared.length} shared
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {person.title} - {person.team}
            </p>
            <p className="text-[10px] text-gray-400">
              {person.level} | @{person.amazonAlias}
            </p>
          </div>

          <ChevronRight
            className={`w-4 h-4 text-gray-300 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>

        {/* Shared Interests Pills */}
        {hasShared && !isExpanded && (
          <div className="flex flex-wrap gap-1 mt-2.5 ml-15">
            {shared.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="badge bg-amazon-orange/5 text-amazon-orange text-[10px] py-0.5"
              >
                {getInterestEmoji(interest)} {getInterestLabel(interest)}
              </span>
            ))}
            {shared.length > 3 && (
              <span className="badge bg-gray-100 text-gray-500 text-[10px] py-0.5">
                +{shared.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Expanded Section */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3 border-t border-gray-100">
                {/* Dates */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>
                    Here {person.arrivalDate} to {person.departureDate}
                  </span>
                  <span className="badge bg-green-100 text-green-700 text-[9px] py-0.5 ml-auto">
                    {person.connectionMode === "BOTH"
                      ? "In-person & Virtual"
                      : person.connectionMode === "IN_PERSON"
                      ? "In-person"
                      : "Virtual"}
                  </span>
                </div>

                {/* All Interests */}
                <p className="text-[10px] text-gray-400 mb-1.5 font-medium">
                  INTERESTS
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {person.interests.map((interest) => {
                    const isShared = userInterests.includes(interest);
                    return (
                      <span
                        key={interest}
                        className={`badge text-[10px] py-0.5 ${
                          isShared
                            ? "bg-amazon-orange/10 text-amazon-orange font-medium"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {getInterestEmoji(interest)} {getInterestLabel(interest)}
                      </span>
                    );
                  })}
                </div>

                {/* Connect Button */}
                <button
                  className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Track the connection
                    if (typeof window !== "undefined") {
                      const stored = localStorage.getItem("amazonroam-storage");
                      if (stored) {
                        const data = JSON.parse(stored);
                        if (data.state?.stats) {
                          data.state.stats.connectionsMade = (data.state.stats.connectionsMade || 0) + 1;
                          localStorage.setItem("amazonroam-storage", JSON.stringify(data));
                        }
                      }
                    }
                    window.open(
                      `https://slack.com/app_redirect?channel=${person.amazonAlias}`,
                      "_blank"
                    );
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Connect via Slack
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
