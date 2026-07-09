"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Star,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { generateItinerary } from "@/lib/itinerary-engine";
import { CategoryBadge } from "@/components/ui/category-badge";
import type { Activity, Itinerary } from "@/types";

export default function TripDetailPage() {
  const { activeTrip, setActiveTrip, user } = useStore();
  const [selectedDay, setSelectedDay] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!activeTrip || isGenerating) return;
    setIsGenerating(true);

    try {
      const updatedTrip = await generateItinerary(
        {
          destination: activeTrip.destination,
          latitude: activeTrip.latitude,
          longitude: activeTrip.longitude,
          startDate: activeTrip.startDate,
          endDate: activeTrip.endDate,
          workStartTime: activeTrip.workStartTime,
          workEndTime: activeTrip.workEndTime,
          radius: activeTrip.radius,
        },
        user
      );

      // Update the active trip with generated itineraries
      setActiveTrip({
        ...activeTrip,
        itineraries: updatedTrip.itineraries,
        activities: updatedTrip.activities,
      });
    } catch (error) {
      console.error("Failed to generate:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [activeTrip, user, isGenerating, setActiveTrip]);

  if (!activeTrip) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">No active trip found</p>
        <Link href="/trips/new" className="btn-primary mt-4">
          Plan a Trip
        </Link>
      </div>
    );
  }

  const itineraries = activeTrip.itineraries || [];
  const currentItinerary = itineraries[selectedDay];
  const hasActivities = itineraries.some((i) => i.activities && i.activities.length > 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-amazon-dark">
            {activeTrip.destination}
          </h1>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {activeTrip.startDate} - {activeTrip.endDate}
          </p>
        </div>
        <div className="badge bg-amazon-teal/10 text-amazon-teal">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Generated
        </div>
      </div>

      {/* Day Selector */}
      {itineraries.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 scrollbar-hide">
          {itineraries.map((itin: Itinerary, index: number) => {
            const date = new Date(itin.date + "T12:00:00");
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const dayNum = date.getDate();
            const isSelected = index === selectedDay;

            return (
              <button
                key={itin.id}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 w-14 py-2 rounded-xl text-center transition-all ${
                  isSelected
                    ? "bg-amazon-orange text-white shadow-md shadow-amazon-orange/30"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-amazon-orange/30"
                }`}
              >
                <p className="text-[10px] font-medium uppercase">{dayName}</p>
                <p className="text-lg font-bold">{dayNum}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Activities Timeline */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-4"
        >
          {currentItinerary?.activities?.map(
            (activity: Activity, index: number) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                index={index}
                isLast={index === currentItinerary.activities.length - 1}
              />
            )
          )}

          {(!hasActivities || !currentItinerary?.activities?.length) && (
            <div className="card text-center py-8">
              <p className="text-gray-400 mb-3">No activities planned yet</p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-primary text-sm inline-flex items-center gap-2 disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate suggestions
                  </>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ActivityCard({
  activity,
  index,
  isLast,
}: {
  activity: Activity;
  index: number;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-6 top-[72px] bottom-0 w-0.5 bg-gray-200 -mb-4" />
      )}

      <div className="card flex gap-3">
        {/* Time */}
        <div className="flex flex-col items-center flex-shrink-0 w-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amazon-orange/20 to-amazon-blue/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amazon-orange" />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">
            {activity.startTime}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-800 text-sm truncate">
                {activity.place.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <CategoryBadge category={activity.place.category} />
                {activity.place.rating && (
                  <span className="flex items-center gap-0.5 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-amazon-orange fill-amazon-orange" />
                    {activity.place.rating}
                  </span>
                )}
                {activity.place.amazonRating && (
                  <span className="text-[10px] text-amazon-teal font-medium">
                    🏢 {activity.place.amazonRating}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
          </div>

          {activity.place.description && (
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
              {activity.place.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {activity.place.address?.split(",")[0]}
            </span>
            {activity.travelMinutes > 0 && (
              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                <Navigation className="w-3 h-3" />
                {activity.travelMinutes} min
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
