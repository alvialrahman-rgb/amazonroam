"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { StepDestination } from "@/components/trip-creation/step-destination";
import { StepDates } from "@/components/trip-creation/step-dates";
import { StepSchedule } from "@/components/trip-creation/step-schedule";
import { StepPreferences } from "@/components/trip-creation/step-preferences";
import { StepGenerate } from "@/components/trip-creation/step-generate";

const steps = [
  { id: "destination", title: "Where are you going?" },
  { id: "dates", title: "When's the trip?" },
  { id: "schedule", title: "Work schedule" },
  { id: "preferences", title: "Your vibe" },
  { id: "generate", title: "Creating your itinerary..." },
];

export default function NewTripPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { tripDraft, resetTripDraft } = useStore();

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!tripDraft.destination;
      case 1:
        return !!tripDraft.startDate && !!tripDraft.endDate;
      case 2:
        return !!tripDraft.workStartTime && !!tripDraft.workEndTime;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      resetTripDraft();
      router.push("/");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="page-container min-h-screen flex flex-col">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-xs text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amazon-orange to-amazon-blue rounded-full"
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step Title */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={steps[currentStep].title}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="text-2xl font-bold text-amazon-dark mb-6"
        >
          {steps[currentStep].title}
        </motion.h2>
      </AnimatePresence>

      {/* Step Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && <StepDestination />}
            {currentStep === 1 && <StepDates />}
            {currentStep === 2 && <StepSchedule />}
            {currentStep === 3 && <StepPreferences />}
            {currentStep === 4 && <StepGenerate />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      {currentStep < 4 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentStep === 3 ? (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Itinerary
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </motion.div>
      )}
    </div>
  );
}
