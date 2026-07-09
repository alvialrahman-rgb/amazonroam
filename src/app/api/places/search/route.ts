import { NextRequest, NextResponse } from "next/server";
import { searchGooglePlaces } from "@/lib/api/google-places";
import { searchYelp } from "@/lib/api/yelp";
import type { Place } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const latitude = parseFloat(searchParams.get("lat") || "0");
  const longitude = parseFloat(searchParams.get("lng") || "0");
  const radius = parseInt(searchParams.get("radius") || "20") * 1609; // miles to meters
  const category = searchParams.get("category") || undefined;
  const query = searchParams.get("q") || undefined;

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "latitude and longitude are required" },
      { status: 400 }
    );
  }

  let places: Place[] = [];

  // Google Places search
  try {
    const types = category
      ? [category.toLowerCase()]
      : ["restaurant", "tourist_attraction", "park", "museum"];

    const googleResults = await searchGooglePlaces({
      latitude,
      longitude,
      radius,
      types,
    });
    places = [...places, ...googleResults];
  } catch (error) {
    console.warn("Google Places unavailable:", error);
  }

  // Yelp search (optional - only runs if key is configured)
  if (process.env.YELP_API_KEY) {
    try {
      const yelpResults = await searchYelp({
        latitude,
        longitude,
        radius: Math.min(radius, 40000),
        categories: category?.toLowerCase(),
        term: query,
      });
      places = [...places, ...yelpResults];
    } catch (error) {
      console.warn("Yelp unavailable:", error);
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  places = places.filter((p) => {
    const key = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by rating
  places.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return NextResponse.json({ places, total: places.length });
}
