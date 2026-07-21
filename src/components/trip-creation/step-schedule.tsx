"use client";

import { Clock, Info } from "lucide-react";
import { useStore } from "@/lib/store";

const shiftPresets = [
  {
    code: "9-5",
    label: "Standard 9-5",
    desc: "Mon-Fri, 9 AM - 5 PM",
    workDays: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    code: "FHD",
    label: "FHD (Front Half Days)",
    desc: "Sun-Wed, 9 AM - 5 PM",
    workDays: [0, 1, 2, 3],
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    code: "BHD",
    label: "BHD (Back Half Days)",
    desc: "Wed-Sat, 9 AM - 5 PM",
    workDays: [3, 4, 5, 6],
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    code: "FHN",
    label: "FHN (Front Half Nights)",
    desc: "Sun-Wed, 8 PM - 4 AM",
    workDays: [0, 1, 2, 3],
    startTime: "20:00",
    endTime: "04:00",
  },
  {
    code: "BHN",
    label: "BHN (Back Half Nights)",
    desc: "Wed-Sat, 8 PM - 4 AM",
    workDays: [3, 4, 5, 6],
    startTime: "20:00",
    endTime: "04:00",
  },
];

export function StepSchedule() {
  const { tripDraft, updateTripDraft } = useStore();

  const selectedShift = shiftPresets.find(
    (s) =>
      s.startTime === tripDraft.workStartTime &&
      s.endTime === tripDraft.workEndTime
  );

  const handlePreset = (preset: (typeof shiftPresets)[0]) => {
    updateTripDraft({
      workStartTime: preset.startTime,
      workEndTime: preset.endTime,
    });
  };

  const isNightShift =
    tripDraft.workStartTime && parseInt(tripDraft.workStartTime.split(":")[0]) >= 18;

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Select your shift pattern. We will plan activities for your free time -
        evenings for day shifts, daytime for night shifts.
      </p>

      {/* Shift Presets */}
      <div className="space-y-2">
        {shiftPresets.map((preset) => {
          const isSelected =
            tripDraft.workStartTime === preset.startTime &&
            tripDraft.workEndTime === preset.endTime;
          return (
            <button
              key={preset.code}
              onClick={() => handlePreset(preset)}
              className={`card w-full flex items-center gap-3 py-3 text-left transition-all ${
                isSelected
                  ? "border-amazon-orange bg-orange-50/50 ring-2 ring-amazon-orange/20"
                  : "hover:border-gray-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isSelected
                    ? "bg-amazon-orange text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {preset.code}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {preset.label}
                </p>
                <p className="text-xs text-gray-400">{preset.desc}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-amazon-orange flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Time Option */}
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
          <span className="text-gray-300 mt-5">to</span>
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
        <div className={`card ${isNightShift ? "bg-indigo-50 border-indigo-200" : "bg-green-50 border-green-200"}`}>
          <div className="flex items-start gap-3">
            <Info className={`w-5 h-5 mt-0.5 ${isNightShift ? "text-indigo-600" : "text-amazon-teal"}`} />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Your free time
              </p>
              {isNightShift ? (
                <ul className="mt-1 space-y-0.5">
                  <li className="text-xs text-gray-600">
                    ☀️ Daytime: 8 AM - 6 PM (before your shift)
                  </li>
                  <li className="text-xs text-gray-600">
                    📅 Days off: Full day available
                  </li>
                </ul>
              ) : (
                <ul className="mt-1 space-y-0.5">
                  <li className="text-xs text-gray-600">
                    🌅 Morning: Before {tripDraft.workStartTime}
                  </li>
                  <li className="text-xs text-gray-600">
                    🌆 Evening: After {tripDraft.workEndTime}
                  </li>
                  <li className="text-xs text-gray-600">
                    📅 Days off: Full day available
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
