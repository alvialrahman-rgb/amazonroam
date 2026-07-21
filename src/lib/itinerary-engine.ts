import type { Trip, User, Activity, Place, Itinerary } from "@/types";

export async function generateItinerary(
  tripDraft: Partial<Trip>,
  user: User | null
): Promise<Trip> {
  const tripId = `trip-${Date.now()}`;
  const startDate =
    tripDraft.startDate || new Date().toISOString().split("T")[0];
  const endDate = tripDraft.endDate || startDate;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  let itineraries: Itinerary[];

  // Try API with a 8-second timeout, fall back to mock data
  if (tripDraft.latitude && tripDraft.longitude) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: tripDraft.destination,
          latitude: tripDraft.latitude,
          longitude: tripDraft.longitude,
          startDate,
          endDate,
          workStartTime: tripDraft.workStartTime || "09:00",
          workEndTime: tripDraft.workEndTime || "17:00",
          interests: user?.interests || ["food", "culture"],
          energyLevel: user?.energyLevel || "MODERATE",
          budget: user?.budget || "MODERATE",
          radius: tripDraft.radius || 20,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const hasActivities = data.itineraries?.some(
          (i: Itinerary) => i.activities && i.activities.length > 0
        );
        if (hasActivities) {
          itineraries = data.itineraries;
        } else {
          itineraries = generateMockItineraries(tripId, startDate, days, tripDraft, user);
        }
      } else {
        itineraries = generateMockItineraries(tripId, startDate, days, tripDraft, user);
      }
    } catch {
      // Timeout or network error - use mock data
      itineraries = generateMockItineraries(tripId, startDate, days, tripDraft, user);
    }
  } else {
    itineraries = generateMockItineraries(tripId, startDate, days, tripDraft, user);
  }

  const trip: Trip = {
    id: tripId,
    userId: user?.id || "demo-user",
    destination: tripDraft.destination || "Unknown",
    latitude: tripDraft.latitude || 0,
    longitude: tripDraft.longitude || 0,
    startDate,
    endDate,
    workStartTime: tripDraft.workStartTime || "09:00",
    workEndTime: tripDraft.workEndTime || "17:00",
    radius: tripDraft.radius || 20,
    status: "ACTIVE",
    itineraries,
    activities: itineraries.flatMap((i) => i.activities),
    createdAt: new Date().toISOString(),
  };

  return trip;
}

function generateMockItineraries(
  tripId: string,
  startDate: string,
  days: number,
  tripDraft: Partial<Trip>,
  user: User | null
): Itinerary[] {
  const destination = tripDraft.destination || "Seattle, WA";
  const places = getMockPlacesForDestination(destination);
  const interests = user?.interests || ["food", "culture"];

  const relevantPlaces = places.filter((p) => {
    const interestToCategory: Record<string, string[]> = {
      coffee: ["FOOD"],
      foodie: ["FOOD"],
      cooking: ["FOOD"],
      hiking: ["OUTDOORS"],
      running: ["OUTDOORS"],
      cycling: ["OUTDOORS"],
      yoga: ["WELLNESS"],
      "happy-hour": ["NIGHTLIFE", "FOOD"],
      music: ["NIGHTLIFE", "ENTERTAINMENT"],
      "board-games": ["ENTERTAINMENT"],
      sports: ["OUTDOORS", "ENTERTAINMENT"],
      photography: ["OUTDOORS", "CULTURE"],
      reading: ["CULTURE"],
      "tech-talks": ["CULTURE"],
      volunteering: ["OUTDOORS"],
    };

    const matchingCategories = interests.flatMap(
      (i) => interestToCategory[i] || []
    );

    return matchingCategories.includes(p.category) || matchingCategories.length === 0;
  });

  // Filter by budget if set
  const budgetMax = user?.budget === "FREE" ? 0 : user?.budget === "LOW" ? 1 : user?.budget === "MODERATE" ? 2 : 4;
  const budgetFiltered = relevantPlaces.filter(
    (p) => (p.priceLevel || 0) <= budgetMax
  );

  const placesToUse = budgetFiltered.length > 0 ? budgetFiltered : relevantPlaces.length > 0 ? relevantPlaces : places;

  // Determine shift pattern
  const workStart = tripDraft.workStartTime || "09:00";
  const workEnd = tripDraft.workEndTime || "17:00";
  const workStartHour = parseInt(workStart.split(":")[0]);
  const workEndHour = parseInt(workEnd.split(":")[0]);
  const isNightShift = workStartHour >= 18;

  // Determine work days based on shift pattern
  const getWorkDays = (): number[] => {
    if (workStart === "09:00" && workEnd === "17:00") {
      return [1, 2, 3, 4, 5]; // Mon-Fri (standard 9-5)
    }
    if (workStart === "09:00" || workStart === "20:00") {
      // FHD/FHN: Sun-Wed = [0,1,2,3], BHD/BHN: Wed-Sat = [3,4,5,6]
      // We can't tell FH from BH by time alone, default to checking if it looks like FH
      return [0, 1, 2, 3]; // Default to FHD/FHN pattern
    }
    return [1, 2, 3, 4, 5]; // Fallback to Mon-Fri
  };

  const workDays = getWorkDays();

  const itineraries: Itinerary[] = [];

  for (let day = 0; day < Math.min(days, 7); day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
    const isDayOff = !workDays.includes(dayOfWeek);

    const dayActivities: Activity[] = [];

    let startHour: number;
    let numActivities: number;

    if (isDayOff) {
      // Full day available
      startHour = 10;
      numActivities = 4;
    } else if (isNightShift) {
      // Night shift worker - free during the day
      startHour = 9;
      numActivities = 3;
    } else {
      // Day shift worker - free in the evening
      startHour = workEndHour + 1;
      numActivities = 2;
    }

    for (let i = 0; i < numActivities && i < placesToUse.length; i++) {
      const placeIndex = (day * numActivities + i) % placesToUse.length;
      const place = placesToUse[placeIndex];
      const activityStart = startHour + i * 2;

      dayActivities.push({
        id: `activity-${tripId}-${day}-${i}`,
        itineraryId: `itin-${tripId}-${day}`,
        placeId: place.id,
        place,
        startTime: `${activityStart.toString().padStart(2, "0")}:00`,
        endTime: `${(activityStart + 2).toString().padStart(2, "0")}:00`,
        travelMinutes: 10 + Math.floor(Math.random() * 15),
        status: "PLANNED",
        order: i,
      });
    }

    itineraries.push({
      id: `itin-${tripId}-${day}`,
      tripId,
      date: date.toISOString().split("T")[0],
      activities: dayActivities,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    });
  }

  return itineraries;
}

