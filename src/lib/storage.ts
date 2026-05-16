import { AppData, BodyMetric, DailyCheckin, MealLog, WorkoutSession } from '../types';
import { dateKey, uid } from './format';

const KEY = 'recomp-os-web-v1';

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

export function loadData(): AppData {
  const raw = localStorage.getItem(KEY);
  if (!raw) return initialData();
  try {
    const parsed = JSON.parse(raw) as AppData;
    return { ...initialData(), ...parsed };
  } catch {
    return initialData();
  }
}

export function saveData(data: AppData) {
  const payload = { ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(payload));
}

export function exportData(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recomp-os-backup-${dateKey()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDataFile(file: File): Promise<AppData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as AppData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
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
