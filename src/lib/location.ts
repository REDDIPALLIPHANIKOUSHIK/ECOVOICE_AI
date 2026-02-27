// Location-based recycling rules engine

export interface UserLocation {
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

const STORAGE_KEY = "ecovoice_location";

// Indian city-specific recycling rules
const CITY_RULES: Record<string, Record<string, string>> = {
  "Mumbai": {
    "Plastic": "Separate into dry waste. BMC collects dry waste on alternate days. Drop at nearest dry waste collection center.",
    "Glass": "Place in dry waste bin. Handle carefully. BMC recycling centers accept glass.",
    "Paper": "Keep dry and clean. Goes in dry waste. Sell to local raddi/kabadiwala for recycling.",
    "Metal": "Dry waste category. Aluminium cans can be sold to kabadiwala.",
    "Food Waste": "Wet waste bin. BMC collects daily. Consider home composting with khamba.",
    "E-waste": "Do NOT mix with regular waste. Drop at BMC e-waste collection drives or certified recyclers like Karo Sambhav.",
    "Hazardous": "Separate collection. Contact BMC helpline 1916 for hazardous waste pickup.",
    "default": "Segregate into wet (green bin) and dry (blue bin) as per BMC guidelines."
  },
  "Delhi": {
    "Plastic": "Blue bin (dry waste). MCD collects recyclable waste. Can also sell to local kabadiwala.",
    "Glass": "Blue bin. Delhi has multiple recycling centers in each zone.",
    "Paper": "Blue bin (recyclable). Keep dry. Sell to kabadiwala for best value.",
    "Metal": "Blue bin. Scrap dealers actively collect metals in most colonies.",
    "Food Waste": "Green bin (wet waste). Daily collection by MCD. Composting encouraged.",
    "E-waste": "Contact Delhi Pollution Control Committee. Drop at authorized e-waste collection centers.",
    "Hazardous": "Do not discard in regular bins. Contact MCD for special collection.",
    "default": "Follow MCD three-bin system: Green (wet), Blue (dry recyclable), Black (domestic hazardous)."
  },
  "Bengaluru": {
    "Plastic": "Dry waste. BBMP collects on designated days. Many apartments have separate dry waste rooms.",
    "Glass": "Dry waste bin. BBMP dry waste collection centers accept glass.",
    "Paper": "Dry waste. Sell to kabadiwala. Bengaluru has strong informal recycling network.",
    "Metal": "Dry waste. Scrap collectors are active across the city.",
    "Food Waste": "Wet waste — daily BBMP collection. Bulk generators must compost on-site (BBMP mandate).",
    "E-waste": "Drop at BBMP e-waste collection drives. Certified recyclers like E-Parisaraa operate in the city.",
    "Hazardous": "Do not mix. BBMP arranges periodic collection drives for hazardous household waste.",
    "default": "BBMP mandates strict segregation: Wet, Dry, and Reject waste. Fines for non-compliance."
  },
  "Chennai": {
    "Plastic": "Blue bin (recyclable). GCC collects recyclables. Many area-specific collection points.",
    "Glass": "Recyclable waste. Handle carefully and place in blue bin.",
    "Paper": "Blue bin. Paper recycling well-established through informal sector.",
    "Food Waste": "Green bin. Daily collection by GCC conservancy workers.",
    "E-waste": "Drop at GCC e-waste collection points or certified dealers.",
    "Hazardous": "Separate handling required. Contact GCC control room.",
    "default": "Follow GCC guidelines: Green bin (biodegradable), Blue bin (recyclable), Red bin (hazardous)."
  },
  "Hyderabad": {
    "Plastic": "Dry waste. GHMC Swachh auto collects dry waste on alternate days.",
    "Glass": "Dry waste category. Drop at nearest dry waste collection point.",
    "Food Waste": "Wet waste bin. Daily collection. GHMC encourages composting.",
    "E-waste": "Drop at GHMC designated e-waste centers or Swachh Hyderabad drives.",
    "default": "GHMC segregation: Green (wet), Blue (dry), Black (hazardous). Use Swachh app for complaints."
  },
  "Pune": {
    "Plastic": "Dry waste. PMC collects. SWaCH cooperative handles door-to-door collection.",
    "Glass": "Dry waste. SWaCH workers collect and channel to recyclers.",
    "Food Waste": "Wet waste. Daily collection by SWaCH. Composting widely practiced.",
    "E-waste": "PMC organizes quarterly e-waste drives. Also contact certified recyclers.",
    "default": "PMC + SWaCH system: Wet and Dry segregation mandatory. Fines for non-compliance."
  },
  "Kolkata": {
    "Plastic": "Dry waste. KMC collects. Many local collection points available.",
    "Food Waste": "Wet waste. Daily KMC collection. Composting encouraged in housing societies.",
    "E-waste": "Drop at KMC e-waste collection centers or during designated drives.",
    "default": "KMC guidelines: Segregate into biodegradable and non-biodegradable waste."
  },
};

// State-level fallback rules
const STATE_RULES: Record<string, string> = {
  "Maharashtra": "Follow state SWM rules: Segregate wet, dry, and hazardous waste. Sell recyclables to kabadiwala.",
  "Karnataka": "KSPCB mandates segregation. Bulk generators must compost. E-waste to authorized recyclers.",
  "Tamil Nadu": "TNPCB guidelines: Segregate at source. Municipal collection for wet and dry waste.",
  "Delhi": "Three-bin system mandatory. Green, Blue, Black bins for wet, dry, and hazardous waste.",
  "Telangana": "TSPCB rules apply. Segregation mandatory. Use Swachh app for collection schedules.",
  "West Bengal": "WBPCB guidelines. Segregate biodegradable and non-biodegradable waste.",
  "Gujarat": "GPCB guidelines. Segregation at source mandatory in urban areas.",
  "Rajasthan": "RSPCB rules. Municipal collection varies by city. Segregate waste at home.",
  "Kerala": "Green Protocol state. Strict waste management. Composting widely mandated.",
  "Punjab": "PPCB guidelines. Municipal collection available. Segregation encouraged.",
};

const GENERAL_RULES = "Segregate waste at source into wet (biodegradable), dry (recyclable), and hazardous categories. Sell recyclables to local scrap dealers. Compost food waste if possible. Never burn waste.";

export function getLocationRules(location: UserLocation | null, material?: string): string {
  if (!location) return GENERAL_RULES;
  
  const cityRules = CITY_RULES[location.city];
  if (cityRules) {
    if (material) {
      // Try to match material to a rule category
      const materialLower = material.toLowerCase();
      for (const [key, rule] of Object.entries(cityRules)) {
        if (key !== "default" && materialLower.includes(key.toLowerCase())) {
          return rule;
        }
      }
    }
    return cityRules["default"] || GENERAL_RULES;
  }

  return STATE_RULES[location.state] || GENERAL_RULES;
}

export function getSavedLocation(): UserLocation | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveLocation(location: UserLocation) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export function clearLocation() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function detectLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Use reverse geocoding via free API
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );
          const data = await resp.json();
          const address = data.address || {};
          const location: UserLocation = {
            city: address.city || address.town || address.village || address.county || "Unknown",
            state: address.state || "Unknown",
            country: address.country || "India",
            lat: latitude,
            lng: longitude,
          };
          saveLocation(location);
          resolve(location);
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  });
}
