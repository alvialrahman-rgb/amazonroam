import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Trip, Itinerary } from "@/types";

interface AppState {
  // User
  user: User | null;
  setUser: (user: User) => void;

  // Trips
  trips: Trip[];
  activeTrip: Trip | null;
  setTrips: (trips: Trip[]) => void;
  setActiveTrip: (trip: Trip | null) => void;
  addTrip: (trip: Trip) => void;

  // Itinerary
  currentItinerary: Itinerary | null;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;

  // Trip Creation Flow
  tripDraft: Partial<Trip>;
  updateTripDraft: (data: Partial<Trip>) => void;
  resetTripDraft: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // User
      user: {
        id: "demo-user",
        amazonAlias: "alvrahma",
        displayName: "Alvi",
        email: "alvrahma@amazon.com",
        interests: ["coffee", "foodie", "happy-hour", "hiking", "tech-talks"],
        energyLevel: "MODERATE",
        budget: "MODERATE",
        dietaryNeeds: [],
        accessibility: [],
        createdAt: new Date().toISOString(),
      },
      setUser: (user) => set({ user }),

      // Trips
      trips: [],
      activeTrip: null,
      setTrips: (trips) => set({ trips }),
      setActiveTrip: (trip) => set({ activeTrip: trip }),
      addTrip: (trip) =>
        set((state) => ({ trips: [...state.trips, trip] })),

      // Itinerary
      currentItinerary: null,
      setCurrentItinerary: (itinerary) =>
        set({ currentItinerary: itinerary }),

      // Trip Draft
      tripDraft: {},
      updateTripDraft: (data) =>
        set((state) => ({
          tripDraft: { ...state.tripDraft, ...data },
        })),
      resetTripDraft: () => set({ tripDraft: {} }),
    }),
    {
      name: "amazonroam-storage",
      partialize: (state) => ({
        user: state.user,
        trips: state.trips,
        activeTrip: state.activeTrip,
      }),
    }
  )
);
