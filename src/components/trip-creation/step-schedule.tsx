"use client";

import { Clock, Info } from "lucide-react";
import { useStore } from "@/lib/store";

const presetSchedules = [
  { label: "Standard (9-5)", start: "09:00", end: "17:00" },
  { label: "Early bird (7-3)", start: "07:00", end: "15:00" },
  { label: "Late shift (11-7)", start: "11:00", end: "19:00" },
  { label: "Half day (9-1)", start: "09:00", end: "13:00" },
];

export function StepSchedule() {
  const { tripDraft, updateTripDraft } = useStore();

  const handlePreset = (preset: (typeof presetSchedules)[0]) => {
    updateTripDraft({
      workStartTime: preset.start,
      workEndTime: preset.end,
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        What hours are you working? We&apos;ll plan activities for your free
        time before and after.
      </p>

      {/* Preset Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {presetSchedules.map((preset) => {
          const isSelected =
            tripDraft.workStartTime === preset.start &&
            tripDraft.workEndTime === preset.end;
          return (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset)}
              className={`card text-center py-3 transition-all ${
                isSelected
                  ? "border-amazon-orange bg-orange-50/50 ring-2 ring-amazon-orange/20"
                  : "hover:border-gray-300"
              }`}
            >
              <p className="text-sm font-medium text-gray-800">
                {preset.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {preset.start} – {preset.end}
              </p>
            </button>
          );
        })}
      </div>

      {/* Custom Time Inputs */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600">Or set custom hours</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label htmlFor="work-start" className="text-xs text-gray-500 mb-1 block">
              Start
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="work-start"
                type="time"
                value={tripDraft.workStartTime || ""}
                onChange={(e) =>
                  updateTripDraft({ workStartTime: e.target.value })
                }
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>
          <span className="text-gray-300 mt-5">→</span>
          <div className="flex-1">
            <label htmlFor="work-end" className="text-xs text-gray-500 mb-1 block">
              End
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="work-end"
                type="time"
                value={tripDraft.workEndTime || ""}
                onChange={(e) =>
                  updateTripDraft({ workEndTime: e.target.value })
                }
                className="input-field pl-10 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Free Time Preview */}
      {tripDraft.workStartTime && tripDraft.workEndTime && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amazon-teal mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Your free time windows
              </p>
              <ul className="mt-1 space-y-0.5">
                <li className="text-xs text-gray-600">
                  🌅 Morning: Before {tripDraft.workStartTime}
                </li>
                <li className="text-xs text-gray-600">
                  🌆 Evening: After {tripDraft.workEndTime}
                </li>
                <li className="text-xs text-gray-600">
                  ☀️ Weekends: All day
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
