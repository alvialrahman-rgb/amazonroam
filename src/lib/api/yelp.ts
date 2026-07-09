import axios from "axios";
import type { Place, PlaceCategory } from "@/types";

const YELP_API_KEY = process.env.YELP_API_KEY;
const BASE_URL = "https://api.yelp.com/v3";

interface YelpBusiness {
  id: string;
  name: string;
  url: string;
  rating: number;
  price?: string;
  categories: Array<{ alias: string; title: string }>;
  coordinates: { latitude: number; longitude: number };
  location: {
    display_address: string[];
    address1: string;
    city: string;
    state: string;
  };
  image_url?: string;
  is_closed: boolean;
  review_count: number;
  distance?: number;
}

interface YelpSearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  categories?: string;
  term?: string;
}

/**
 * Search Yelp Fusion API for businesses.
 * Requires YELP_API_KEY environment variable.
 */
export async function searchYelp(params: YelpSearchParams): Promise<Place[]> {
  if (!YELP_API_KEY) {
    throw new Error("YELP_API_KEY not configured");
  }

  try {
    const response = await axios.get(`${BASE_URL}/businesses/search`, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
      params: {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: Math.min(Math.round(params.radius), 40000), // Yelp max 40km
        categories: params.categories,
        term: params.term,
        sort_by: "rating",
        limit: 20,
      },
    });

    if (response.data.businesses) {
      return response.data.businesses
        .filter((b: YelpBusiness) => !b.is_closed)
        .map(mapYelpBusinessToPlace);
    }
  } catch (error) {
    console.error("Yelp search failed:", error);
    throw error;
  }

  return [];
}

/**
 * Get detailed business information from Yelp.
 */
export async function getYelpBusinessDetails(
  businessId: string
): Promise<Place | null> {
  if (!YELP_API_KEY) return null;

  try {
    const response = await axios.get(`${BASE_URL}/businesses/${businessId}`, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    });

    if (response.data) {
      return mapYelpBusinessToPlace(response.data);
    }
  } catch (error) {
    console.error("Yelp business details fetch failed:", error);
  }

  return null;
}

/**
 * Get reviews for a Yelp business.
 */
export async function getYelpReviews(businessId: string) {
  if (!YELP_API_KEY) return [];

  try {
    const response = await axios.get(
      `${BASE_URL}/businesses/${businessId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
        },
        params: { limit: 3, sort_by: "yelp_sort" },
      }
    );

    return response.data.reviews || [];
  } catch (error) {
    console.error("Yelp reviews fetch failed:", error);
    return [];
  }
}

function mapYelpBusinessToPlace(business: YelpBusiness): Place {
  return {
    id: `yelp-${business.id}`,
    yelpId: business.id,
    name: business.name,
    category: mapYelpCategoryToPlaceCategory(business.categories),
    address: business.location.display_address?.join(", ") || business.location.address1 || "",
    latitude: business.coordinates.latitude,
    longitude: business.coordinates.longitude,
    rating: business.rating,
    priceLevel: business.price ? business.price.length : undefined,
    imageUrl: business.image_url || undefined,
    openNow: !business.is_closed,
  };
}

function mapYelpCategoryToPlaceCategory(
  categories: Array<{ alias: string; title: string }>
): PlaceCategory {
  const aliases = categories.map((c) => c.alias);

  if (
    aliases.some((a) =>
      ["restaurants", "food", "cafes", "breakfast_brunch", "seafood", "pizza"].includes(a)
    )
  )
    return "FOOD";
  if (
    aliases.some((a) =>
      ["museums", "galleries", "landmarks", "historicaltours"].includes(a)
    )
  )
    return "CULTURE";
  if (
    aliases.some((a) =>
      ["parks", "hiking", "beaches", "gardens", "playgrounds"].includes(a)
    )
  )
    return "OUTDOORS";
  if (
    aliases.some((a) =>
      ["bars", "nightlife", "cocktailbars", "wine_bars", "lounges"].includes(a)
    )
  )
    return "NIGHTLIFE";
  if (
    aliases.some((a) =>
      ["health", "fitness", "yoga", "gyms", "spas", "massage"].includes(a)
    )
  )
    return "WELLNESS";
  if (
    aliases.some((a) =>
      ["shopping", "fashion", "bookstores"].includes(a)
    )
  )
    return "SHOPPING";

  return "ENTERTAINMENT";
}
