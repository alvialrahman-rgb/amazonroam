"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Sparkles, Star, ArrowRight, Compass } from "lucide-react";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Compass,
    color: "from-amazon-orange to-orange-400",
    title: "Welcome to AmazonRoam",
    subtitle: "Your travel companion for work trips",
    description:
      "Discover places, connect with colleagues, and make the most of every deployment.",
  },
  {
    icon: MapPin,
    color: "from-amazon-blue to-blue-400",
    title: "Smart Itineraries",
    subtitle: "Personalized to your schedule",
    description:
      "Pick your site, set your shift, and get activity recommendations that fit around your work hours.",
  },
  {
    icon: Users,
    color: "from-purple-500 to-pink-400",
    title: "Network & Connect",
    subtitle: "Find your people anywhere",
    description:
      "See who else from Amazon is at your site, find shared interests, and connect via Slack with one tap.",
  },
  {
    icon: Star,
    color: "from-amazon-teal to-green-400",
    title: "Community Favorites",
    subtitle: "Amazon-trusted recommendations",
    description:
      "Tips and reviews from fellow Amazonians who have been there. Better than Yelp for our sites.",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <div
              className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-lg`}
            >
              <Icon className="w-12 h-12 text-white" />
            </div>

            {/* Text */}
            <h1 className="text-2xl font-bold text-amazon-dark mb-2">
              {slide.title}
            </h1>
            <p className="text-amazon-orange font-medium text-sm mb-3">
              {slide.subtitle}
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="px-8 pb-12 max-w-md mx-auto w-full">
        {/* Prototype Disclaimer */}
        {currentSlide === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6"
          >
            <p className="text-[11px] text-amber-700 text-center leading-relaxed">
              <span className="font-semibold">Prototype Notice:</span> This is a
              demo for the AIPXT Challenge. Some features are simulated and data
              is illustrative. Not connected to real Amazon systems.
            </p>
          </motion.div>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide
                  ? "w-6 bg-amazon-orange"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <button
              onClick={() => setCurrentSlide((prev) => prev - 1)}
              className="btn-secondary flex-1 text-sm"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Skip */}
        {currentSlide < slides.length - 1 && (
          <button
            onClick={onComplete}
            className="w-full text-center text-xs text-gray-400 mt-3 py-2"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
