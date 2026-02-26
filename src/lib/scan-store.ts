// Local storage-based scan history for real-time tracking

export interface ScanRecord {
  id: string;
  item: string;
  category: string;
  material: string;
  confidence: number;
  contamination: string;
  disposal: string;
  timestamp: number;
}

const STORAGE_KEY = "ecovoice_scans";

export const getScans = (): ScanRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const addScan = (scan: Omit<ScanRecord, "id" | "timestamp">): ScanRecord => {
  const record: ScanRecord = {
    ...scan,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };
  const scans = getScans();
  scans.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  window.dispatchEvent(new Event("ecovoice_scan_update"));
  return record;
};

export const getStats = () => {
  const scans = getScans();
  const total = scans.length;
  const correctlySorted = Math.round(total * 0.9); // estimate
  const co2Saved = Math.round(total * 0.33);
  const waterSaved = Math.round(total * 8.5);
  const energySaved = Math.round(total * 0.61);

  // Monthly breakdown
  const monthlyMap = new Map<string, number>();
  scans.forEach((s) => {
    const d = new Date(s.timestamp);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  });
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, items]) => ({ month, items }))
    .reverse()
    .slice(-6);

  // Badges
  const badges = [
    { name: "Eco Starter", desc: "Scan 5 items", earned: total >= 5, icon: "🌱", threshold: 5 },
    { name: "Green Hero", desc: "Scan 20 items", earned: total >= 20, icon: "🌿", threshold: 20 },
    { name: "Planet Champion", desc: "Scan 50 items", earned: total >= 50, icon: "🌍", threshold: 50 },
    { name: "Eco Legend", desc: "Scan 100 items", earned: total >= 100, icon: "🏆", threshold: 100 },
  ];

  return { total, correctlySorted, co2Saved, waterSaved, energySaved, monthlyData, badges };
};
