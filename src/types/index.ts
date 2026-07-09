export type EnergyLevel = "LOW_KEY" | "MODERATE" | "HIGH_ENERGY";
export type Budget = "FREE" | "LOW" | "MODERATE" | "HIGH";
export type TripStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type ItineraryStatus = "DRAFT" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED";
export type ActivityStatus = "PLANNED" | "CONFIRMED" | "COMPLETED" | "SKIPPED";

export type PlaceCategory =
  | "FOOD"
  | "CULTURE"
  | "OUTDOORS"
  | "NIGHTLIFE"
  | "WELLNESS"
  | "SHOPPING"
  | "ENTERTAINMENT";

export interface User {
  id: string;
  amazonAlias: string;
  displayName: string;
  email: string;
  interests: string[];
  energyLevel: EnergyLevel;
  budget: Budget;
  dietaryNeeds: string[];
  accessibility: string[];
  createdAt: string;
}

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  workStartTime: string;
  workEndTime: string;
  radius: number;
  status: TripStatus;
  itineraries?: Itinerary[];
  activities?: Activity[];
  createdAt: string;
}

export interface Itinerary {
  id: string;
  tripId: string;
  date: string;
  activities: Activity[];
  status: ItineraryStatus;
  createdAt: string;
}

export interface Activity {
  id: string;
  itineraryId: string;
  placeId: string;
  place: Place;
  startTime: string;
  endTime: string;
  travelMinutes: number;
  notes?: string;
  status: ActivityStatus;
  order: number;
}

export interface Place {
  id: string;
  googlePlaceId?: string;
  yelpId?: string;
  name: string;
  category: PlaceCategory;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  amazonRating?: number;
  priceLevel?: number;
  imageUrl?: string;
  photos?: string[];
  openNow?: boolean;
  description?: string;
}

export interface Review {
  id: string;
  userId: string;
  user: Pick<User, "displayName" | "amazonAlias">;
  placeId: string;
  rating: number;
  comment: string;
  tags: string[];
  helpful: number;
  createdAt: string;
}

export interface Badge {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number;
  target?: number;
}

export interface PlaceSearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  category?: PlaceCategory;
  budget?: Budget;
  query?: string;
}

export interface ItineraryGenerateParams {
  tripId: string;
  date: string;
  preferences: {
    interests: string[];
    energyLevel: EnergyLevel;
    budget: Budget;
  };
  workSchedule: {
    startTime: string;
    endTime: string;
  };
  location: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}
