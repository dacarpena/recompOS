import { useMemo, useState } from 'react';
import { AppData, SessionType, SetLog, WorkoutSession } from '../types';
import { EXERCISES, TEMPLATES } from '../data/seed';
import { nextExerciseTarget } from '../lib/engines';
import { fmtSession, uid } from '../lib/format';
import { Card, Empty, Pill, SectionHeader } from './UI';

type Props = {
  data: AppData;
  initialType?: SessionType;
  onSaveSession: (session: WorkoutSession) => void;
};

type DraftSet = Omit<SetLog, 'id' | 'createdAt'>;

export function Workout({ data, initialType = 'A_PUSH', onSaveSession }: Props) {
  const [type, setType] = useState<SessionType>(initialType);
  const [sets, setSets] = useState<SetLog[]>([]);
  const [energy, setEnergy] = useState(8);
  const [notes, setNotes] = useState('');
  const template = TEMPLATES.find((t) => t.id === type)!;

  function addSet(exerciseId: string, draft: DraftSet) {
    setSets((prev) => [...prev, { ...draft, id: uid('set'), exerciseId, createdAt: new Date().toISOString() }]);
  }

  function removeSet(id: string) {
    setSets((prev) => prev.filter((s) => s.id !== id));
  }

  function save() {
    if (!sets.length) return;
    const session: WorkoutSession = {
      id: uid('session'), type, startedAt: new Date().toISOString(), endedAt: new Date().toISOString(), energy, notes, sets
    };
    onSaveSession(session);
    setSets([]);
    setNotes('');
  }

  const volumeSummary = useMemo(() => {
    const count = new Map<string, number>();
    sets.forEach((set) => {
      const ex = EXERCISES.find((e) => e.id === set.exerciseId);
      if (!ex) return;
      Object.entries(ex.contributions).forEach(([m, c]) => count.set(m, (count.get(m) ?? 0) + (c ?? 0)));
    });
    return Array.from(count.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sets]);

  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Workout Coach" title="Entrenar con datos, no con ego" body="Registra peso, reps, RIR, técnica, ROM y dolor. La app premia volumen útil, no sufrimiento decorativo." />
      <Card>
        <div className="row between wrap">
          <div>
            <h2>{template.title}</h2>
            <p className="muted">{template.purpose}</p>
          </div>
          <div className="row wrap">
            {TEMPLATES.map((t) => <button key={t.id} className={`tabButton ${t.id === type ? 'active' : ''}`} onClick={() => setType(t.id)}>{t.short}</button>)}
          </div>
        </div>
      </Card>

      <div className="workoutLayout">
        <div className="exerciseStack">
          {template.exercises.map((item, index) => {
            const exercise = EXERCISES.find((e) => e.id === item.exerciseId)!;
            return <ExerciseLogger key={item.exerciseId + index} exerciseId={item.exerciseId} setsTarget={item.sets ?? exercise.defaultSets} data={data} onAdd={addSet} />;
          })}
        </div>
        <aside className="sessionAside">
          <Card>
            <h3>Sesión actual</h3>
            <label>Energía 1-10 <input type="number" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))} /></label>
            <label>Notas <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sensación, máquinas ocupadas, molestias..." /></label>
            <div className="miniSummary">
              <strong>{sets.length} series registradas</strong>
              {volumeSummary.length ? volumeSummary.map(([m, v]) => <span key={m}>{m}: {v.toFixed(1)} set equiv.</span>) : <span>Sin volumen todavía.</span>}
            </div>
            <button className="primaryButton full" onClick={save} disabled={!sets.length}>Guardar sesión</button>
          </Card>
          <Card>
            <h3>Reglas del día</h3>
            <p className="muted">Si aparece pérdida de fuerza derecha, marca el check. Ese set contará casi cero y activará el Shoulder Guardian.</p>
            <Pill tone="red">Overhead bloqueado</Pill> <Pill tone="red">Dominadas libres bloqueadas</Pill>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ExerciseLogger({ exerciseId, setsTarget, data, onAdd }: { exerciseId: string; setsTarget: number; data: AppData; onAdd: (exerciseId: string, draft: DraftSet) => void }) {
  const exercise = EXERCISES.find((e) => e.id === exerciseId)!;
  const target = nextExerciseTarget(data, exercise);
  const effectiveSetsTarget = target.sets ?? setsTarget;
  const [draft, setDraft] = useState<DraftSet>({
    exerciseId,
    weight: target.weight,
    reps: target.reps,
    rir: exercise.rirTarget[0],
    technique: 4,
    rom: 4,
    shoulderPain: 0,
    elbowPain: 0,
    lumbarPain: 0,
    rightWeakness: false
  });
  const [localSets, setLocalSets] = useState<SetLog[]>([]);

  function add() {
    const s = { ...draft };
    const finalSet: SetLog = { ...s, id: uid('setlocal'), createdAt: new Date().toISOString() };
    setLocalSets((prev) => [...prev, finalSet]);
    onAdd(exerciseId, s);
    setDraft((prev) => ({ ...prev, reps: Math.max(exercise.repRange[0], prev.reps - 1), rir: exercise.rirTarget[0] }));
  }

  return (
    <Card className="exerciseCard">
      <div className="row between gap">
        <div>
          <span className="eyebrow">{effectiveSetsTarget} series · {exercise.repRange[0]}-{exercise.repRange[1]} reps · RIR {target.action === 'deload' || target.action === 'reduce_load' ? '3-4' : `${exercise.rirTarget[0]}-${exercise.rirTarget[1]}`}</span>
          <h3>{exercise.name}</h3>
          <p className="muted">{target.note}</p>
          {target.warnings?.length ? <div className="chips">{target.warnings.map((w: string) => <Pill key={w} tone="red">{w}</Pill>)}</div> : null}
        </div>
        {exercise.risk.shoulder && exercise.risk.shoulder >= 4 ? <Pill tone="yellow">riesgo hombro medio</Pill> : <Pill tone="green">seguro relativo</Pill>}
      </div>
      <div className="cueGrid">
        {exercise.cues.slice(0, 3).map((c) => <span key={c}>• {c}</span>)}
      </div>
      <div className="setGrid">
        <label>Peso <input type="number" step="0.5" value={draft.weight} onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) })} /></label>
        <label>Reps <input type="number" value={draft.reps} onChange={(e) => setDraft({ ...draft, reps: Number(e.target.value) })} /></label>
        <label>RIR <input type="number" min="0" max="5" value={draft.rir} onChange={(e) => setDraft({ ...draft, rir: Number(e.target.value) })} /></label>
        <label>Técnica <select value={draft.technique} onChange={(e) => setDraft({ ...draft, technique: Number(e.target.value) as 1|2|3|4|5 })}><option value="5">Excelente</option><option value="4">Buena</option><option value="3">Aceptable</option><option value="2">Trampa</option><option value="1">Mala</option></select></label>
        <label>ROM <select value={draft.rom} onChange={(e) => setDraft({ ...draft, rom: Number(e.target.value) as 1|2|3|4|5 })}><option value="5">Completo</option><option value="4">Casi completo</option><option value="3">Parcial útil</option><option value="2">Parcial ego</option><option value="1">No válido</option></select></label>
        <label>Hombro <input type="number" min="0" max="10" value={draft.shoulderPain} onChange={(e) => setDraft({ ...draft, shoulderPain: Number(e.target.value) })} /></label>
        <label>Codo <input type="number" min="0" max="10" value={draft.elbowPain} onChange={(e) => setDraft({ ...draft, elbowPain: Number(e.target.value) })} /></label>
        <label>Lumbar <input type="number" min="0" max="10" value={draft.lumbarPain} onChange={(e) => setDraft({ ...draft, lumbarPain: Number(e.target.value) })} /></label>
      </div>
      <label className="check danger"><input type="checkbox" checked={draft.rightWeakness} onChange={(e) => setDraft({ ...draft, rightWeakness: e.target.checked })} /> Pérdida de fuerza derecha</label>
      <button className="secondaryButton" onClick={add}>Añadir serie</button>
      {localSets.length ? <div className="setHistory">{localSets.map((s, i) => <span key={s.id}>S{i+1}: {s.weight}kg × {s.reps} · RIR {s.rir}</span>)}</div> : <Empty title="Sin series" body="Añade la primera serie cuando termines." />}
    </Card>
  );
}
