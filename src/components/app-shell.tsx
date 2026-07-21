"use client";

import { useState, useEffect } from "react";
import { Onboarding } from "./onboarding";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenOnboarding = localStorage.getItem("amazonroam-onboarding-done");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("amazonroam-onboarding-done", "true");
    setShowOnboarding(false);
  };

  if (!mounted) return <>{children}</>;

  return (
    <>
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      {children}
    </>
  );
}
