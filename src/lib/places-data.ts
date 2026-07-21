import type { Place } from "@/types";
import { getMockPlacesForDestination } from "./itinerary-engine";

const allCities = [
  "Seattle, WA",
  "Austin, TX",
  "New York, NY",
  "San Francisco, CA",
  "Nashville, TN",
  "Arlington, VA",
  "Vancouver, BC",
  "Oakville, ON",
  "Stoney Creek, ON",
  "Cambridge, ON",
  "Kitchener, ON",
];

/**
 * Returns all places from all cities as a flat array.
 * Used by the Explore page for browsing and filtering.
 */
export function getAllPlaces(): Place[] {
  const allPlaces: Place[] = [];

  for (const city of allCities) {
    const places = getMockPlacesForDestination(city);
    allPlaces.push(...places);
  }

  return allPlaces;
}

export function getPlacesForCity(city: string): Place[] {
  return getMockPlacesForDestination(city);
}
