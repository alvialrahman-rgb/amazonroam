"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Check, ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { amazonSites, interestOptions } from "@/lib/mock-network";
import type { CheckIn } from "@/types";

export default function CheckInPage() {
  const router = useRouter();
  const { user, activeCheckIn, checkIn, checkOut } = useStore();
  const [site, setSite] = useState("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [success, setSuccess] = useState(false);

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id].slice(0, 5)
    );
  };

  const handleCheckIn = () => {
    if (!site || !arrival || !departure) return;

    const siteInfo = amazonSites.find((s) => s.code === site);
    const newCheckIn: CheckIn = {
      id: `checkin-${Date.now()}`,
      userId: user?.id || "demo",
      user: {
        id: user?.id || "demo",
        amazonAlias: user?.amazonAlias || "demo",
        displayName: user?.displayName || "Demo User",
        title: "Employee Relations Manager",
        team: "Ops PXT-Corporate ER",
        level: "L6",
        siteCode: site,
        siteName: siteInfo?.name || site,
        interests,
        connectionMode: "BOTH",
        avatarColor: "#FF9900",
        checkedIn: true,
        arrivalDate: arrival,
        departureDate: departure,
      },
      siteCode: site,
      siteName: siteInfo?.name || site,
      arrivalDate: arrival,
      departureDate: departure,
      interests,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    checkIn(newCheckIn);
    setSuccess(true);

    setTimeout(() => {
      router.push("/network");
    }, 2000);
  };

  const handleCheckOut = () => {
    checkOut();
    router.push("/network");
  };

  // Show active check-in status
  if (activeCheckIn && !success) {
    return (
      <div className="page-container">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 mb-4"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="card-elevated text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-amazon-teal/10 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-amazon-teal" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            You are checked in
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {activeCheckIn.siteName}
          </p>

          <div className="card bg-gray-50 text-left mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="w-4 h-4 text-amazon-orange" />
              <span>{activeCheckIn.siteCode} - {activeCheckIn.siteName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-amazon-orange" />
              <span>{activeCheckIn.arrivalDate} to {activeCheckIn.departureDate}</span>
            </div>
          </div>

          <button
            onClick={handleCheckOut}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Check Out
          </button>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-amazon-teal/10 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-amazon-teal" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Checked in!</h2>
          <p className="text-sm text-gray-500">
            Taking you to see who else is here...
          </p>
        </motion.div>
      </div>
    );
  }

  // Check-in form
  return (
    <div className="page-container">
      <button
        onClick={() => router.back()}
        className="p-2 -ml-2 rounded-lg hover:bg-gray-100 mb-4"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600" />
      </button>

      <h1 className="text-2xl font-bold text-amazon-dark mb-1">Check In</h1>
      <p className="text-sm text-gray-500 mb-6">
        Let others know you are here and find people with shared interests
      </p>

      <div className="space-y-5">
        {/* Site Select */}
        <div>
          <label htmlFor="site" className="text-sm font-medium text-gray-700 mb-1.5 block">
            Amazon Site
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amazon-orange" />
            <select
              id="site"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="input-field pl-10 text-sm"
            >
              <option value="">Select your site</option>
              {amazonSites.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="arrival" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Arrival
            </label>
            <input
              id="arrival"
              type="date"
              value={arrival}
              onChange={(e) => setArrival(e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label htmlFor="departure" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Departure
            </label>
            <input
              id="departure"
              type="date"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              min={arrival}
              className="input-field text-sm"
            />
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Interests (helps find your people)
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {interestOptions.map((opt) => {
              const isSelected = interests.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleInterest(opt.id)}
                  className={`badge py-2 px-3 text-left text-xs transition-all ${
                    isSelected
                      ? "bg-amazon-orange/10 text-amazon-orange border border-amazon-orange/30"
                      : "bg-gray-50 text-gray-600 border border-transparent"
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {interests.length}/5 selected
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleCheckIn}
          disabled={!site || !arrival || !departure}
          className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Check className="w-4 h-4" />
          Check In
        </button>
      </div>
    </div>
  );
}
