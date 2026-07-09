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

  const itineraries = generateMockItineraries(
    tripId,
    startDate,
    days,
    tripDraft,
    user
  );

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

  const relevantPlaces = places.filter((p) =>
    interests.some((i) => i.toLowerCase() === p.category.toLowerCase())
  );

  const placesToUse = relevantPlaces.length > 0 ? relevantPlaces : places;

  const itineraries: Itinerary[] = [];

  for (let day = 0; day < Math.min(days, 5); day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    const dayActivities: Activity[] = [];
    const workEnd = tripDraft.workEndTime || "17:00";

    const startHour = isWeekend ? 10 : parseInt(workEnd.split(":")[0]) + 1;
    const numActivities = isWeekend ? 4 : 2;

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

function getMockPlacesForDestination(destination: string): Place[] {
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
    ],
  };

  const cityKey = Object.keys(placesByCity).find((key) => {
    const cityName = key.toLowerCase().split(",")[0].trim();
    const dest = destination.toLowerCase().trim();
    return dest.includes(cityName) || cityName.includes(dest);
  });

  return placesByCity[cityKey || "Seattle, WA"];
}
