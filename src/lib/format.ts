import { SessionType, Tier, Traffic } from '../types';

export const tierOrder: Tier[] = [
  'Hierro', 'Bronce III', 'Bronce II', 'Bronce I', 'Plata III', 'Plata II', 'Plata I', 'Oro III', 'Oro II', 'Oro I', 'Platino III', 'Platino II', 'Platino I', 'Diamante III', 'Diamante II', 'Diamante I', 'Ónix'
];

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function hoursSince(iso?: string) {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 36e5);
}

export function daysSince(iso?: string) {
  return hoursSince(iso) / 24;
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function fmtHours(h: number) {
  if (!Number.isFinite(h)) return 'nunca';
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} d`;
}

export function fmtSession(type: SessionType) {
  switch (type) {
    case 'A_PUSH': return 'A · Push Estético';
    case 'B_PULL': return 'B · Pull Estético';
    case 'C_GLUTE_LOWER': return 'C · Glúteo/Femoral';
    case 'D_MICRO': return 'D · Micro Estético';
    case 'E_RECOVERY': return 'E · Recuperación';
    case 'REST': return 'Descanso';
  }
}

export function trafficLabel(t: Traffic) {
  return ({ green: 'Verde', yellow: 'Amarillo', red: 'Rojo', blue: 'Recuperación', purple: 'Prioridad' } as Record<Traffic, string>)[t];
}

export function movingAverage(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function linearTrend(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return 0;
  const n = points.length;
  const sx = points.reduce((sum, p) => sum + p.x, 0);
  const sy = points.reduce((sum, p) => sum + p.y, 0);
  const sxy = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sx2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
  const denom = n * sx2 - sx * sx;
  if (denom === 0) return 0;
  return (n * sxy - sx * sy) / denom;
}
