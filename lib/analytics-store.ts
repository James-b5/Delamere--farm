export type AnalyticsEventType =
  | 'checkout_started'
  | 'checkout_completed'
  | 'whatsapp_click';

interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

const ANALYTICS_STORAGE_KEY = 'delamere-analytics-events';
const ANALYTICS_FILE_PATH = 'data/analytics-events.json';

function getInMemoryStore(): AnalyticsEvent[] {
  const globalScope = globalThis as typeof globalThis & {
    __delamereAnalyticsStore?: AnalyticsEvent[];
  };

  if (!globalScope.__delamereAnalyticsStore) {
    globalScope.__delamereAnalyticsStore = [];
  }

  return globalScope.__delamereAnalyticsStore;
}

function readEvents(): AnalyticsEvent[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (!raw) return getInMemoryStore();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to read analytics events from browser storage:', error);
      return getInMemoryStore();
    }
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const resolvedPath = path.join(process.cwd(), ANALYTICS_FILE_PATH);

    if (!fs.existsSync(resolvedPath)) {
      return getInMemoryStore();
    }

    const raw = fs.readFileSync(resolvedPath, 'utf8');
    const parsed = JSON.parse(raw);
    const events = Array.isArray(parsed) ? parsed : [];
    getInMemoryStore().splice(0, getInMemoryStore().length, ...events);
    return events;
  } catch (error) {
    console.warn('Unable to read analytics events from disk:', error);
    return getInMemoryStore();
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
    } catch (error) {
      console.warn('Unable to write analytics events to browser storage:', error);
    }
    return;
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const resolvedPath = path.join(process.cwd(), ANALYTICS_FILE_PATH);
    const dir = path.dirname(resolvedPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(resolvedPath, JSON.stringify(events, null, 2));
  } catch (error) {
    console.warn('Unable to write analytics events to disk:', error);
  }

  getInMemoryStore().splice(0, getInMemoryStore().length, ...events);
}

export function recordAnalyticsEvent(type: AnalyticsEventType, metadata: Record<string, unknown> = {}) {
  const events = readEvents();
  events.push({
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    timestamp: new Date().toISOString(),
    metadata,
  });
  writeEvents(events);
  return events.length;
}

export function getAnalyticsSummary() {
  const events = readEvents();
  const checkoutStarted = events.filter((event) => event.type === 'checkout_started').length;
  const checkoutCompleted = events.filter((event) => event.type === 'checkout_completed').length;
  const whatsappClicks = events.filter((event) => event.type === 'whatsapp_click').length;
  const conversionRate = checkoutStarted > 0 ? (checkoutCompleted / checkoutStarted) * 100 : 0;

  return {
    checkoutStarted,
    checkoutCompleted,
    whatsappClicks,
    conversionRate,
  };
}
