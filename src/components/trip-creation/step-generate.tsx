"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { generateItinerary } from "@/lib/itinerary-engine";
import { Sparkles, Check } from "lucide-react";

const loadingMessages = [
  "Finding places near you...",
  "Matching your interests...",
  "Checking Amazon community tips...",
  "Optimizing your schedule...",
  "Crafting your perfect day...",
];

export function StepGenerate() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const tripDraft = useStore((s) => s.tripDraft);
  const user = useStore((s) => s.user);
  const addTrip = useStore((s) => s.addTrip);
  const setActiveTrip = useStore((s) => s.setActiveTrip);
  const resetTripDraft = useStore((s) => s.resetTripDraft);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Animate through steps
      for (let i = 0; i < loadingMessages.length; i++) {
        if (cancelled) return;
        setStep(i);
        await delay(1200);
      }

      if (cancelled) return;

      // Generate the itinerary
      const trip = await generateItinerary(tripDraft, user);

      if (cancelled) return;

      addTrip(trip);
      setActiveTrip(trip);
      setDone(true);

      await delay(1500);

      if (cancelled) return;

      resetTripDraft();
      router.push("/trips/" + trip.id);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-amazon-teal/10 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-amazon-teal" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Your itinerary is ready!
          </h3>
          <p className="text-sm text-gray-500">Taking you to your trip...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-blue flex items-center justify-center mb-8"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <div className="space-y-3 w-full max-w-xs">
        {loadingMessages.map((msg, i) => (
          <div key={msg} className="flex items-center gap-3">
            <div
              className={
                "w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold " +
                (i < step
                  ? "bg-amazon-teal"
                  : i === step
                  ? "bg-amazon-orange"
                  : "bg-gray-200 text-gray-400")
              }
            >
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span
              className={
                "text-sm " +
                (i <= step ? "text-gray-800 font-medium" : "text-gray-400")
              }
            >
              {msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
