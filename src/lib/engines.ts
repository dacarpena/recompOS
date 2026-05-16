import {
  AppData,
  CampaignMission,
  DailyCheckin,
  Exercise,
  MuscleClock,
  MuscleGroup,
  MuscleRank,
  ExerciseOverloadState,
  MuscleOverloadState,
  OverloadAction,
  OverloadDashboard,
  Projection,
  Recommendation,
  RollingMuscleVolume,
  SessionType,
  SetLog,
  Traffic
} from '../types';
import { EXERCISES, MUSCLES, TEMPLATES } from '../data/seed';
import { clamp, fmtSession, hoursSince, linearTrend, tierOrder } from './format';

const exerciseMap = new Map(EXERCISES.map((e) => [e.id, e]));
const muscleMap = new Map(MUSCLES.map((m) => [m.id, m]));

export function latestCheckin(data: AppData): DailyCheckin | undefined {
  return [...data.checkins].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function readinessScore(checkin?: DailyCheckin) {
  if (!checkin) return 60;
  const sleep = clamp((checkin.sleepHours / 8) * 30, 0, 30);
  const energy = clamp((checkin.energy / 10) * 20, 0, 20);
  const shoulder = checkin.rightWeakness ? 0 : checkin.shoulderStatus === 'green' ? 20 : checkin.shoulderStatus === 'yellow' ? 12 : 0;
  const hrv = checkin.hrvMs ? clamp((checkin.hrvMs / 86) * 10, 0, 10) : 7;
  const hr = checkin.restingHr ? clamp(10 - Math.max(0, checkin.restingHr - 50), 0, 10) : 7;
  const pain = clamp(10 - Math.max(checkin.elbowPain, checkin.lumbarPain, checkin.neckPain), 0, 10);
  return Math.round(clamp(sleep + energy + shoulder + hrv + hr + pain, 0, 100));
}

function setQuality(set: SetLog, exercise?: Exercise) {
  const technique = set.technique / 5;
  const rom = set.rom / 5;
  const rirFactor = set.rir <= 2 ? 1 : set.rir === 3 ? 0.85 : 0.65;
  const maxPain = Math.max(set.shoulderPain, set.elbowPain, set.lumbarPain);
  const painFactor = maxPain >= 5 || set.rightWeakness ? 0 : maxPain >= 4 ? 0.5 : maxPain >= 3 ? 0.7 : maxPain >= 2 ? 0.9 : 1;
  const blockFactor = exercise?.blocked ? 0 : 1;
  return technique * rom * rirFactor * painFactor * blockFactor;
}

export function usefulLoadForSet(set: SetLog, muscleId: MuscleGroup) {
  const exercise = exerciseMap.get(set.exerciseId);
  if (!exercise) return { load: 0, xp: 0, usefulSet: 0 };
  const contribution = exercise.contributions[muscleId] ?? 0;
  const quality = setQuality(set, exercise);
  const tonnage = set.weight * set.reps * contribution * quality;
  const priority = muscleMap.get(muscleId)?.aestheticPriority ?? 5;
  const xp = (8 + Math.sqrt(Math.max(0, tonnage)) * 0.15) * contribution * quality * (0.8 + priority / 20);
  const usefulSet = contribution >= 0.35 && quality >= 0.55 ? contribution * quality : 0;
  return { load: tonnage, xp, usefulSet };
}

export function rollingVolume(data: AppData, days = 10): RollingMuscleVolume[] {
  const since = Date.now() - days * 24 * 36e5;
  const vols = new Map<MuscleGroup, RollingMuscleVolume>();
  MUSCLES.forEach((m) => vols.set(m.id, { muscleId: m.id, hardSets: 0, usefulLoad: 0, xp: 0, painPenalty: 0 }));

  data.sessions.forEach((session) => {
    session.sets.forEach((set) => {
      if (new Date(set.createdAt).getTime() < since) return;
      const exercise = exerciseMap.get(set.exerciseId);
      if (!exercise) return;
      Object.keys(exercise.contributions).forEach((muscleId) => {
        const key = muscleId as MuscleGroup;
        const v = vols.get(key)!;
        const { load, xp, usefulSet } = usefulLoadForSet(set, key);
        v.usefulLoad += load;
        v.xp += xp;
        v.hardSets += usefulSet;
        v.painPenalty += Math.max(set.shoulderPain, set.elbowPain, set.lumbarPain) + (set.rightWeakness ? 5 : 0);
      });
    });
  });

  return Array.from(vols.values()).map((v) => ({ ...v, hardSets: Math.round(v.hardSets * 10) / 10, xp: Math.round(v.xp), usefulLoad: Math.round(v.usefulLoad) }));
}

function lastStimulus(data: AppData, muscleId: MuscleGroup, hard: boolean) {
  let last: string | undefined;
  data.sessions.forEach((session) => {
    session.sets.forEach((set) => {
      const exercise = exerciseMap.get(set.exerciseId);
      if (!exercise) return;
      const contribution = exercise.contributions[muscleId] ?? 0;
      const quality = setQuality(set, exercise);
      const threshold = hard ? contribution >= 0.35 && quality >= 0.55 && set.rir <= 3 : contribution >= 0.15 && quality > 0.35;
      if (threshold && (!last || new Date(set.createdAt) > new Date(last))) last = set.createdAt;
    });
  });
  return last;
}

export function muscleClocks(data: AppData): MuscleClock[] {
  const checkin = latestCheckin(data);
  return MUSCLES.map((m) => {
    const lastHard = lastStimulus(data, m.id, true);
    const lastLight = lastStimulus(data, m.id, false);
    const hoursHard = hoursSince(lastHard);
    const hoursLight = hoursSince(lastLight);
    let status: Traffic = 'green';
    let readyIn = 0;

    if (checkin?.rightWeakness && ['chest','shoulder_lateral','shoulder_rear','lats','upper_back','triceps'].includes(m.id)) {
      status = 'red';
      readyIn = 24;
    } else if (hoursHard < m.lightRecoveryHours) {
      status = 'red';
      readyIn = m.lightRecoveryHours - hoursHard;
    } else if (hoursHard < m.hardRecoveryHours) {
      status = 'yellow';
      readyIn = m.hardRecoveryHours - hoursHard;
    } else {
      status = 'green';
    }

    return {
      muscleId: m.id,
      lastHard,
      lastLight,
      hoursSinceHard: hoursHard,
      hoursSinceLight: hoursLight,
      status,
      readyInHours: Math.max(0, readyIn)
    };
  });
}

function templateFocusScore(type: SessionType, data: AppData) {
  const template = TEMPLATES.find((t) => t.id === type);
  if (!template) return 0;
  const vols = rollingVolume(data, 10);
  const clocks = muscleClocks(data);
  let score = 0;
  template.focus.forEach((m) => {
    const muscle = muscleMap.get(m)!;
    const vol = vols.find((v) => v.muscleId === m)!;
    const clock = clocks.find((c) => c.muscleId === m)!;
    const [min, max] = muscle.targetSets10d;
    const deficit = clamp((min - vol.hardSets) / Math.max(1, min), -0.5, 1.2);
    const priority = muscle.aestheticPriority;
    const readiness = clock.status === 'green' ? 1 : clock.status === 'yellow' ? 0.4 : -1.2;
    const overCapPenalty = vol.hardSets > max ? -0.6 : 0;
    score += priority * (1 + deficit) * readiness + overCapPenalty * priority;
  });
  return score;
}

export function recommendSession(data: AppData): Recommendation {
  const checkin = latestCheckin(data);
  const readiness = readinessScore(checkin);
  const warnings: string[] = [];
  const blockedExercises: string[] = [];

  if (checkin?.rightWeakness) {
    warnings.push('Pérdida de fuerza derecha marcada: bloquea presses, overhead y dominadas.');
    blockedExercises.push('Presses intensos', 'Overhead', 'Dominadas libres');
  }
  if (checkin && checkin.sleepHours < 6) warnings.push('Sueño bajo: hoy la prioridad es no comprar fatiga inútil.');
  if (checkin && checkin.shoulderStatus === 'red') warnings.push('Hombro rojo: sesión de recuperación o pierna/glúteo adaptado.');

  const sessionTypes: SessionType[] = ['A_PUSH', 'B_PULL', 'C_GLUTE_LOWER', 'D_MICRO', 'E_RECOVERY'];
  const scores = sessionTypes.map((type) => {
    let score = templateFocusScore(type, data);
    if (type === 'E_RECOVERY') score = 12;
    if (type === 'D_MICRO') score += readiness > 70 ? 8 : 0;
    if (readiness < 55 && type !== 'E_RECOVERY') score -= 20;
    if (checkin?.rightWeakness && ['A_PUSH', 'B_PULL', 'D_MICRO'].includes(type)) score -= 30;
    if (checkin?.shoulderStatus === 'red' && ['A_PUSH', 'B_PULL', 'D_MICRO'].includes(type)) score -= 25;
    if ((checkin?.lumbarPain ?? 0) >= 4 && type === 'C_GLUTE_LOWER') score -= 20;
    if ((checkin?.elbowPain ?? 0) >= 4 && ['A_PUSH', 'B_PULL', 'D_MICRO'].includes(type)) score -= 10;
    return { type, score };
  }).sort((a, b) => b.score - a.score);

  const chosen = scores[0];
  const type = chosen?.type ?? 'E_RECOVERY';
  const template = TEMPLATES.find((t) => t.id === type);
  const mode = readiness < 55 || type === 'E_RECOVERY' ? 'recovery' : readiness < 75 ? 'reduced' : 'full';

  const reasons = buildReasons(type, data, readiness);

  return {
    type,
    score: Math.round(chosen?.score ?? 0),
    title: template?.title ?? fmtSession(type),
    reasons,
    warnings,
    blockedExercises,
    mode
  };
}

function buildReasons(type: SessionType, data: AppData, readiness: number) {
  const template = TEMPLATES.find((t) => t.id === type);
  const clocks = muscleClocks(data);
  const vols = rollingVolume(data, 10);
  const reasons: string[] = [];
  if (!template) return reasons;
  reasons.push(`Readiness ${readiness}/100.`);
  template.focus.slice(0, 4).forEach((m) => {
    const muscle = muscleMap.get(m)!;
    const clock = clocks.find((c) => c.muscleId === m)!;
    const vol = vols.find((v) => v.muscleId === m)!;
    const [min, max] = muscle.targetSets10d;
    if (clock.status === 'green') reasons.push(`${muscle.name} está verde.`);
    if (vol.hardSets < min) reasons.push(`${muscle.name}: ${vol.hardSets}/${min}-${max} series útiles en 10 días.`);
  });
  return reasons.slice(0, 5);
}

export function muscleRanks(data: AppData): MuscleRank[] {
  const vol10 = rollingVolume(data, 10);
  const vol28 = rollingVolume(data, 28);
  const vol60 = rollingVolume(data, 60);
  return MUSCLES.map((m) => {
    const v10 = vol10.find((v) => v.muscleId === m.id)!;
    const v28 = vol28.find((v) => v.muscleId === m.id)!;
    const v60 = vol60.find((v) => v.muscleId === m.id)!;
    const [min, max] = m.targetSets10d;
    const volumeScore = clamp((v28.hardSets / Math.max(1, min * 2.8)) * 260, 0, 260);
    const loadScore = clamp(Math.log10(1 + v28.usefulLoad) * 90, 0, 280);
    const progressionScore = clamp((v28.xp - (v60.xp - v28.xp)) / 30 + 120, 0, 220);
    const techniquePainScore = clamp(140 - v28.painPenalty * 1.5, 0, 140);
    const consistencyScore = clamp((v10.hardSets / Math.max(1, min)) * 100, 0, 100);
    const priorityBoost = m.aestheticPriority >= 8 ? 20 : 0;
    const score = clamp(volumeScore + loadScore + progressionScore + techniquePainScore + consistencyScore + priorityBoost, 0, 1000);
    const tierIndex = Math.min(tierOrder.length - 1, Math.floor(score / (1000 / tierOrder.length)));
    const currentTierStart = tierIndex * (1000 / tierOrder.length);
    const progress = clamp((score - currentTierStart) / (1000 / tierOrder.length), 0, 0.99);
    const trend: MuscleRank['trend'] = v28.xp > (v60.xp - v28.xp) * 1.12 ? 'up' : v28.xp < (v60.xp - v28.xp) * 0.88 ? 'down' : 'flat';
    const weeklyXp = Math.max(1, v28.xp / 4);
    const nextThreshold = (tierIndex + 1) * (1000 / tierOrder.length);
    const projectionWeeks = tierIndex >= tierOrder.length - 1 ? null : Math.ceil(Math.max(0, nextThreshold - score) / Math.max(1, weeklyXp / 10));
    let bottleneck: string | undefined;
    if (v10.hardSets < min * 0.6) bottleneck = 'volumen bajo';
    if (v28.painPenalty > 15) bottleneck = 'dolor/técnica';
    if (m.avoidOverdevelopment && v10.hardSets > max) bottleneck = 'sobredesarrollo no prioritario';
    return { muscleId: m.id, score: Math.round(score), tier: tierOrder[tierIndex], progress, trend, projectionWeeks, bottleneck };
  }).sort((a, b) => (muscleMap.get(b.muscleId)?.aestheticPriority ?? 0) - (muscleMap.get(a.muscleId)?.aestheticPriority ?? 0));
}

export function exerciseHistory(data: AppData, exerciseId: string) {
  const rows: Array<{ date: string; volume: number; bestWeight: number; bestReps: number; sets: number }> = [];
  data.sessions.forEach((session) => {
    const sets = session.sets.filter((s) => s.exerciseId === exerciseId);
    if (!sets.length) return;
    rows.push({
      date: session.startedAt,
      volume: sets.reduce((sum, s) => sum + s.weight * s.reps * setQuality(s, exerciseMap.get(s.exerciseId)), 0),
      bestWeight: Math.max(...sets.map((s) => s.weight)),
      bestReps: Math.max(...sets.map((s) => s.reps)),
      sets: sets.length
    });
  });
  return rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}


function targetIncrement(weight: number, exercise: Exercise) {
  if (exercise.pattern.includes('calf') || exercise.pattern.includes('press') || weight >= 120) return 5;
  if (weight >= 60) return 2.5;
  if (weight >= 20) return 2;
  if (weight >= 8) return 1;
  return 0.5;
}

function actionLabel(action: OverloadAction) {
  const labels: Record<OverloadAction, string> = {
    increase_load: 'Subir carga',
    increase_reps: 'Sumar reps',
    hold: 'Consolidar',
    rebuild_quality: 'Reconstruir técnica',
    reduce_load: 'Bajar carga',
    add_set: 'Añadir serie',
    deload: 'Descargar',
    skip: 'Saltar hoy'
  };
  return labels[action];
}

function exerciseExposureSummaries(data: AppData, exerciseId: string) {
  return data.sessions
    .filter((session) => session.sets.some((set) => set.exerciseId === exerciseId))
    .map((session) => {
      const sets = session.sets.filter((set) => set.exerciseId === exerciseId);
      const exercise = exerciseMap.get(exerciseId);
      const avg = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const maxPain = Math.max(...sets.map((s) => Math.max(s.shoulderPain, s.elbowPain, s.lumbarPain)), 0);
      const cleanSets = sets.filter((s) => setQuality(s, exercise) >= 0.72 && !s.rightWeakness && Math.max(s.shoulderPain, s.elbowPain, s.lumbarPain) <= 2);
      const bestSet = [...sets].sort((a, b) => (b.weight * b.reps) - (a.weight * a.reps))[0];
      return {
        session,
        sets,
        date: session.startedAt,
        avgWeight: avg(sets.map((s) => s.weight)),
        avgReps: avg(sets.map((s) => s.reps)),
        avgRir: avg(sets.map((s) => s.rir)),
        avgTechnique: avg(sets.map((s) => s.technique)),
        avgRom: avg(sets.map((s) => s.rom)),
        maxPain,
        rightWeakness: sets.some((s) => s.rightWeakness),
        cleanRate: cleanSets.length / Math.max(1, sets.length),
        allTopReps: exercise ? sets.every((s) => s.reps >= exercise.repRange[1]) : false,
        allInRirBand: exercise ? sets.every((s) => s.rir >= exercise.rirTarget[0] && s.rir <= exercise.rirTarget[1] + 1) : false,
        bestSet
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function primaryMuscleReadiness(data: AppData, exercise: Exercise) {
  const clocks = muscleClocks(data);
  const primary = exercise.primary[0];
  return clocks.find((c) => c.muscleId === primary)?.status ?? 'green';
}

function muscleVolumeGapForExercise(data: AppData, exercise: Exercise) {
  const vols = rollingVolume(data, 10);
  return exercise.primary.reduce((sum, muscleId) => {
    const muscle = muscleMap.get(muscleId);
    const vol = vols.find((v) => v.muscleId === muscleId);
    if (!muscle || !vol) return sum;
    const [min] = muscle.targetSets10d;
    return sum + Math.max(0, min - vol.hardSets) * muscle.aestheticPriority;
  }, 0);
}

export function exerciseOverloadState(data: AppData, exercise: Exercise): ExerciseOverloadState {
  const exposures = exerciseExposureSummaries(data, exercise.id);
  const last = exposures[exposures.length - 1];
  const previous = exposures[exposures.length - 2];
  const readiness = primaryMuscleReadiness(data, exercise);
  const checkin = latestCheckin(data);
  const volumeGap = muscleVolumeGapForExercise(data, exercise);
  const reasons: string[] = [];
  const warnings: string[] = [];
  let action: OverloadAction = 'hold';
  let recommendedWeight = last?.avgWeight ?? 0;
  let recommendedReps = exercise.repRange[0];
  let recommendedSets = exercise.defaultSets;
  let targetRir: [number, number] = [...exercise.rirTarget] as [number, number];

  if (!last) {
    reasons.push('Sin historial: primero crea una línea base técnica.');
    if (exercise.blocked) warnings.push(exercise.blockReason ?? 'Ejercicio bloqueado.');
    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      action: exercise.blocked ? 'skip' : 'hold',
      actionLabel: exercise.blocked ? actionLabel('skip') : 'Crear baseline',
      recommendedWeight: 0,
      recommendedReps: exercise.repRange[0],
      recommendedSets: exercise.defaultSets,
      targetRir,
      confidence: 'baja',
      readiness: exercise.blocked ? 'red' : readiness,
      score: exercise.blocked ? -100 : 40 + volumeGap,
      reasons,
      warnings,
      projectedNextMilestone: '3 exposiciones limpias para empezar a proyectar.'
    };
  }

  recommendedWeight = Math.round(last.avgWeight * 2) / 2;
  recommendedReps = clamp(Math.round(last.avgReps) + 1, exercise.repRange[0], exercise.repRange[1]);
  recommendedSets = exercise.defaultSets;

  const lastPain = last.maxPain;
  const hadWeakness = last.rightWeakness || Boolean(checkin?.rightWeakness);
  const techniquePoor = last.avgTechnique < 3.8 || last.avgRom < 3.8;
  const tooCloseToFailure = last.avgRir < exercise.rirTarget[0] - 0.25;
  const clean = last.cleanRate >= 0.75 && lastPain <= 2 && !last.rightWeakness && !techniquePoor;
  const hasProgress = previous ? last.avgWeight * last.avgReps > previous.avgWeight * previous.avgReps * 1.02 : false;

  if (exercise.blocked) {
    action = 'skip';
    warnings.push(exercise.blockReason ?? 'Ejercicio bloqueado por seguridad.');
    recommendedWeight = 0;
    recommendedSets = 0;
  } else if (hadWeakness || lastPain >= 5 || readiness === 'red') {
    action = hadWeakness || lastPain >= 5 ? 'deload' : 'skip';
    targetRir = [3, 4];
    recommendedWeight = Math.max(0, Math.round(last.avgWeight * 0.8 * 2) / 2);
    recommendedReps = exercise.repRange[0];
    recommendedSets = Math.max(1, exercise.defaultSets - 1);
    warnings.push(hadWeakness ? 'Pérdida de fuerza derecha: no progresar carga.' : 'Dolor/recuperación roja: no buscar récord.');
  } else if (lastPain >= 3) {
    action = 'reduce_load';
    targetRir = [3, 4];
    recommendedWeight = Math.max(0, Math.round(last.avgWeight * 0.9 * 2) / 2);
    recommendedReps = exercise.repRange[0];
    warnings.push('Dolor 3-4/10: reduce carga y valida técnica.');
  } else if (techniquePoor) {
    action = 'rebuild_quality';
    targetRir = [2, 3];
    recommendedWeight = Math.max(0, Math.round(last.avgWeight * 0.9 * 2) / 2);
    recommendedReps = Math.max(exercise.repRange[0], Math.round((exercise.repRange[0] + exercise.repRange[1]) / 2));
    reasons.push('La técnica o el ROM no fueron suficientemente limpios.');
  } else if (tooCloseToFailure && exercise.risk.shoulder && exercise.risk.shoulder >= 3) {
    action = 'hold';
    targetRir = [2, 3];
    recommendedReps = Math.max(exercise.repRange[0], Math.round(last.avgReps));
    reasons.push('Demasiado cerca del fallo en un ejercicio sensible: consolida antes de subir.');
  } else if (clean && last.allTopReps && last.allInRirBand) {
    action = 'increase_load';
    recommendedWeight = Math.round((last.avgWeight + targetIncrement(last.avgWeight, exercise)) * 2) / 2;
    recommendedReps = exercise.repRange[0];
    reasons.push('Doble progresión completada: reps altas, RIR correcto y sin dolor.');
  } else if (clean && volumeGap > 18 && exercise.defaultSets < 5 && readiness === 'green') {
    action = 'add_set';
    recommendedSets = exercise.defaultSets + 1;
    recommendedReps = Math.min(exercise.repRange[1], Math.round(last.avgReps) + 1);
    reasons.push('El músculo principal va bajo de volumen útil en 10 días.');
  } else if (clean) {
    action = 'increase_reps';
    recommendedReps = Math.min(exercise.repRange[1], Math.round(last.avgReps) + 1);
    reasons.push(hasProgress ? 'Ya hay progreso: suma otra repetición limpia.' : 'Mantén carga y persigue más reps con la misma técnica.');
  } else {
    action = 'hold';
    reasons.push('Consolida la carga hasta repetir rendimiento limpio.');
  }

  if (readiness === 'yellow' && !['reduce_load', 'deload', 'skip', 'rebuild_quality'].includes(action)) {
    action = 'hold';
    recommendedReps = Math.max(exercise.repRange[0], Math.round(last.avgReps));
    reasons.push('Músculo en amarillo: estímulo útil, no PR.');
  }

  const exposureCount = exposures.length;
  const confidence = exposureCount >= 5 ? 'alta' : exposureCount >= 2 ? 'media' : 'baja';
  const priority = exercise.primary.reduce((sum, m) => sum + (muscleMap.get(m)?.aestheticPriority ?? 5), 0) / Math.max(1, exercise.primary.length);
  const readinessScorePart = readiness === 'green' ? 30 : readiness === 'yellow' ? 10 : -30;
  const score = Math.round(clamp(priority * 8 + volumeGap + readinessScorePart - lastPain * 8 - (hadWeakness ? 50 : 0) + (clean ? 20 : 0), -100, 200));
  const bestSet = last.bestSet ? `${last.bestSet.weight} kg × ${last.bestSet.reps}` : undefined;

  const milestone = action === 'increase_load'
    ? `Nuevo bloque: ${recommendedWeight} kg buscando ${exercise.repRange[0]}-${exercise.repRange[0] + 2} reps.`
    : action === 'increase_reps'
      ? `Siguiente micro-PR: ${recommendedWeight} kg × ${recommendedReps}.`
      : action === 'add_set'
        ? `Subir volumen a ${recommendedSets} series si el dolor sigue ≤2/10.`
        : action === 'rebuild_quality'
          ? 'Milestone: 2 exposiciones con técnica 4/5 y ROM 4/5.'
          : undefined;

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    action,
    actionLabel: actionLabel(action),
    recommendedWeight,
    recommendedReps,
    recommendedSets,
    targetRir,
    confidence,
    readiness,
    score,
    reasons: reasons.length ? reasons : ['Progresión conservadora por falta de señal clara.'],
    warnings,
    lastExposure: last.date,
    lastBestSet: bestSet,
    projectedNextMilestone: milestone
  };
}

export function muscleOverloadStates(data: AppData): MuscleOverloadState[] {
  const vols = rollingVolume(data, 10);
  const clocks = muscleClocks(data);
  const ranks = muscleRanks(data);
  return MUSCLES.map((m) => {
    const vol = vols.find((v) => v.muscleId === m.id)!;
    const clock = clocks.find((c) => c.muscleId === m.id)!;
    const rank = ranks.find((r) => r.muscleId === m.id);
    const [min, max] = m.targetSets10d;
    const volumeGap = Math.round((min - vol.hardSets) * 10) / 10;
    let recommendedStimulus: MuscleOverloadState['recommendedStimulus'] = 'maintain';
    let overloadDirective = 'Mantener: volumen dentro del rango útil.';
    let limitingFactor = rank?.bottleneck;

    if (clock.status === 'red') {
      recommendedStimulus = 'recover';
      overloadDirective = `Recuperar: faltan ~${Math.ceil(clock.readyInHours)}h para estímulo ligero.`;
      limitingFactor = limitingFactor ?? 'recuperación';
    } else if (clock.status === 'yellow') {
      recommendedStimulus = 'light';
      overloadDirective = 'Tocar ligero/técnico, sin récords.';
      limitingFactor = limitingFactor ?? 'reloj muscular amarillo';
    } else if (m.avoidOverdevelopment && vol.hardSets >= min) {
      recommendedStimulus = 'maintain';
      overloadDirective = 'Mantener, no perseguir más volumen en esta zona.';
      limitingFactor = limitingFactor ?? 'no prioritario';
    } else if (vol.hardSets < min) {
      recommendedStimulus = 'hard';
      overloadDirective = `Priorizar estímulo fuerte: faltan ${Math.max(0, volumeGap).toFixed(1)} series útiles.`;
    } else if (vol.hardSets < max && m.aestheticPriority >= 8) {
      recommendedStimulus = 'light';
      overloadDirective = 'Puede recibir microdosis si la sesión encaja.';
    }

    return {
      muscleId: m.id,
      muscleName: m.name,
      readiness: clock.status,
      priority: m.aestheticPriority,
      currentSets10d: vol.hardSets,
      targetSets10d: m.targetSets10d,
      volumeGap,
      overloadDirective,
      recommendedStimulus,
      limitingFactor
    };
  }).sort((a, b) => {
    const stimRank = { hard: 4, light: 3, maintain: 2, recover: 1 } as const;
    return stimRank[b.recommendedStimulus] - stimRank[a.recommendedStimulus] || b.priority - a.priority;
  });
}

export function overloadDashboard(data: AppData): OverloadDashboard {
  const checkin = latestCheckin(data);
  const readiness = readinessScore(checkin);
  const exercisesInPlan = Array.from(new Set(TEMPLATES.flatMap((t) => t.exercises.map((e) => e.exerciseId))))
    .map((id) => exerciseMap.get(id))
    .filter((e): e is Exercise => Boolean(e));
  const actions = exercisesInPlan
    .map((exercise) => exerciseOverloadState(data, exercise))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  const muscleStates = muscleOverloadStates(data);
  let globalMode: OverloadDashboard['globalMode'] = 'build';
  if (checkin?.rightWeakness || checkin?.shoulderStatus === 'red') globalMode = 'recover';
  else if (readiness < 55) globalMode = 'deload';
  else if (readiness < 70) globalMode = 'hold';
  else if (readiness >= 88 && actions.some((a) => a.action === 'increase_load' || a.action === 'add_set')) globalMode = 'push';

  const headline = globalMode === 'push'
    ? 'Hay permiso para progresar, pero solo en ejercicios limpios.'
    : globalMode === 'build'
      ? 'Construcción controlada: reps y técnica antes que ego.'
      : globalMode === 'hold'
        ? 'Consolidar: mantener cargas y acumular series útiles.'
        : globalMode === 'deload'
          ? 'Descarga parcial: baja volumen/carga y conserva el hábito.'
          : 'Recuperar: proteger hombro y sistema nervioso hoy.';

  return {
    globalMode,
    globalScore: readiness,
    headline,
    nextBestActions: actions,
    muscleStates,
    rules: [
      'Sube carga solo cuando completes el techo de reps con RIR objetivo, técnica ≥4/5, ROM ≥4/5 y dolor ≤2/10.',
      'Si hay pérdida de fuerza derecha, el ejercicio queda en descarga o bloqueado. No hay PR que compense ese peaje.',
      'Si el músculo va bajo de volumen y está verde, añade series antes que inventar ejercicios nuevos.',
      'Si la técnica cae, el progreso válido es reconstruir calidad, no mover más hierro.',
      'En déficit, el fallo se reserva para aislamientos seguros. Compuestos y ejercicios sensibles se quedan en RIR 1-3.'
    ]
  };
}

export function nextExerciseTarget(data: AppData, exercise: Exercise) {
  const state = exerciseOverloadState(data, exercise);
  return {
    weight: state.recommendedWeight,
    reps: state.recommendedReps,
    sets: state.recommendedSets,
    action: state.action,
    note: `${state.actionLabel}: ${state.reasons[0] ?? 'sigue el plan.'}`,
    warnings: state.warnings
  };
}

export function nutritionToday(data: AppData) {
  const today = new Date().toISOString().slice(0, 10);
  const meals = data.meals.filter((m) => m.createdAt.slice(0, 10) === today);
  const protein = meals.reduce((sum, m) => sum + m.protein, 0);
  const creatine = meals.some((m) => m.tags.includes('creatina'));
  const postWorkout = meals.some((m) => m.tags.includes('post-entreno'));
  const score = clamp((protein / 160) * 70 + (creatine ? 15 : 0) + (postWorkout ? 15 : 0), 0, 100);
  return { meals, protein, creatine, postWorkout, score: Math.round(score), proteinTarget: 160 };
}

export function projections(data: AppData): Projection[] {
  const metrics = [...data.metrics].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const weightPoints = metrics.filter((m) => typeof m.weightKg === 'number').map((m, i) => ({ x: i, y: m.weightKg! }));
  const waistPoints = metrics.filter((m) => typeof m.waistNavelCm === 'number').map((m, i) => ({ x: i, y: m.waistNavelCm! }));
  const weightTrend = linearTrend(weightPoints);
  const waistTrend = linearTrend(waistPoints);
  const lastWeight = weightPoints.length ? weightPoints[weightPoints.length - 1].y : undefined;
  const lastWaist = waistPoints.length ? waistPoints[waistPoints.length - 1].y : undefined;
  const ranks = muscleRanks(data);
  const topProgress = ranks.filter((r) => r.trend === 'up').slice(0, 3).map((r) => muscleMap.get(r.muscleId)?.name).join(', ') || 'aún sin datos suficientes';
  const limiting: string[] = [];
  if (metrics.length < 3) limiting.push('faltan más mediciones de peso/cintura');
  if (!data.sessions.length) limiting.push('faltan sesiones registradas');

  return [
    {
      label: 'Peso corporal',
      conservative: lastWeight ? `${(lastWeight + weightTrend * 2).toFixed(1)} kg en ~4 semanas` : 'sin datos',
      current: lastWeight ? `${(lastWeight + weightTrend * 4).toFixed(1)} kg en ~8 semanas` : 'añade peso semanal',
      optimized: lastWeight ? `${(lastWeight + weightTrend * 5.5 - 0.5).toFixed(1)} kg si adherencia mejora` : 'añade peso semanal',
      confidence: metrics.length >= 4 ? 'media' : 'baja',
      limitingFactors: limiting
    },
    {
      label: 'Cintura',
      conservative: lastWaist ? `${(lastWaist + waistTrend * 2).toFixed(1)} cm en ~4 semanas` : 'sin datos',
      current: lastWaist ? `${(lastWaist + waistTrend * 4).toFixed(1)} cm en ~8 semanas` : 'mide cintura 1 vez/semana',
      optimized: lastWaist ? `${(lastWaist + waistTrend * 5.5 - 1).toFixed(1)} cm si déficit se sostiene` : 'mide cintura 1 vez/semana',
      confidence: waistPoints.length >= 4 ? 'media' : 'baja',
      limitingFactors: waistPoints.length < 3 ? ['faltan medidas de cintura'] : []
    },
    {
      label: 'Rangos musculares',
      conservative: `Subida lenta en ${topProgress}`,
      current: '1-3 músculos podrían subir rango en 4-8 semanas con datos consistentes',
      optimized: 'Deltoide lateral, pecho y dorsal son los rangos con más retorno visual',
      confidence: data.sessions.length >= 4 ? 'media' : 'baja',
      limitingFactors: data.sessions.length < 4 ? ['faltan entrenos logueados'] : []
    }
  ];
}

export function campaignMissions(data: AppData): CampaignMission[] {
  const vols = rollingVolume(data, 10);
  const ranks = muscleRanks(data);
  const nutrition = nutritionToday(data);
  const checkin = latestCheckin(data);
  const sessionsA = data.sessions.filter((s) => s.type === 'A_PUSH').length;
  const sessionsC = data.sessions.filter((s) => s.type === 'C_GLUTE_LOWER').length;
  const shoulderWeakSets = data.sessions.flatMap((s) => s.sets).filter((set) => set.rightWeakness).length;
  const lateralVol = vols.find((v) => v.muscleId === 'shoulder_lateral')?.hardSets ?? 0;
  const gluteSessions = sessionsC;
  const chestRank = ranks.find((r) => r.muscleId === 'chest');
  return [
    {
      id: 'mission-chest-safe', title: 'Pecho seguro', description: 'Completa 6 sesiones Push sin alertas graves de hombro.', metric: 'sesiones A', current: Math.min(6, sessionsA), target: 6, reward: 'Pectoral +250 XP', completed: sessionsA >= 6 && shoulderWeakSets === 0
    },
    {
      id: 'mission-lateral-volume', title: 'Anchura visual', description: 'Llega a 14 series útiles de deltoide lateral en ventana de 10 días.', metric: 'series lateral', current: Math.min(14, lateralVol), target: 14, reward: 'Deltoide lateral desbloquea quest Oro', completed: lateralVol >= 14
    },
    {
      id: 'mission-glute-return', title: 'Glúteo vuelve al mapa', description: 'Completa 3 sesiones C para encontrar tus patrones sin lumbar.', metric: 'sesiones C', current: Math.min(3, gluteSessions), target: 3, reward: 'Glúteo +200 XP', completed: gluteSessions >= 3
    },
    {
      id: 'mission-protein', title: 'Proteína blindada', description: 'Llega hoy a 150 g de proteína estimada.', metric: 'proteína', current: Math.min(150, nutrition.protein), target: 150, reward: 'Nutrition Rank +', completed: nutrition.protein >= 150
    },
    {
      id: 'mission-shoulder-guardian', title: 'Shoulder Guardian', description: 'Mantén cero pérdidas de fuerza derecha registradas.', metric: 'alertas', current: shoulderWeakSets === 0 && !checkin?.rightWeakness ? 1 : 0, target: 1, reward: 'Hombro pasa a verde si se sostiene', completed: shoulderWeakSets === 0 && !checkin?.rightWeakness
    },
    {
      id: 'mission-chest-rank', title: 'Pectoral a Plata', description: 'Sube el pectoral por encima de Bronce I.', metric: 'score pecho', current: chestRank?.score ?? 0, target: 300, reward: 'Desbloqueo: variantes avanzadas de pecho seguro', completed: (chestRank?.score ?? 0) >= 300
    }
  ];
}
