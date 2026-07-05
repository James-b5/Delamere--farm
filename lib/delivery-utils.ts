/**
 * Distance-based delivery fee calculator for Delamere Farm
 * Based on county/region distances from farm location
 */

// County distance zones (distance in km from farm, approximated)
const COUNTY_DISTANCES: Record<string, number> = {
  // Nairobi Metro (0-30 km)
  "Nairobi": 5,
  "Kiambu": 25,
  "Kajiado": 40,

  // Central Region (30-100 km)
  "Muranga": 60,
  "Nyeri": 80,
  "Kirinyaga": 100,
  "Embu": 120,
  "Tharaka Nithi": 140,

  // Eastern Region (100-200 km)
  "Makueni": 180,
  "Machakos": 120,
  "Kitui": 200,

  // Western Region (150-300 km)
  "Nakuru": 90,
  "Laikipia": 100,
  "Samburu": 250,
  "West Pokot": 300,
  "Uasin Gishu": 280,
  "Trans Nzoia": 320,

  // Coast Region (300+ km)
  "Mombasa": 480,
  "Kwale": 450,
  "Lamu": 600,
  "Kilifi": 420,
  "Taita Taveta": 350,

  // Rift Valley (100-300 km)
  "Bomet": 320,
  "Kericho": 300,
  "Narok": 150,
  "Nandi": 320,
  "Baringo": 200,
  "Turkana": 400,

  // Nyanza Region (250-350 km)
  "Kisii": 350,
  "Nyamira": 370,
  "Siaya": 400,
  "Kisumu": 420,
  "Homa Bay": 450,
  "Migori": 480,

  // Western Region
  "Kakamega": 380,
  "Vihiga": 370,
  "Bungoma": 360,
};

// Delivery fee structure based on distance
export function calculateDeliveryFee(county: string, distance?: number): number {
  // Use provided distance or look up county
  const dist = distance || COUNTY_DISTANCES[county] || 100;

  if (dist <= 30) {
    return 300; // Local delivery
  } else if (dist <= 60) {
    return 500; // Regional delivery
  } else if (dist <= 120) {
    return 800; // Long distance
  } else if (dist <= 250) {
    return 1500; // Very long distance
  } else {
    return 2500; // Ultra distance (requires quote)
  }
}

// Check if cart items require delivery
export function requiresDelivery(items: any[]): boolean {
  // If cart has any physical products (not services or farm visits), delivery is needed
  return items.some(
    (item) =>
      item.type !== "service" &&
      item.type !== "farm-visit" &&
      item.requiresDelivery !== false
  );
}

// Get delivery fee based on cart and county
export function getDeliveryFee(
  items: any[],
  county: string,
  distance?: number
): number {
  if (!requiresDelivery(items)) {
    return 0; // No delivery fee for services/farm visits
  }
  return calculateDeliveryFee(county, distance);
}

// Format fee display
export function formatDeliveryOption(name: string, fee: number): string {
  if (fee === 0) {
    return `${name} (No Delivery Fee)`;
  }
  return `${name} (KES ${fee.toLocaleString()})`;
}

// Get delivery options based on distance
export function getDeliveryOptions(
  county: string,
  distance?: number
): { name: string; fee: number }[] {
  const dist = distance || COUNTY_DISTANCES[county] || 100;

  if (dist > 250) {
    // Ultra distance - quote only
    return [
      { name: "Livestock Transport (Contact for Quote)", fee: 0 },
    ];
  } else if (dist > 120) {
    // Very long distance
    return [
      { name: "Standard Delivery", fee: 1500 },
      { name: "Express Delivery", fee: 2000 },
    ];
  } else if (dist > 60) {
    // Long distance
    return [
      { name: "Standard Delivery", fee: 800 },
      { name: "Express Delivery", fee: 1200 },
    ];
  } else if (dist > 30) {
    // Regional
    return [
      { name: "Standard Delivery", fee: 500 },
      { name: "Express Delivery", fee: 900 },
    ];
  } else {
    // Local
    return [
      { name: "Standard Delivery", fee: 300 },
      { name: "Express Delivery", fee: 600 },
      { name: "Same Day Delivery", fee: 1000 },
    ];
  }
}
