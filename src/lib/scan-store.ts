import { supabase } from "@/integrations/supabase/client";

export interface ScanRecord {
  id: string;
  item: string;
  category: string;
  material: string;
  confidence: number;
  contamination: string;
  disposal: string;
  timestamp: number;
  city?: string;
  state?: string;
  country?: string;
}

const STORAGE_KEY = "ecovoice_scans";
const STREAK_KEY = "ecovoice_streak";

const normalizeScan = (scan: Partial<ScanRecord>): ScanRecord => ({
  id: scan.id || crypto.randomUUID(),
  item: scan.item || scan.material || "Unknown",
  category: scan.category || "Landfill",
  material: scan.material || "Unknown",
  confidence: Number(scan.confidence || 0),
  contamination: scan.contamination || "Medium",
  disposal: scan.disposal || "Check local guidelines.",
  timestamp: scan.timestamp || Date.now(),
  city: scan.city,
  state: scan.state,
  country: scan.country,
});

const saveScansLocally = (scans: ScanRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
};

export const getScans = (): ScanRecord[] => {
  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as ScanRecord[])
      .map(normalizeScan)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
};

const mergeById = (local: ScanRecord[], remote: ScanRecord[]) => {
  const byId = new Map<string, ScanRecord>();
  [...remote, ...local].forEach((scan) => byId.set(scan.id, normalizeScan(scan)));
  return Array.from(byId.values()).sort((a, b) => b.timestamp - a.timestamp);
};

export const syncScansFromDatabase = async () => {
  const local = getScans();

  const { data, error } = await supabase
    .from("recycling_history")
    .select("id,item,category,material,confidence,contamination,disposal,timestamp,city,state,country")
    .order("timestamp", { ascending: false })
    .limit(250);

  if (error) {
    // If table isn't provisioned or network fails, continue with local data.
    return local;
  }

  const remote = (data || []).map((row: any) => ({
    ...row,
    timestamp: new Date(row.timestamp).getTime(),
  }));

  const merged = mergeById(local, remote);
  saveScansLocally(merged);
  return merged;
};

export const addScan = async (scan: Omit<ScanRecord, "id" | "timestamp">): Promise<ScanRecord> => {
  const record = normalizeScan({
    ...scan,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });

  const existing = getScans();
  saveScansLocally([record, ...existing]);
  updateStreak(record.timestamp);
  window.dispatchEvent(new Event("ecovoice_scan_update"));

  const { error } = await supabase.from("recycling_history").insert({
    id: record.id,
    item: record.item,
    category: record.category,
    material: record.material,
    confidence: record.confidence,
    contamination: record.contamination,
    disposal: record.disposal,
    timestamp: new Date(record.timestamp).toISOString(),
    city: record.city,
    state: record.state,
    country: record.country,
  });

  if (!error) {
    window.dispatchEvent(new Event("ecovoice_scan_update"));
  }

  return record;
};

interface StreakData {
  current: number;
  best: number;
  lastScanDate: string;
}

function getDateKey(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

function getStreakData(): StreakData {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"current":0,"best":0,"lastScanDate":""}');
  } catch {
    return { current: 0, best: 0, lastScanDate: "" };
  }
}

function updateStreak(scanTimestamp: number) {
  const data = getStreakData();
  const today = getDateKey(scanTimestamp);
  const yesterday = new Date(scanTimestamp - 86400000).toISOString().split("T")[0];

  if (data.lastScanDate === today) return;
  if (data.lastScanDate === yesterday) data.current += 1;
  else data.current = 1;

  data.lastScanDate = today;
  data.best = Math.max(data.best, data.current);
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export const getStreak = (): StreakData => getStreakData();

export const getStats = () => {
  const scans = getScans();
  const total = scans.length;
  const streak = getStreakData();

  const categoryMap = new Map<string, number>();
  scans.forEach((s) => categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1));

  const co2Saved = Math.round(total * 0.33 * 10) / 10;
  const waterSaved = Math.round(total * 8.5);
  const energySaved = Math.round(total * 0.61 * 10) / 10;

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

  const today = getDateKey(Date.now());
  const todayScans = scans.filter((s) => getDateKey(s.timestamp) === today).length;
  const weekScans = scans.filter((s) => s.timestamp > Date.now() - 7 * 86400000).length;

  const badges = [
    { name: "Eco Starter", desc: "Scan 5 items", earned: total >= 5, icon: "🌱", threshold: 5, progress: total },
    { name: "Green Hero", desc: "Scan 20 items", earned: total >= 20, icon: "🌿", threshold: 20, progress: total },
    { name: "Planet Champion", desc: "Scan 50 items", earned: total >= 50, icon: "🌍", threshold: 50, progress: total },
    { name: "Eco Legend", desc: "Scan 100 items", earned: total >= 100, icon: "🏆", threshold: 100, progress: total },
    { name: "Streak Master", desc: "7-day streak", earned: streak.best >= 7, icon: "🔥", threshold: 7, progress: streak.current },
    { name: "Streak Legend", desc: "30-day streak", earned: streak.best >= 30, icon: "⚡", threshold: 30, progress: streak.current },
  ];

  return {
    total,
    co2Saved,
    waterSaved,
    energySaved,
    monthlyData,
    badges,
    streak,
    todayScans,
    weekScans,
    categoryBreakdown: Object.fromEntries(categoryMap),
  };
};
