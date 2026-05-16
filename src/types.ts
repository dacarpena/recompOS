export type ID = string;

export type MuscleGroup =
  | 'chest'
  | 'shoulder_lateral'
  | 'shoulder_rear'
  | 'shoulder_front'
  | 'lats'
  | 'upper_back'
  | 'biceps'
  | 'triceps'
  | 'glutes'
  | 'hamstrings'
  | 'quads'
  | 'calves'
  | 'core'
  | 'rotator_cuff'
  | 'serratus'
  | 'traps_upper'
  | 'forearms';

export type SessionType = 'A_PUSH' | 'B_PULL' | 'C_GLUTE_LOWER' | 'D_MICRO' | 'E_RECOVERY' | 'REST';
export type PainZone = 'shoulder' | 'elbow' | 'lumbar' | 'neck';
export type Traffic = 'green' | 'yellow' | 'red' | 'blue' | 'purple';
export type Tier =
  | 'Hierro'
  | 'Bronce III'
  | 'Bronce II'
  | 'Bronce I'
  | 'Plata III'
  | 'Plata II'
  | 'Plata I'
  | 'Oro III'
  | 'Oro II'
  | 'Oro I'
  | 'Platino III'
  | 'Platino II'
  | 'Platino I'
  | 'Diamante III'
  | 'Diamante II'
  | 'Diamante I'
  | 'Ónix';


export type OverloadAction =
  | 'increase_load'
  | 'increase_reps'
  | 'hold'
  | 'rebuild_quality'
  | 'reduce_load'
  | 'add_set'
  | 'deload'
  | 'skip';

export interface ExerciseOverloadState {
  exerciseId: ID;
  exerciseName: string;
  action: OverloadAction;
  actionLabel: string;
  recommendedWeight: number;
  recommendedReps: number;
  recommendedSets: number;
  targetRir: [number, number];
  confidence: 'baja' | 'media' | 'alta';
  readiness: Traffic;
  score: number;
  reasons: string[];
  warnings: string[];
  lastExposure?: string;
  lastBestSet?: string;
  projectedNextMilestone?: string;
}

export interface MuscleOverloadState {
  muscleId: MuscleGroup;
  muscleName: string;
  readiness: Traffic;
  priority: number;
  currentSets10d: number;
  targetSets10d: [number, number];
  volumeGap: number;
  overloadDirective: string;
  recommendedStimulus: 'hard' | 'light' | 'recover' | 'maintain';
  limitingFactor?: string;
}

export interface OverloadDashboard {
  globalMode: 'push' | 'build' | 'hold' | 'deload' | 'recover';
  globalScore: number;
  headline: string;
  nextBestActions: ExerciseOverloadState[];
  muscleStates: MuscleOverloadState[];
  rules: string[];
}

export interface Muscle {
  id: MuscleGroup;
  name: string;
  icon: string;
  aestheticPriority: number; // 1-10
  hardRecoveryHours: number;
  lightRecoveryHours: number;
  targetSets10d: [number, number];
  avoidOverdevelopment?: boolean;
}

export interface Exercise {
  id: ID;
  name: string;
  pattern: string;
  primary: MuscleGroup[];
  contributions: Partial<Record<MuscleGroup, number>>;
  defaultSets: number;
  repRange: [number, number];
  rirTarget: [number, number];
  risk: Partial<Record<PainZone, number>>; // 0-10
  blocked?: boolean;
  blockReason?: string;
  cues: string[];
  stopSignals: string[];
  alternatives: ID[];
}

export interface TemplateExercise {
  exerciseId: ID;
  sets?: number;
  note?: string;
}

export interface WorkoutTemplate {
  id: SessionType;
  title: string;
  short: string;
  purpose: string;
  estMinutes: [number, number];
  focus: MuscleGroup[];
  exercises: TemplateExercise[];
}

export interface SetLog {
  id: ID;
  exerciseId: ID;
  weight: number;
  reps: number;
  rir: number;
  technique: 1 | 2 | 3 | 4 | 5; // 1 poor, 5 excellent
  rom: 1 | 2 | 3 | 4 | 5;
  shoulderPain: number;
  elbowPain: number;
  lumbarPain: number;
  rightWeakness: boolean;
  createdAt: string;
}

export interface WorkoutSession {
  id: ID;
  type: SessionType;
  startedAt: string;
  endedAt?: string;
  energy: number;
  sleepHours?: number;
  notes?: string;
  sets: SetLog[];
}

export interface MealLog {
  id: ID;
  createdAt: string;
  name: string;
  protein: number;
  caloriesMin?: number;
  caloriesMax?: number;
  tags: string[];
}

export interface BodyMetric {
  id: ID;
  createdAt: string;
  weightKg?: number;
  waistNavelCm?: number;
  waistMinCm?: number;
  chestCm?: number;
  shouldersCm?: number;
  armFlexedCm?: number;
  hipsCm?: number;
  notes?: string;
}

export interface DailyCheckin {
  id: ID;
  date: string; // yyyy-mm-dd
  sleepHours: number;
  energy: number;
  hrvMs?: number;
  restingHr?: number;
  bodyBattery?: number;
  steps?: number;
  shoulderStatus: Traffic;
  shoulderPain: number;
  elbowPain: number;
  lumbarPain: number;
  neckPain: number;
  rightWeakness: boolean;
  notes?: string;
}

export interface FoodTemplate {
  id: ID;
  name: string;
  protein: number;
  caloriesMin: number;
  caloriesMax: number;
  tags: string[];
}

export interface AppData {
  sessions: WorkoutSession[];
  meals: MealLog[];
  metrics: BodyMetric[];
  checkins: DailyCheckin[];
  createdAt: string;
  updatedAt: string;
}

export interface MuscleClock {
  muscleId: MuscleGroup;
  lastHard?: string;
  lastLight?: string;
  hoursSinceHard: number;
  hoursSinceLight: number;
  status: Traffic;
  readyInHours: number;
}

export interface RollingMuscleVolume {
  muscleId: MuscleGroup;
  hardSets: number;
  usefulLoad: number;
  xp: number;
  painPenalty: number;
}

export interface MuscleRank {
  muscleId: MuscleGroup;
  score: number;
  tier: Tier;
  progress: number;
  trend: 'up' | 'flat' | 'down';
  projectionWeeks: number | null;
  bottleneck?: string;
}

export interface Recommendation {
  type: SessionType;
  score: number;
  title: string;
  reasons: string[];
  warnings: string[];
  blockedExercises: string[];
  mode: 'full' | 'reduced' | 'recovery';
}

export interface Projection {
  label: string;
  conservative: string;
  current: string;
  optimized: string;
  confidence: 'baja' | 'media' | 'alta';
  limitingFactors: string[];
}

export interface CampaignMission {
  id: ID;
  title: string;
  description: string;
  metric: string;
  current: number;
  target: number;
  reward: string;
  completed: boolean;
}
