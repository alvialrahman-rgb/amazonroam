import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Trip, Itinerary, CheckIn, NetworkUser } from "@/types";

interface Favorite {
  id: string;
  userId: string;
  userName: string;
  placeName: string;
  city: string;
  category: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

interface AppState {
  // User
  user: User | null;
  setUser: (user: User) => void;
  updateUserInterests: (interests: string[]) => void;
  updateUserBudget: (budget: User["budget"]) => void;
  updateUserEnergy: (energy: User["energyLevel"]) => void;

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

  // Check-in
  activeCheckIn: CheckIn | null;
  checkInHistory: CheckIn[];
  checkIn: (checkIn: CheckIn) => void;
  checkOut: () => void;

  // Favorites / Community
  favorites: Favorite[];
  addFavorite: (fav: Favorite) => void;

  // Badge tracking
  stats: {
    tripsPlanned: number;
    placesExplored: number;
    connectionsMade: number;
    favoritesSubmitted: number;
    checkIns: number;
  };
  incrementStat: (stat: keyof AppState["stats"]) => void;
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
      updateUserInterests: (interests) =>
        set((state) => ({
          user: state.user ? { ...state.user, interests } : null,
        })),
      updateUserBudget: (budget) =>
        set((state) => ({
          user: state.user ? { ...state.user, budget } : null,
        })),
      updateUserEnergy: (energyLevel) =>
        set((state) => ({
          user: state.user ? { ...state.user, energyLevel } : null,
        })),

      // Trips
      trips: [],
      activeTrip: null,
      setTrips: (trips) => set({ trips }),
      setActiveTrip: (trip) => set({ activeTrip: trip }),
      addTrip: (trip) =>
        set((state) => ({
          trips: [...state.trips, trip],
          stats: { ...state.stats, tripsPlanned: state.stats.tripsPlanned + 1 },
        })),

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

      // Check-in
      activeCheckIn: null,
      checkInHistory: [],
      checkIn: (checkIn) =>
        set((state) => ({
          activeCheckIn: checkIn,
          checkInHistory: [...state.checkInHistory, checkIn],
          stats: { ...state.stats, checkIns: state.stats.checkIns + 1 },
        })),
      checkOut: () => set({ activeCheckIn: null }),

      // Favorites
      favorites: [],
      addFavorite: (fav) =>
        set((state) => ({
          favorites: [...state.favorites, fav],
          stats: {
            ...state.stats,
            favoritesSubmitted: state.stats.favoritesSubmitted + 1,
          },
        })),

      // Stats
      stats: {
        tripsPlanned: 0,
        placesExplored: 0,
        connectionsMode: 0,
        connectionsMade: 0,
        favoritesSubmitted: 0,
        checkIns: 0,
      },
      incrementStat: (stat) =>
        set((state) => ({
          stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
        })),
    }),
    {
      name: "amazonroam-storage",
      partialize: (state) => ({
        user: state.user,
        trips: state.trips,
        activeTrip: state.activeTrip,
        activeCheckIn: state.activeCheckIn,
        checkInHistory: state.checkInHistory,
        favorites: state.favorites,
        stats: state.stats,
      }),
    }
  )
);