export function getMockPlacesForDestination(destination: string): Place[] {
  const placesByCity: Record<string, Place[]> = {
    "Seattle, WA": [
      {
        id: "p1",
        name: "Pike Place Market",
        category: "FOOD",
        address: "85 Pike St, Seattle, WA",
        latitude: 47.6097,
        longitude: -122.3425,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Iconic farmer's market with fresh seafood, local crafts, and the original Starbucks.",
      },
      {
        id: "p2",
        name: "Museum of Pop Culture",
        category: "CULTURE",
        address: "325 5th Ave N, Seattle, WA",
        latitude: 47.6215,
        longitude: -122.3481,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Interactive museum dedicated to contemporary popular culture.",
      },
      {
        id: "p3",
        name: "Discovery Park",
        category: "OUTDOORS",
        address: "3801 Discovery Park Blvd, Seattle, WA",
        latitude: 47.6573,
        longitude: -122.4057,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "534-acre park with sea cliffs, forest trails, and lighthouse views.",
      },
      {
        id: "p4",
        name: "Canlis",
        category: "FOOD",
        address: "2576 Aurora Ave N, Seattle, WA",
        latitude: 47.6432,
        longitude: -122.3467,
        rating: 4.9,
        amazonRating: 4.8,
        priceLevel: 4,
        imageUrl: "",
        description:
          "Upscale Pacific Northwest cuisine with stunning lake views.",
      },
      {
        id: "p5",
        name: "Chihuly Garden and Glass",
        category: "CULTURE",
        address: "305 Harrison St, Seattle, WA",
        latitude: 47.6206,
        longitude: -122.3509,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 2,
        imageUrl: "",
        description: "Breathtaking glass art installations by Dale Chihuly.",
      },
      {
        id: "p6",
        name: "Kerry Park",
        category: "OUTDOORS",
        address: "211 W Highland Dr, Seattle, WA",
        latitude: 47.6295,
        longitude: -122.3596,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Iconic viewpoint with the best panoramic skyline views of Seattle.",
      },
      {
        id: "p7",
        name: "The Walrus and the Carpenter",
        category: "NIGHTLIFE",
        address: "4743 Ballard Ave NW, Seattle, WA",
        latitude: 47.6644,
        longitude: -122.3841,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description: "Trendy oyster bar with craft cocktails in Ballard.",
      },
      {
        id: "p8",
        name: "Banya 5",
        category: "WELLNESS",
        address: "216 9th Ave N, Seattle, WA",
        latitude: 47.6193,
        longitude: -122.3423,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Russian-style bathhouse with sauna, steam room, and cold plunge.",
      },
      {
        id: "p9",
        name: "Volunteer Park",
        category: "OUTDOORS",
        address: "1247 15th Ave E, Seattle, WA",
        latitude: 47.6304,
        longitude: -122.3155,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Olmsted-designed park with conservatory, museum, and water tower views.",
      },
      {
        id: "p16",
        name: "Din Tai Fung",
        category: "FOOD",
        address: "700 Bellevue Way NE, Bellevue, WA",
        latitude: 47.6148,
        longitude: -122.2007,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "World-famous soup dumplings. Always a wait, always worth it.",
      },
      {
        id: "p17",
        name: "The Crocodile",
        category: "NIGHTLIFE",
        address: "2505 1st Ave, Seattle, WA",
        latitude: 47.6157,
        longitude: -122.3477,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Legendary live music venue where Nirvana played. Intimate shows nightly.",
      },
      {
        id: "p18",
        name: "Olympic Sculpture Park",
        category: "CULTURE",
        address: "2901 Western Ave, Seattle, WA",
        latitude: 47.6166,
        longitude: -122.3553,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Free outdoor sculpture park with waterfront views and art installations.",
      },
      {
        id: "p19",
        name: "Storyville Coffee",
        category: "FOOD",
        address: "1001 1st Ave, Seattle, WA",
        latitude: 47.6055,
        longitude: -122.3364,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Premium coffee roaster with cozy atmosphere. Perfect for morning work.",
      },
      {
        id: "p20",
        name: "Gas Works Park",
        category: "OUTDOORS",
        address: "2101 N Northlake Way, Seattle, WA",
        latitude: 47.6456,
        longitude: -122.3344,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Unique park built on old gasification plant. Best city skyline views.",
      },
      {
        id: "p21",
        name: "Canon",
        category: "NIGHTLIFE",
        address: "928 12th Ave, Seattle, WA",
        latitude: 47.6094,
        longitude: -122.3167,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 3,
        imageUrl: "",
        description:
          "World-class whiskey bar with 4,000+ bottles. Craft cocktails in Capitol Hill.",
      },
      {
        id: "p22",
        name: "Vios Cafe",
        category: "FOOD",
        address: "903 19th Ave E, Seattle, WA",
        latitude: 47.6241,
        longitude: -122.3069,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Mediterranean cafe with a kids play area. Great for a relaxed brunch.",
      },
    ],
    "Austin, TX": [
      {
        id: "p10",
        name: "Franklin Barbecue",
        category: "FOOD",
        address: "900 E 11th St, Austin, TX",
        latitude: 30.2701,
        longitude: -97.7312,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Legendary BBQ joint - arrive early, the brisket is worth the wait.",
      },
      {
        id: "p11",
        name: "Barton Springs Pool",
        category: "OUTDOORS",
        address: "2201 Barton Springs Rd, Austin, TX",
        latitude: 30.264,
        longitude: -97.771,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 1,
        imageUrl: "",
        description: "Natural spring-fed pool perfect for a post-work swim.",
      },
      {
        id: "p12",
        name: "6th Street",
        category: "NIGHTLIFE",
        address: "E 6th St, Austin, TX",
        latitude: 30.2672,
        longitude: -97.7395,
        rating: 4.3,
        amazonRating: 4.2,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Austin's famous entertainment district with live music venues.",
      },
      {
        id: "p13",
        name: "Lady Bird Lake Trail",
        category: "OUTDOORS",
        address: "S Lakeshore Blvd, Austin, TX",
        latitude: 30.2509,
        longitude: -97.7432,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description: "10-mile hike and bike trail along the Colorado River.",
      },
      {
        id: "p14",
        name: "The Blanton Museum of Art",
        category: "CULTURE",
        address: "200 E Martin Luther King Jr Blvd, Austin, TX",
        latitude: 30.2809,
        longitude: -97.7374,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 1,
        imageUrl: "",
        description: "University of Texas art museum with 21,000+ works.",
      },
      {
        id: "p15",
        name: "Uchi",
        category: "FOOD",
        address: "801 S Lamar Blvd, Austin, TX",
        latitude: 30.2554,
        longitude: -97.7637,
        rating: 4.8,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Award-winning Japanese restaurant with innovative dishes.",
      },
      {
        id: "atx1",
        name: "Zilker Park",
        category: "OUTDOORS",
        address: "2100 Barton Springs Rd, Austin, TX",
        latitude: 30.2669,
        longitude: -97.7729,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "351-acre park with trails, botanical gardens, and access to Barton Springs.",
      },
      {
        id: "atx2",
        name: "Ramen Tatsu-Ya",
        category: "FOOD",
        address: "1234 S Lamar Blvd, Austin, TX",
        latitude: 30.2531,
        longitude: -97.7648,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Best ramen in Texas. Rich tonkotsu broth, always packed.",
      },
      {
        id: "atx3",
        name: "Rainey Street",
        category: "NIGHTLIFE",
        address: "Rainey St, Austin, TX",
        latitude: 30.2569,
        longitude: -97.7397,
        rating: 4.4,
        amazonRating: 4.3,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Strip of converted bungalows turned into bars. More chill than 6th St.",
      },
      {
        id: "atx4",
        name: "The Contemporary Austin",
        category: "CULTURE",
        address: "700 Congress Ave, Austin, TX",
        latitude: 30.2674,
        longitude: -97.7442,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Contemporary art museum with rooftop terrace overlooking Congress Ave.",
      },
      {
        id: "atx5",
        name: "Tacodeli",
        category: "FOOD",
        address: "1500 Spyglass Dr, Austin, TX",
        latitude: 30.2542,
        longitude: -97.7813,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Austin breakfast taco institution. The Otto is legendary.",
      },
      {
        id: "atx6",
        name: "Mount Bonnell",
        category: "OUTDOORS",
        address: "3800 Mt Bonnell Rd, Austin, TX",
        latitude: 30.3209,
        longitude: -97.7733,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Short climb to stunning 360-degree views of Lake Austin and the Hill Country.",
      },
      {
        id: "atx7",
        name: "Broken Spoke",
        category: "NIGHTLIFE",
        address: "3201 S Lamar Blvd, Austin, TX",
        latitude: 30.2385,
        longitude: -97.7816,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Classic Texas honky-tonk since 1964. Two-stepping and cold beer.",
      },
      {
        id: "atx8",
        name: "Suerte",
        category: "FOOD",
        address: "1800 E 6th St, Austin, TX",
        latitude: 30.2602,
        longitude: -97.724,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Modern Mexican cuisine with house-made masa. One of Austin's best.",
      },
      {
        id: "atx9",
        name: "Deep Eddy Pool",
        category: "OUTDOORS",
        address: "401 Deep Eddy Ave, Austin, TX",
        latitude: 30.2753,
        longitude: -97.773,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Spring-fed swimming pool open year-round since 1915. Cold and refreshing.",
      },
    ],
    "New York, NY": [
      {
        id: "ny1",
        name: "The Metropolitan Museum of Art",
        category: "CULTURE",
        address: "1000 5th Ave, New York, NY",
        latitude: 40.7794,
        longitude: -73.9632,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 2,
        imageUrl: "",
        description:
          "World-class art museum with over 5,000 years of art from around the globe.",
      },
      {
        id: "ny2",
        name: "Central Park",
        category: "OUTDOORS",
        address: "Central Park, New York, NY",
        latitude: 40.7829,
        longitude: -73.9654,
        rating: 4.8,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "843-acre urban park with lakes, trails, and iconic landmarks.",
      },
      {
        id: "ny3",
        name: "Joe's Pizza",
        category: "FOOD",
        address: "7 Carmine St, New York, NY",
        latitude: 40.7306,
        longitude: -74.0003,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Classic NYC slice joint. Cash only, no-frills, perfect thin crust pizza.",
      },
      {
        id: "ny4",
        name: "The High Line",
        category: "OUTDOORS",
        address: "New York, NY 10011",
        latitude: 40.748,
        longitude: -74.0048,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Elevated park built on a former rail line with gardens and city views.",
      },
      {
        id: "ny5",
        name: "Le Bernardin",
        category: "FOOD",
        address: "155 W 51st St, New York, NY",
        latitude: 40.7616,
        longitude: -73.9818,
        rating: 4.9,
        amazonRating: 4.8,
        priceLevel: 4,
        imageUrl: "",
        description:
          "Three-Michelin-star French seafood restaurant. A bucket-list meal.",
      },
      {
        id: "ny6",
        name: "Brooklyn Bridge Walk",
        category: "OUTDOORS",
        address: "Brooklyn Bridge, New York, NY",
        latitude: 40.7061,
        longitude: -73.9969,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Walk across the iconic bridge at sunset for unforgettable skyline views.",
      },
      {
        id: "ny7",
        name: "Please Don't Tell (PDT)",
        category: "NIGHTLIFE",
        address: "113 St Marks Pl, New York, NY",
        latitude: 40.7273,
        longitude: -73.9838,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Hidden speakeasy behind a phone booth in a hot dog shop. Reservations recommended.",
      },
      {
        id: "ny8",
        name: "Aire Ancient Baths",
        category: "WELLNESS",
        address: "88 Franklin St, New York, NY",
        latitude: 40.7185,
        longitude: -74.0042,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Luxurious thermal bath experience in a restored 19th-century building.",
      },
      {
        id: "ny9",
        name: "Washington Square Park",
        category: "OUTDOORS",
        address: "Washington Square, New York, NY",
        latitude: 40.7308,
        longitude: -74.0009,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Iconic Greenwich Village park with fountain, chess players, and street performers.",
      },
      {
        id: "ny10",
        name: "Xi'an Famous Foods",
        category: "FOOD",
        address: "81 St Marks Pl, New York, NY",
        latitude: 40.7278,
        longitude: -73.9876,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Hand-pulled noodles and spicy lamb burgers. Fast, cheap, incredible.",
      },
      {
        id: "ny11",
        name: "Attaboy",
        category: "NIGHTLIFE",
        address: "134 Eldridge St, New York, NY",
        latitude: 40.7194,
        longitude: -73.9913,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Speakeasy-style cocktail bar. No menu - tell them what you like.",
      },
      {
        id: "ny12",
        name: "The Whitney Museum",
        category: "CULTURE",
        address: "99 Gansevoort St, New York, NY",
        latitude: 40.7396,
        longitude: -74.0089,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 2,
        imageUrl: "",
        description:
          "American art museum with outdoor terraces and stunning Hudson River views.",
      },
      {
        id: "ny13",
        name: "Los Tacos No. 1",
        category: "FOOD",
        address: "229 W 43rd St, New York, NY",
        latitude: 40.7574,
        longitude: -73.9882,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Best tacos in NYC. Adobada on handmade corn tortillas. Cash only.",
      },
      {
        id: "ny14",
        name: "Prospect Park",
        category: "OUTDOORS",
        address: "Prospect Park, Brooklyn, NY",
        latitude: 40.6602,
        longitude: -73.969,
        rating: 4.8,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Brooklyn's 526-acre park. Less crowded than Central Park with a beautiful lake.",
      },
      {
        id: "ny15",
        name: "QC NY Spa",
        category: "WELLNESS",
        address: "Governors Island, New York, NY",
        latitude: 40.6892,
        longitude: -74.0168,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 4,
        imageUrl: "",
        description:
          "Italian-style day spa on Governors Island with Statue of Liberty views.",
      },
      {
        id: "ny16",
        name: "Smorgasburg",
        category: "FOOD",
        address: "90 Kent Ave, Brooklyn, NY",
        latitude: 40.7216,
        longitude: -73.9614,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Weekend outdoor food market with 100+ vendors. Brooklyn's food paradise.",
      },
    ],
    "San Francisco, CA": [
      {
        id: "sf1",
        name: "Golden Gate Park",
        category: "OUTDOORS",
        address: "Golden Gate Park, San Francisco, CA",
        latitude: 37.7694,
        longitude: -122.4862,
        rating: 4.8,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "1,017-acre urban park with gardens, museums, and bison paddock.",
      },
      {
        id: "sf2",
        name: "Tartine Bakery",
        category: "FOOD",
        address: "600 Guerrero St, San Francisco, CA",
        latitude: 37.7614,
        longitude: -122.4241,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Legendary bakery known for morning buns and country bread. Expect a line.",
      },
      {
        id: "sf3",
        name: "SF MOMA",
        category: "CULTURE",
        address: "151 3rd St, San Francisco, CA",
        latitude: 37.7857,
        longitude: -122.4011,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Modern art museum with 33,000+ works across seven floors.",
      },
      {
        id: "sf4",
        name: "Lands End Trail",
        category: "OUTDOORS",
        address: "Lands End Trail, San Francisco, CA",
        latitude: 37.7878,
        longitude: -122.5049,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Coastal trail with Golden Gate Bridge views and hidden beach ruins.",
      },
      {
        id: "sf5",
        name: "State Bird Provisions",
        category: "FOOD",
        address: "1529 Fillmore St, San Francisco, CA",
        latitude: 37.7835,
        longitude: -122.4327,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Michelin-starred dim sum-style dining with creative Californian dishes.",
      },
      {
        id: "sf6",
        name: "Exploratorium",
        category: "CULTURE",
        address: "Pier 15, San Francisco, CA",
        latitude: 37.8017,
        longitude: -122.3977,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Hands-on science museum on the waterfront. Thursday nights are 18+ only.",
      },
      {
        id: "sf7",
        name: "Smuggler's Cove",
        category: "NIGHTLIFE",
        address: "650 Gough St, San Francisco, CA",
        latitude: 37.7781,
        longitude: -122.4236,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Award-winning tiki bar with 900+ rums and pirate ship decor. A SF classic.",
      },
      {
        id: "sf8",
        name: "Kabuki Springs & Spa",
        category: "WELLNESS",
        address: "1750 Geary Blvd, San Francisco, CA",
        latitude: 37.7851,
        longitude: -122.4316,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Japanese-style communal bathhouse with hot pool, cold plunge, and steam room.",
      },
      {
        id: "sf9",
        name: "Dolores Park",
        category: "OUTDOORS",
        address: "Dolores Park, San Francisco, CA",
        latitude: 37.7596,
        longitude: -122.4269,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 0,
        imageUrl: "",
        description:
          "SF's favorite park for picnics and people-watching. Best city views.",
      },
      {
        id: "sf10",
        name: "Tartine Manufactory",
        category: "FOOD",
        address: "595 Alabama St, San Francisco, CA",
        latitude: 37.7632,
        longitude: -122.4116,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Expanded bakery-restaurant with sourdough, ice cream, and seasonal dishes.",
      },
      {
        id: "sf11",
        name: "Trick Dog",
        category: "NIGHTLIFE",
        address: "3010 20th St, San Francisco, CA",
        latitude: 37.7586,
        longitude: -122.4189,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Creative cocktail bar in the Mission with a menu that changes themes annually.",
      },
      {
        id: "sf12",
        name: "de Young Museum",
        category: "CULTURE",
        address: "50 Hagiwara Tea Garden Dr, San Francisco, CA",
        latitude: 37.7716,
        longitude: -122.4686,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Fine arts museum in Golden Gate Park with an observation tower.",
      },
      {
        id: "sf13",
        name: "Burma Superstar",
        category: "FOOD",
        address: "309 Clement St, San Francisco, CA",
        latitude: 37.7832,
        longitude: -122.4637,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Burmese restaurant famous for tea leaf salad. Expect a wait.",
      },
      {
        id: "sf14",
        name: "Crissy Field",
        category: "OUTDOORS",
        address: "1199 E Beach, San Francisco, CA",
        latitude: 37.8038,
        longitude: -122.4647,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Waterfront path with Golden Gate Bridge views. Great for running or walking.",
      },
      {
        id: "sf15",
        name: "Liholiho Yacht Club",
        category: "FOOD",
        address: "871 Sutter St, San Francisco, CA",
        latitude: 37.7879,
        longitude: -122.4139,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Hawaiian-inspired fine dining with creative cocktails. Fun, lively atmosphere.",
      },
      {
        id: "sf16",
        name: "Archimedes Banya",
        category: "WELLNESS",
        address: "748 Innes Ave, San Francisco, CA",
        latitude: 37.7351,
        longitude: -122.3715,
        rating: 4.4,
        amazonRating: 4.3,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Russian-style bathhouse with sauna, cold plunge, and rooftop deck.",
      },
    ],
    "Nashville, TN": [
      {
        id: "nv1",
        name: "Hattie B's Hot Chicken",
        category: "FOOD",
        address: "112 19th Ave S, Nashville, TN",
        latitude: 36.1527,
        longitude: -86.7986,
        rating: 4.5,
        amazonRating: 4.7,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Nashville hot chicken institution. Try 'Shut the Cluck Up' if you dare.",
      },
      {
        id: "nv2",
        name: "The Parthenon",
        category: "CULTURE",
        address: "2500 West End Ave, Nashville, TN",
        latitude: 36.1498,
        longitude: -86.8134,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Full-scale replica of the Greek Parthenon with a 42-foot Athena statue inside.",
      },
      {
        id: "nv3",
        name: "Percy Warner Park",
        category: "OUTDOORS",
        address: "7311 TN-100, Nashville, TN",
        latitude: 36.0656,
        longitude: -86.8975,
        rating: 4.8,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "2,684-acre park with scenic hiking trails and horse riding paths.",
      },
      {
        id: "nv4",
        name: "Broadway Honky Tonks",
        category: "NIGHTLIFE",
        address: "Lower Broadway, Nashville, TN",
        latitude: 36.1592,
        longitude: -86.7767,
        rating: 4.4,
        amazonRating: 4.3,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Free live music all day and night. Robert's Western World is a local favorite.",
      },
      {
        id: "nv5",
        name: "Country Music Hall of Fame",
        category: "CULTURE",
        address: "222 Rep. John Lewis Way S, Nashville, TN",
        latitude: 36.1585,
        longitude: -86.7762,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Museum dedicated to country music history with rotating exhibits and performances.",
      },
      {
        id: "nv6",
        name: "Prince's Hot Chicken",
        category: "FOOD",
        address: "123 Ewing Dr, Nashville, TN",
        latitude: 36.1869,
        longitude: -86.7556,
        rating: 4.4,
        amazonRating: 4.6,
        priceLevel: 1,
        imageUrl: "",
        description:
          "The original hot chicken since 1945. A Nashville pilgrimage.",
      },
      {
        id: "nv7",
        name: "Shelby Bottoms Greenway",
        category: "OUTDOORS",
        address: "1900 Davidson St, Nashville, TN",
        latitude: 36.1743,
        longitude: -86.7356,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Paved trail along the Cumberland River. Great for morning runs.",
      },
      {
        id: "nv8",
        name: "The Patterson House",
        category: "NIGHTLIFE",
        address: "1711 Division St, Nashville, TN",
        latitude: 36.1518,
        longitude: -86.7943,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Upscale speakeasy with handcrafted cocktails. No standing, reservation only.",
      },
      {
        id: "nv9",
        name: "Centennial Park",
        category: "OUTDOORS",
        address: "2500 West End Ave, Nashville, TN",
        latitude: 36.1498,
        longitude: -86.8134,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "132-acre park home to the Parthenon replica. Great for walking and running.",
      },
      {
        id: "nv10",
        name: "Loveless Cafe",
        category: "FOOD",
        address: "8400 TN-100, Nashville, TN",
        latitude: 36.0439,
        longitude: -86.9563,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Southern breakfast institution famous for biscuits and country ham since 1951.",
      },
      {
        id: "nv11",
        name: "Pinewood Social",
        category: "NIGHTLIFE",
        address: "33 Peabody St, Nashville, TN",
        latitude: 36.1622,
        longitude: -86.768,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Coffee by day, cocktails by night. Plus bowling lanes and an outdoor pool.",
      },
      {
        id: "nv12",
        name: "Frist Art Museum",
        category: "CULTURE",
        address: "919 Broadway, Nashville, TN",
        latitude: 36.1575,
        longitude: -86.7817,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Art Deco building with rotating world-class exhibitions. No permanent collection.",
      },
      {
        id: "nv13",
        name: "Party Fowl",
        category: "FOOD",
        address: "719 8th Ave S, Nashville, TN",
        latitude: 36.1527,
        longitude: -86.7802,
        rating: 4.4,
        amazonRating: 4.3,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Hot chicken with a twist - try it on a waffle or in a taco. Great brunch.",
      },
      {
        id: "nv14",
        name: "Radnor Lake State Park",
        category: "OUTDOORS",
        address: "1160 Otter Creek Rd, Nashville, TN",
        latitude: 36.0622,
        longitude: -86.81,
        rating: 4.8,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Protected natural area with 6 hiking trails. Peaceful escape from the city.",
      },
      {
        id: "nv15",
        name: "Attaboy Nashville",
        category: "NIGHTLIFE",
        address: "8 McFerrin Ave, Nashville, TN",
        latitude: 36.18,
        longitude: -86.7619,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Craft cocktails in an intimate East Nashville space. No menu - trust the bartender.",
      },
      {
        id: "nv16",
        name: "Five Daughters Bakery",
        category: "FOOD",
        address: "1110 Caruthers Ave, Nashville, TN",
        latitude: 36.15,
        longitude: -86.7625,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 1,
        imageUrl: "",
        description:
          "100-layer donuts and pastries in 12 South. The cronut before cronuts were a thing.",
      },
    ],
    "Arlington, VA": [
      {
        id: "ar1",
        name: "Arlington National Cemetery",
        category: "CULTURE",
        address: "Arlington National Cemetery, Arlington, VA",
        latitude: 38.876,
        longitude: -77.0745,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Historic military cemetery with the Tomb of the Unknown Soldier and JFK gravesite.",
      },
      {
        id: "ar2",
        name: "Mt. Vernon Trail",
        category: "OUTDOORS",
        address: "Mt Vernon Trail, Arlington, VA",
        latitude: 38.8605,
        longitude: -77.0518,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "18-mile paved trail along the Potomac with views of DC monuments.",
      },
      {
        id: "ar3",
        name: "Gravelly Point Park",
        category: "OUTDOORS",
        address: "Gravelly Point, Arlington, VA",
        latitude: 38.8624,
        longitude: -77.0387,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Watch planes land directly overhead at Reagan Airport. Amazing at sunset.",
      },
      {
        id: "ar4",
        name: "Ambar",
        category: "FOOD",
        address: "2901 Wilson Blvd, Arlington, VA",
        latitude: 38.8863,
        longitude: -77.0928,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Balkan all-you-can-eat small plates with great cocktails in Clarendon.",
      },
      {
        id: "ar5",
        name: "DEA Museum",
        category: "CULTURE",
        address: "700 Army Navy Dr, Arlington, VA",
        latitude: 38.8631,
        longitude: -77.0617,
        rating: 4.3,
        amazonRating: 4.4,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Free museum covering the history of drug enforcement in America.",
      },
      {
        id: "ar6",
        name: "Green Pig Bistro",
        category: "FOOD",
        address: "1025 N Fillmore St, Arlington, VA",
        latitude: 38.8847,
        longitude: -77.0914,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Farm-to-table American bistro with creative seasonal dishes.",
      },
      {
        id: "ar7",
        name: "Galaxy Hut",
        category: "NIGHTLIFE",
        address: "2711 Wilson Blvd, Arlington, VA",
        latitude: 38.886,
        longitude: -77.0896,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Chill neighborhood bar with great craft beer selection and live indie music.",
      },
      {
        id: "ar8",
        name: "Air Force Memorial",
        category: "CULTURE",
        address: "1 Air Force Memorial Dr, Arlington, VA",
        latitude: 38.8691,
        longitude: -77.0672,
        rating: 4.7,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Stunning stainless steel spires with panoramic views of DC and the Pentagon.",
      },
      {
        id: "ar9",
        name: "Theodore Roosevelt Island",
        category: "OUTDOORS",
        address: "George Washington Pkwy, Arlington, VA",
        latitude: 38.8959,
        longitude: -77.0638,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "88-acre wooded island in the Potomac with trails and memorial. Hidden gem.",
      },
      {
        id: "ar10",
        name: "Ambar Clarendon",
        category: "FOOD",
        address: "2901 Wilson Blvd, Arlington, VA",
        latitude: 38.8863,
        longitude: -77.0928,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Balkan all-you-can-eat brunch and dinner. Unlimited small plates.",
      },
      {
        id: "ar11",
        name: "Don Tito",
        category: "NIGHTLIFE",
        address: "3165 Wilson Blvd, Arlington, VA",
        latitude: 38.8869,
        longitude: -77.0972,
        rating: 4.3,
        amazonRating: 4.2,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Tex-Mex restaurant with rooftop bar and DJs on weekends. Clarendon nightlife staple.",
      },
      {
        id: "ar12",
        name: "Newseum",
        category: "CULTURE",
        address: "1 Freedom Forum, Arlington, VA",
        latitude: 38.8913,
        longitude: -77.0193,
        rating: 4.6,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Interactive museum covering journalism and free press history.",
      },
      {
        id: "ar13",
        name: "Bob & Edith's Diner",
        category: "FOOD",
        address: "2310 Columbia Pike, Arlington, VA",
        latitude: 38.8569,
        longitude: -77.0868,
        rating: 4.4,
        amazonRating: 4.3,
        priceLevel: 1,
        imageUrl: "",
        description:
          "24-hour diner serving breakfast all day. Classic American comfort food.",
      },
      {
        id: "ar14",
        name: "Long Bridge Park",
        category: "OUTDOORS",
        address: "475 Long Bridge Dr, Arlington, VA",
        latitude: 38.8614,
        longitude: -77.0556,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Modern park with synthetic turf fields, walking paths, and Potomac views.",
      },
      {
        id: "ar15",
        name: "Spider Kelly's",
        category: "NIGHTLIFE",
        address: "3181 Wilson Blvd, Arlington, VA",
        latitude: 38.887,
        longitude: -77.0976,
        rating: 4.2,
        amazonRating: 4.1,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Classic Clarendon bar with pool tables, darts, and a solid beer selection.",
      },
      {
        id: "ar16",
        name: "Pupatella",
        category: "FOOD",
        address: "5104 Wilson Blvd, Arlington, VA",
        latitude: 38.883,
        longitude: -77.115,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Neapolitan pizza from a wood-fired oven. Certified by Naples pizza association.",
      },
    ],
    "Vancouver, BC": [
      {
        id: "van1",
        name: "Stanley Park Seawall",
        category: "OUTDOORS",
        address: "Stanley Park, Vancouver, BC",
        latitude: 49.3017,
        longitude: -123.1417,
        rating: 4.9,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "North America's largest urban park with a stunning 10km seawall trail along the waterfront.",
      },
      {
        id: "van2",
        name: "Granville Island Public Market",
        category: "FOOD",
        address: "1661 Duranleau St, Vancouver, BC",
        latitude: 49.2712,
        longitude: -123.134,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Vibrant public market with local produce, artisan foods, and waterfront dining.",
      },
      {
        id: "van3",
        name: "St. Lawrence Restaurant",
        category: "FOOD",
        address: "269 Powell St, Vancouver, BC",
        latitude: 49.2831,
        longitude: -123.0983,
        rating: 4.8,
        amazonRating: 4.9,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Award-winning French-Canadian cuisine. Reservations essential.",
      },
      {
        id: "van4",
        name: "Museum of Anthropology",
        category: "CULTURE",
        address: "6393 NW Marine Dr, Vancouver, BC",
        latitude: 49.2697,
        longitude: -123.2594,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 2,
        imageUrl: "",
        description:
          "World-renowned collection of Pacific Northwest First Nations art and totem poles.",
      },
      {
        id: "van5",
        name: "Grouse Mountain",
        category: "OUTDOORS",
        address: "6400 Nancy Greene Way, North Vancouver, BC",
        latitude: 49.3805,
        longitude: -123.0819,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Take the Skyride gondola for panoramic views and alpine hiking trails.",
      },
      {
        id: "van6",
        name: "Kissa Tanto",
        category: "NIGHTLIFE",
        address: "263 E Pender St, Vancouver, BC",
        latitude: 49.2803,
        longitude: -123.0962,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Japanese-Italian cocktail bar and restaurant. Moody upstairs lounge with great drinks.",
      },
      {
        id: "van7",
        name: "Miku",
        category: "FOOD",
        address: "200 Granville St #70, Vancouver, BC",
        latitude: 49.2876,
        longitude: -123.1115,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Aburi (flame-seared) sushi with stunning Coal Harbour waterfront views.",
      },
      {
        id: "van8",
        name: "Scandinave Spa",
        category: "WELLNESS",
        address: "8010 Mons Rd, Whistler, BC",
        latitude: 50.1152,
        longitude: -122.9482,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Nordic-inspired hydrotherapy spa. Hot and cold pools surrounded by forest. Worth the drive.",
      },
    ],
    "Oakville, ON": [
      {
        id: "oak1",
        name: "Hexagon Restaurant",
        category: "FOOD",
        address: "99 Lakeshore Rd E, Oakville, ON",
        latitude: 43.4478,
        longitude: -79.6677,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Upscale contemporary dining with seasonal Canadian ingredients in downtown Oakville.",
      },
      {
        id: "oak2",
        name: "Bronte Creek Provincial Park",
        category: "OUTDOORS",
        address: "1219 Burloak Dr, Oakville, ON",
        latitude: 43.3994,
        longitude: -79.7517,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 1,
        imageUrl: "",
        description:
          "1,600-acre park with hiking trails, a swimming pool, and farm animals.",
      },
      {
        id: "oak3",
        name: "Kerr Village",
        category: "CULTURE",
        address: "Kerr St, Oakville, ON",
        latitude: 43.4465,
        longitude: -79.6824,
        rating: 4.3,
        amazonRating: 4.4,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Artsy neighborhood with indie shops, galleries, cafes, and a vibrant Saturday market.",
      },
      {
        id: "oak4",
        name: "Colossus Greek Tavern",
        category: "FOOD",
        address: "274 North Service Rd E, Oakville, ON",
        latitude: 43.4573,
        longitude: -79.6539,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Authentic Greek cuisine with lively atmosphere and generous portions.",
      },
      {
        id: "oak5",
        name: "Oakville Lakeside Park",
        category: "OUTDOORS",
        address: "Lakeside Park, Oakville, ON",
        latitude: 43.4385,
        longitude: -79.6662,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Beautiful lakefront park on Lake Ontario with walking paths, pier, and sunset views.",
      },
      {
        id: "oak6",
        name: "Paradiso Restaurant",
        category: "FOOD",
        address: "174 Lakeshore Rd E, Oakville, ON",
        latitude: 43.4473,
        longitude: -79.6641,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Italian fine dining with wood-fired oven and seasonal pasta dishes.",
      },
      {
        id: "oak7",
        name: "The Moonshine Cafe",
        category: "NIGHTLIFE",
        address: "137 Kerr St, Oakville, ON",
        latitude: 43.4463,
        longitude: -79.682,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Live music venue with blues, folk, and jazz. Intimate setting with great craft beer.",
      },
      {
        id: "oak8",
        name: "Trellis Spa",
        category: "WELLNESS",
        address: "3525 Wyecroft Rd, Oakville, ON",
        latitude: 43.4131,
        longitude: -79.7163,
        rating: 4.3,
        amazonRating: 4.4,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Full-service spa with massage, facials, and hydrotherapy in a modern setting.",
      },
    ],
    "Stoney Creek, ON": [
      {
        id: "sc1",
        name: "Devil's Punchbowl Conservation Area",
        category: "OUTDOORS",
        address: "Ridge Rd, Stoney Creek, ON",
        latitude: 43.2131,
        longitude: -79.7711,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Dramatic waterfall cascading into a bowl-shaped gorge. Stunning Escarpment views.",
      },
      {
        id: "sc2",
        name: "Fifty Point Conservation Area",
        category: "OUTDOORS",
        address: "1479 Baseline Rd, Stoney Creek, ON",
        latitude: 43.2298,
        longitude: -79.6295,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Lakefront park with marina, beach, trails, and great birding on Lake Ontario.",
      },
      {
        id: "sc3",
        name: "The French",
        category: "FOOD",
        address: "37 King William St, Hamilton, ON",
        latitude: 43.256,
        longitude: -79.8676,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "French bistro in Hamilton's arts district. Excellent wine list and charcuterie.",
      },
      {
        id: "sc4",
        name: "Augusta St Strip",
        category: "NIGHTLIFE",
        address: "Augusta St, Hamilton, ON",
        latitude: 43.2558,
        longitude: -79.8712,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Hamilton's main nightlife strip with cocktail bars, live music venues, and breweries.",
      },
      {
        id: "sc5",
        name: "Battlefield House Museum",
        category: "CULTURE",
        address: "77 King St W, Stoney Creek, ON",
        latitude: 43.2147,
        longitude: -79.7621,
        rating: 4.3,
        amazonRating: 4.2,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Historic site of the 1813 Battle of Stoney Creek with period reenactments and gardens.",
      },
      {
        id: "sc6",
        name: "Hambrgr",
        category: "FOOD",
        address: "49 King William St, Hamilton, ON",
        latitude: 43.2562,
        longitude: -79.867,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Gourmet burger joint in Hamilton with creative toppings and local craft beer.",
      },
      {
        id: "sc7",
        name: "Bruce Trail - Dofasco Section",
        category: "OUTDOORS",
        address: "Dofasco Trail, Hamilton, ON",
        latitude: 43.2245,
        longitude: -79.8189,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Scenic section of Canada's oldest and longest hiking trail along the Niagara Escarpment.",
      },
      {
        id: "sc8",
        name: "Collective Arts Brewing",
        category: "NIGHTLIFE",
        address: "207 Burlington St E, Hamilton, ON",
        latitude: 43.2686,
        longitude: -79.8548,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Craft brewery with taproom, art gallery, and rotating food trucks. Great IPAs.",
      },
    ],
    "Cambridge, ON": [
      {
        id: "cam1",
        name: "Cambridge Butterfly Conservatory",
        category: "CULTURE",
        address: "2500 Kossuth Rd, Cambridge, ON",
        latitude: 43.4085,
        longitude: -80.3795,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Walk among 2,000+ tropical butterflies in a lush indoor garden. Family-friendly.",
      },
      {
        id: "cam2",
        name: "Cambridge to Paris Rail Trail",
        category: "OUTDOORS",
        address: "Rail Trail, Cambridge, ON",
        latitude: 43.3556,
        longitude: -80.3207,
        rating: 4.7,
        amazonRating: 4.8,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Scenic 18km trail along the Grand River. Great for cycling or a long walk.",
      },
      {
        id: "cam3",
        name: "Langs Farm Trail",
        category: "OUTDOORS",
        address: "Langs Farm, Cambridge, ON",
        latitude: 43.38,
        longitude: -80.34,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Peaceful riverside trail system with wetlands and bird watching.",
      },
      {
        id: "cam4",
        name: "Cambridge Mill",
        category: "FOOD",
        address: "100 Water St N, Cambridge, ON",
        latitude: 43.3584,
        longitude: -80.3167,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Fine dining in a historic mill overlooking the Grand River. Great brunch spot.",
      },
      {
        id: "cam5",
        name: "Grand River Brewing",
        category: "NIGHTLIFE",
        address: "50 Vogell Rd, Cambridge, ON",
        latitude: 43.3647,
        longitude: -80.3425,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Local craft brewery with taproom and patio. Try the Curmudgeon IPA.",
      },
      {
        id: "cam6",
        name: "Cambridge Farmers Market",
        category: "FOOD",
        address: "40 Dickson St, Cambridge, ON",
        latitude: 43.3593,
        longitude: -80.3133,
        rating: 4.5,
        amazonRating: 4.4,
        priceLevel: 1,
        imageUrl: "",
        description:
          "One of Canada's oldest farmers markets, running since 1830. Fresh local produce every Saturday.",
      },
      {
        id: "cam7",
        name: "Galt downtown",
        category: "CULTURE",
        address: "Main St, Cambridge, ON",
        latitude: 43.3576,
        longitude: -80.3143,
        rating: 4.3,
        amazonRating: 4.4,
        priceLevel: 1,
        imageUrl: "",
        description:
          "Historic downtown core with beautiful stone architecture, boutique shops, and river walks.",
      },
      {
        id: "cam8",
        name: "Borealis Grille & Bar",
        category: "FOOD",
        address: "10 Kearney St, Kitchener, ON",
        latitude: 43.452,
        longitude: -80.4977,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Farm-to-table Ontario cuisine with local ingredients and great craft beer selection.",
      },
    ],
    "Kitchener, ON": [
      {
        id: "kit1",
        name: "Victoria Park",
        category: "OUTDOORS",
        address: "80 Schneider Ave, Kitchener, ON",
        latitude: 43.4485,
        longitude: -80.495,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Kitchener's central park with lake, walking paths, and bandshell. Beautiful in all seasons.",
      },
      {
        id: "kit2",
        name: "The Walper Hotel Lokal",
        category: "NIGHTLIFE",
        address: "20 Queen St S, Kitchener, ON",
        latitude: 43.4512,
        longitude: -80.4925,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Rooftop cocktail bar in a beautifully restored 1893 hotel. Great city views.",
      },
      {
        id: "kit3",
        name: "Lancaster Smokehouse",
        category: "FOOD",
        address: "574 Lancaster St W, Kitchener, ON",
        latitude: 43.4312,
        longitude: -80.4732,
        rating: 4.6,
        amazonRating: 4.7,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Authentic Southern BBQ smoked in-house. The brisket and pulled pork are legendary.",
      },
      {
        id: "kit4",
        name: "THEMUSEUM",
        category: "CULTURE",
        address: "10 King St W, Kitchener, ON",
        latitude: 43.451,
        longitude: -80.4928,
        rating: 4.2,
        amazonRating: 4.3,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Interactive science and culture museum with rotating exhibitions. Fun for all ages.",
      },
      {
        id: "kit5",
        name: "Huether Hotel",
        category: "NIGHTLIFE",
        address: "59 King St N, Waterloo, ON",
        latitude: 43.4664,
        longitude: -80.5225,
        rating: 4.3,
        amazonRating: 4.4,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Historic 1842 hotel with three on-site bars, a brewery, and live music. A KW institution.",
      },
      {
        id: "kit6",
        name: "Proof Kitchen + Lounge",
        category: "FOOD",
        address: "24 King St W, Kitchener, ON",
        latitude: 43.4511,
        longitude: -80.4932,
        rating: 4.5,
        amazonRating: 4.6,
        priceLevel: 3,
        imageUrl: "",
        description:
          "Upscale-casual hotel restaurant combining local ingredients with global flavors.",
      },
      {
        id: "kit7",
        name: "Iron Horse Trail",
        category: "OUTDOORS",
        address: "Iron Horse Trail, Kitchener, ON",
        latitude: 43.4436,
        longitude: -80.4876,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 0,
        imageUrl: "",
        description:
          "Multi-use trail connecting Kitchener to Waterloo. Perfect for running or cycling.",
      },
      {
        id: "kit8",
        name: "Descendants Beer & Beverage Co.",
        category: "NIGHTLIFE",
        address: "319 Victoria St N, Kitchener, ON",
        latitude: 43.4589,
        longitude: -80.4796,
        rating: 4.4,
        amazonRating: 4.5,
        priceLevel: 2,
        imageUrl: "",
        description:
          "Craft brewery with inventive beers and a cozy taproom in a converted warehouse.",
      },
    ],
  };

  const cityKey = Object.keys(placesByCity).find((key) => {
    const cityName = key.toLowerCase().split(",")[0].trim();
    const dest = destination.toLowerCase().trim();
    return dest.includes(cityName) || cityName.includes(dest);
  });

  return placesByCity[cityKey || "Seattle, WA"];
}
