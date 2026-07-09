import axios from "axios";
import type { Place, PlaceCategory } from "@/types";

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api/place";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  price_level?: number;
  types: string[];
  photos?: Array<{ photo_reference: string }>;
  opening_hours?: { open_now: boolean };
  user_ratings_total?: number;
}

interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  types: string[];
}

/**
 * Search Google Places API for nearby places.
 * Requires GOOGLE_PLACES_API_KEY environment variable.
 */
export async function searchGooglePlaces(
  params: NearbySearchParams
): Promise<Place[]> {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY not configured");
  }

  const allResults: GooglePlaceResult[] = [];

  // Search for each type (Google only allows one type per request)
  const uniqueTypes = [...new Set(params.types)].slice(0, 8); // Search more types for richer results

  for (const type of uniqueTypes) {
    try {
      const response = await axios.get(`${BASE_URL}/nearbysearch/json`, {
        params: {
          location: `${params.latitude},${params.longitude}`,
          radius: Math.min(params.radius, 50000), // Max 50km
          type,
          key: GOOGLE_API_KEY,
          rankby: undefined, // Use radius-based search
        },
      });

      if (response.data.status === "OK") {
        allResults.push(...response.data.results.slice(0, 8)); // Top 8 per type
      }
    } catch (error) {
      console.warn(`Google Places search failed for type ${type}:`, error);
    }
  }

  return allResults.map(mapGooglePlaceToPlace);
}

/**
 * Get detailed information about a specific place.
 */
export async function getPlaceDetails(placeId: string): Promise<Place | null> {
  if (!GOOGLE_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/details/json`, {
      params: {
        place_id: placeId,
        fields:
          "name,formatted_address,geometry,rating,price_level,types,photos,opening_hours,editorial_summary",
        key: GOOGLE_API_KEY,
      },
    });

    if (response.data.status === "OK") {
      const result = response.data.result;
      return {
        id: `google-${result.place_id}`,
        googlePlaceId: result.place_id,
        name: result.name,
        category: mapGoogleTypeToCategory(result.types || []),
        address: result.formatted_address || "",
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        rating: result.rating,
        priceLevel: result.price_level,
        description: result.editorial_summary?.overview,
        imageUrl: result.photos?.[0]
          ? getPhotoUrl(result.photos[0].photo_reference)
          : undefined,
        openNow: result.opening_hours?.open_now,
      };
    }
  } catch (error) {
    console.error("Place details fetch failed:", error);
  }

  return null;
}

function mapGooglePlaceToPlace(result: GooglePlaceResult): Place {
  return {
    id: `google-${result.place_id}`,
    googlePlaceId: result.place_id,
    name: result.name,
    category: mapGoogleTypeToCategory(result.types),
    address: result.vicinity || "",
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    rating: result.rating,
    priceLevel: result.price_level,
    imageUrl: result.photos?.[0]
      ? getPhotoUrl(result.photos[0].photo_reference)
      : undefined,
    openNow: result.opening_hours?.open_now,
  };
}

function mapGoogleTypeToCategory(types: string[]): PlaceCategory {
  if (types.some((t) => ["restaurant", "cafe", "bakery", "food"].includes(t)))
    return "FOOD";
  if (types.some((t) => ["museum", "art_gallery", "church", "library"].includes(t)))
    return "CULTURE";
  if (types.some((t) => ["park", "campground", "natural_feature"].includes(t)))
    return "OUTDOORS";
  if (types.some((t) => ["bar", "night_club", "casino"].includes(t)))
    return "NIGHTLIFE";
  if (types.some((t) => ["spa", "gym", "health"].includes(t)))
    return "WELLNESS";
  if (types.some((t) => ["shopping_mall", "clothing_store", "store"].includes(t)))
    return "SHOPPING";
  if (types.some((t) => ["movie_theater", "amusement_park", "stadium"].includes(t)))
    return "ENTERTAINMENT";
  return "ENTERTAINMENT";
}

function getPhotoUrl(photoReference: string): string {
  return `${BASE_URL}/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`;
}
