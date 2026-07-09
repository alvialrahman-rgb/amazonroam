import { NextRequest, NextResponse } from "next/server";
import { searchGooglePlaces } from "@/lib/api/google-places";
import { searchYelp } from "@/lib/api/yelp";
import type { Place, PlaceCategory, Activity, Itinerary } from "@/types";

interface GenerateRequest {
  destination: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  workStartTime: string;
  workEndTime: string;
  interests: string[];
  energyLevel: string;
  budget: string;
  radius: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    const {
      latitude,
      longitude,
      startDate,
      endDate,
      workStartTime,
      workEndTime,
      interests,
      budget,
      radius,
    } = body;

    // Map interests to Google Places / Yelp categories
    const categoryMap: Record<string, string[]> = {
      food: ["restaurant", "cafe", "bakery"],
      culture: ["museum", "art_gallery", "tourist_attraction"],
      outdoors: ["park", "hiking_area", "natural_feature"],
      nightlife: ["bar", "night_club", "wine_bar"],
      wellness: ["spa", "gym", "yoga_studio"],
      shopping: ["shopping_mall", "clothing_store", "book_store"],
      entertainment: ["movie_theater", "amusement_park", "bowling_alley"],
    };

    // Fetch places from Google Places and Yelp
    const searchCategories = interests.flatMap(
      (interest) => categoryMap[interest] || ["tourist_attraction"]
    );

    let allPlaces: Place[] = [];

    // Try Google Places API
    try {
      const googlePlaces = await searchGooglePlaces({
        latitude,
        longitude,
        radius: radius * 1609, // Convert miles to meters
        types: searchCategories,
      });
      allPlaces = [...allPlaces, ...googlePlaces];
    } catch (error) {
      console.warn("Google Places API unavailable:", error);
    }

    // Try Yelp API (optional - works without it)
    if (process.env.YELP_API_KEY) {
      try {
        const yelpCategories = interests.join(",");
        const yelpPlaces = await searchYelp({
          latitude,
          longitude,
          radius: Math.min(radius * 1609, 40000),
          categories: yelpCategories,
        });
        allPlaces = [...allPlaces, ...yelpPlaces];
      } catch (error) {
        console.warn("Yelp API unavailable:", error);
      }
    }

    // Deduplicate by name similarity
    allPlaces = deduplicatePlaces(allPlaces);

    // Sort by rating and relevance
    allPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Filter by budget
    const maxPrice = budget === "FREE" ? 0 : budget === "LOW" ? 1 : budget === "MODERATE" ? 2 : 4;
    const budgetFiltered = allPlaces.filter(
      (p) => (p.priceLevel || 0) <= maxPrice || !p.priceLevel
    );

    const placesToUse = budgetFiltered.length > 0 ? budgetFiltered : allPlaces;

    // Generate itineraries for each day
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const itineraries: Itinerary[] = [];
    let placeIndex = 0;

    for (let day = 0; day < Math.min(days, 7); day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dateStr = date.toISOString().split("T")[0];

      const workEndHour = parseInt(workEndTime.split(":")[0]);
      const startHour = isWeekend ? 10 : workEndHour + 1;
      const numActivities = isWeekend ? 4 : 2;

      const activities: Activity[] = [];

      for (let i = 0; i < numActivities && placeIndex < placesToUse.length; i++) {
        const place = placesToUse[placeIndex % placesToUse.length];
        const activityStart = startHour + i * 2;

        activities.push({
          id: `act-${dateStr}-${i}`,
          itineraryId: `itin-${dateStr}`,
          placeId: place.id,
          place,
          startTime: `${activityStart.toString().padStart(2, "0")}:00`,
          endTime: `${(activityStart + 1).toString().padStart(2, "0")}:30`,
          travelMinutes: 8 + Math.floor(Math.random() * 15),
          status: "PLANNED",
          order: i,
        });

        placeIndex++;
      }

      itineraries.push({
        id: `itin-${dateStr}`,
        tripId: "pending",
        date: dateStr,
        activities,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ itineraries, totalPlacesFound: allPlaces.length });
  } catch (error) {
    console.error("Itinerary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 }
    );
  }
}

function deduplicatePlaces(places: Place[]): Place[] {
  const seen = new Map<string, Place>();

  for (const place of places) {
    const key = place.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.set(key, place);
    } else {
      // Merge data from duplicate (prefer higher rating)
      const existing = seen.get(key)!;
      if ((place.rating || 0) > (existing.rating || 0)) {
        seen.set(key, { ...existing, ...place });
      }
    }
  }

  return Array.from(seen.values());
}
