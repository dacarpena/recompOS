import { AppData, BodyMetric, DailyCheckin, MealLog, WorkoutSession } from '../types';
import { dateKey, uid } from './format';
import { apiData, ApiSession } from './api';

const LEGACY_KEY = 'recomp-os-web-v1';
const QUEUE_KEY = 'recomp-os-sync-queue-v1';

export type SyncState = 'synced' | 'pending' | 'error';

export interface SyncQueueItem {
  userId: string;
  data: AppData;
  updatedAt: string;
}

export function keyForUser(userId: string): string {
  return `${LEGACY_KEY}:${userId}`;
}

export function getLegacyKey(): string {
  return LEGACY_KEY;
}

function initialData(): AppData {
  const today = dateKey();
  return {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sessions: [],
    meals: [],
    metrics: [],
    checkins: [
      {
        id: uid('checkin'),
        date: today,
        sleepHours: 8,
        energy: 8,
        hrvMs: 86,
        restingHr: 48,
        bodyBattery: 90,
        steps: 17000,
        shoulderStatus: 'yellow',
        shoulderPain: 1,
        elbowPain: 1,
        lumbarPain: 0,
        neckPain: 1,
        rightWeakness: false,
        notes: 'Datos iniciales del contexto de Dani.'
      }
    ]
  };
}

export function loadData(userId: string): AppData {
  const raw = localStorage.getItem(keyForUser(userId));
  if (!raw) return initialData();
  try {
    const parsed = JSON.parse(raw) as AppData;
    return { ...initialData(), ...parsed };
  } catch {
    return initialData();
  }
}

export function saveData(userId: string, data: AppData) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(keyForUser(userId), JSON.stringify(payload));
}

function loadQueue(): SyncQueueItem[] {
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as SyncQueueItem[]; } catch { return []; }
}

function saveQueue(queue: SyncQueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineChange(userId: string, data: AppData) {
  const queue = loadQueue().filter((i) => i.userId !== userId);
  queue.push({ userId, data, updatedAt: data.updatedAt });
  saveQueue(queue);
}

export function hasPendingSync(userId: string): boolean {
  return loadQueue().some((i) => i.userId === userId);
}

export async function syncUserData(userId: string): Promise<{ data: AppData; state: SyncState }> {
  const local = loadData(userId);
  const session: ApiSession = { userId, token: `local-${userId}` };
  const remote = await apiData(session);

  let resolved = local;
  if (!remote) {
    await apiData(session, local);
  } else {
    // resolución de conflictos básica por timestamp (updatedAt más reciente gana)
    resolved = new Date(local.updatedAt).getTime() >= new Date(remote.updatedAt).getTime() ? local : remote;
    await apiData(session, resolved);
  }

  saveData(userId, resolved);

  try {
    const queue = loadQueue();
    const pending = queue.find((q) => q.userId === userId);
    if (pending) {
      const remoteNow = await apiData(session);
      const merged = remoteNow && new Date(remoteNow.updatedAt).getTime() > new Date(pending.updatedAt).getTime()
        ? remoteNow
        : pending.data;
      await apiData(session, merged);
      saveData(userId, merged);
      saveQueue(queue.filter((q) => q.userId !== userId));
      return { data: merged, state: 'synced' };
    }
    return { data: resolved, state: 'synced' };
  } catch {
    enqueueOfflineChange(userId, local);
    return { data: local, state: 'error' };
  }
}

export function exportData(userId: string, data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recomp-os-backup-${userId}-${dateKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDataFile(userId: string, file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData;
        saveData(userId, parsed);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function readLegacyData(): AppData | null {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

export function upsertCheckin(data: AppData, checkin: DailyCheckin): AppData {
  const next = data.checkins.filter((c) => c.date !== checkin.date);
  return { ...data, checkins: [...next, checkin].sort((a, b) => a.date.localeCompare(b.date)) };
}

export function addSession(data: AppData, session: WorkoutSession): AppData {
  return { ...data, sessions: [session, ...data.sessions] };
}

export function addMeal(data: AppData, meal: MealLog): AppData {
  return { ...data, meals: [meal, ...data.meals] };
}

export function addMetric(data: AppData, metric: BodyMetric): AppData {
  return { ...data, metrics: [metric, ...data.metrics] };
}
