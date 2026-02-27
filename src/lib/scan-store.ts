// Local storage-based scan history with streaks and real-time tracking

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
}

const STORAGE_KEY = "ecovoice_scans";
const STREAK_KEY = "ecovoice_streak";

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
  updateStreak();
  window.dispatchEvent(new Event("ecovoice_scan_update"));
  return record;
};

// Streak tracking
interface StreakData {
  current: number;
  best: number;
  lastScanDate: string; // YYYY-MM-DD
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getStreakData(): StreakData {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"current":0,"best":0,"lastScanDate":""}');
  } catch {
    return { current: 0, best: 0, lastScanDate: "" };
  }
}

function updateStreak() {
  const data = getStreakData();
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  if (data.lastScanDate === today) {
    // Already scanned today, no change
    return;
  } else if (data.lastScanDate === yesterday) {
    // Consecutive day
    data.current += 1;
  } else {
    // Streak broken or first scan
    data.current = 1;
  }

  data.lastScanDate = today;
  if (data.current > data.best) data.best = data.current;
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

export const getStreak = (): StreakData => getStreakData();

export const getStats = () => {
  const scans = getScans();
  const total = scans.length;
  const streak = getStreakData();

  // Category breakdown
  const categoryMap = new Map<string, number>();
  scans.forEach((s) => {
    categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1);
  });

  // Impact calculations (per item estimates)
  const co2Saved = Math.round(total * 0.33 * 10) / 10;
  const waterSaved = Math.round(total * 8.5);
  const energySaved = Math.round(total * 0.61 * 10) / 10;

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

  // Today's scans
  const today = getToday();
  const todayScans = scans.filter((s) => new Date(s.timestamp).toISOString().split("T")[0] === today).length;

  // This week
  const weekAgo = Date.now() - 7 * 86400000;
  const weekScans = scans.filter((s) => s.timestamp > weekAgo).length;

  // Badges — earned dynamically based on actual scan count
  const badges = [
    { name: "Eco Starter", desc: "Scan 5 items", earned: total >= 5, icon: "🌱", threshold: 5 },
    { name: "Green Hero", desc: "Scan 20 items", earned: total >= 20, icon: "🌿", threshold: 20 },
    { name: "Planet Champion", desc: "Scan 50 items", earned: total >= 50, icon: "🌍", threshold: 50 },
    { name: "Eco Legend", desc: "Scan 100 items", earned: total >= 100, icon: "🏆", threshold: 100 },
    { name: "Streak Master", desc: "7-day streak", earned: streak.best >= 7, icon: "🔥", threshold: 7, current: streak.current },
    { name: "Streak Legend", desc: "30-day streak", earned: streak.best >= 30, icon: "⚡", threshold: 30, current: streak.current },
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
