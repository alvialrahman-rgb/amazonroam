"use client";

import { Calendar } from "lucide-react";
import { useStore } from "@/lib/store";

export function StepDates() {
  const { tripDraft, updateTripDraft } = useStore();

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        When does your work trip start and end? We&apos;ll plan activities
        around your schedule.
      </p>

      <div className="space-y-4">
        {/* Start Date */}
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Arrival Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="start-date"
              type="date"
              value={tripDraft.startDate || ""}
              onChange={(e) =>
                updateTripDraft({ startDate: e.target.value })
              }
              className="input-field pl-12"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Departure Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="end-date"
              type="date"
              value={tripDraft.endDate || ""}
              onChange={(e) =>
                updateTripDraft({ endDate: e.target.value })
              }
              min={tripDraft.startDate || undefined}
              className="input-field pl-12"
            />
          </div>
        </div>
      </div>

      {/* Duration Display */}
      {tripDraft.startDate && tripDraft.endDate && (
        <div className="card bg-amazon-light border-amazon-orange/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amazon-orange/10 flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {calculateDays(tripDraft.startDate, tripDraft.endDate)} days
              </p>
              <p className="text-xs text-gray-500">
                We&apos;ll generate an itinerary for each free evening and
                weekend
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}
