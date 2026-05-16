import { AppData, DailyCheckin, Traffic } from '../types';
import { BLOCKED_EXERCISES, MUSCLES } from '../data/seed';
import { latestCheckin, muscleClocks, nutritionToday, readinessScore, recommendSession, rollingVolume } from '../lib/engines';
import { dateKey, fmtHours, uid } from '../lib/format';
import { Card, Meter, Pill, SectionHeader, Stat, TrafficDot } from './UI';

type Props = {
  data: AppData;
  onSaveCheckin: (checkin: DailyCheckin) => void;
  onStartSession: (type: string) => void;
};

export function Today({ data, onSaveCheckin, onStartSession }: Props) {
  const checkin = latestCheckin(data);
  const rec = recommendSession(data);
  const readiness = readinessScore(checkin);
  const nutrition = nutritionToday(data);
  const clocks = muscleClocks(data);
  const vols = rollingVolume(data, 10);
  const keyMuscles = ['chest','shoulder_lateral','lats','shoulder_rear','glutes'] as const;

  function updateCheckin(patch: Partial<DailyCheckin>) {
    const next: DailyCheckin = {
      id: checkin?.id ?? uid('checkin'),
      date: dateKey(),
      sleepHours: checkin?.sleepHours ?? 8,
      energy: checkin?.energy ?? 8,
      hrvMs: checkin?.hrvMs,
      restingHr: checkin?.restingHr,
      bodyBattery: checkin?.bodyBattery,
      steps: checkin?.steps,
      shoulderStatus: checkin?.shoulderStatus ?? 'yellow',
      shoulderPain: checkin?.shoulderPain ?? 1,
      elbowPain: checkin?.elbowPain ?? 0,
      lumbarPain: checkin?.lumbarPain ?? 0,
      neckPain: checkin?.neckPain ?? 0,
      rightWeakness: checkin?.rightWeakness ?? false,
      notes: checkin?.notes,
      ...patch
    };
    onSaveCheckin(next);
  }

  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Today Engine" title="Siguiente mejor acción" body="La app decide por recuperación muscular, volumen, lesión y prioridad estética. Menos calendario, más biología." />
      <Card className="heroCard">
        <div>
          <span className="eyebrow">Recomendación</span>
          <h1>{rec.title}</h1>
          <p>{rec.reasons.slice(0, 2).join(' · ')}</p>
          <div className="row wrap">
            <Pill tone={rec.mode === 'full' ? 'green' : rec.mode === 'reduced' ? 'yellow' : 'blue'}>{rec.mode === 'full' ? 'Sesión completa' : rec.mode === 'reduced' ? 'Volumen reducido' : 'Modo recuperación'}</Pill>
            <Pill tone="purple">Score {rec.score}</Pill>
          </div>
        </div>
        <button className="primaryButton" onClick={() => onStartSession(rec.type)}>Empezar</button>
      </Card>

      <div className="grid three">
        <Card><Stat label="Readiness" value={`${readiness}/100`} hint="Sueño + energía + articulaciones" /><Meter value={readiness} /></Card>
        <Card><Stat label="Proteína hoy" value={`${nutrition.protein}/${nutrition.proteinTarget} g`} hint={`Nutrition Score ${nutrition.score}/100`} /><Meter value={nutrition.protein} max={nutrition.proteinTarget} /></Card>
        <Card><Stat label="Hombro derecho" value={<><TrafficDot status={checkin?.shoulderStatus ?? 'yellow'} /> {checkin?.rightWeakness ? 'Bloqueado' : checkin?.shoulderStatus ?? 'amarillo'}</>} hint={checkin?.rightWeakness ? 'Pérdida de fuerza marcada' : 'Shoulder Guardian activo'} /></Card>
      </div>

      <Card>
        <h3>Check-in rápido</h3>
        <p className="muted" id="checkin-help">Completa los rangos sugeridos para que las recomendaciones sean más precisas.</p>
        <div className="formGrid">
          <label>Sueño (4-12 h) <input type="number" min="4" max="12" step="0.25" aria-describedby="sleep-help" value={checkin?.sleepHours ?? 8} onChange={(e) => updateCheckin({ sleepHours: Number(e.target.value) })} /></label>
          <small id="sleep-help" className="fieldHint">Rango válido: 4 a 12 horas.</small>
          <label>Energía 1-10 <input type="number" min="1" max="10" aria-describedby="energy-help" value={checkin?.energy ?? 8} onChange={(e) => updateCheckin({ energy: Number(e.target.value) })} /></label>
          <small id="energy-help" className="fieldHint">Rango válido: 1 a 10.</small>
          <label>HRV <input type="number" value={checkin?.hrvMs ?? ''} onChange={(e) => updateCheckin({ hrvMs: Number(e.target.value) || undefined })} /></label>
          <label>FC reposo <input type="number" value={checkin?.restingHr ?? ''} onChange={(e) => updateCheckin({ restingHr: Number(e.target.value) || undefined })} /></label>
          <label>Body Battery <input type="number" value={checkin?.bodyBattery ?? ''} onChange={(e) => updateCheckin({ bodyBattery: Number(e.target.value) || undefined })} /></label>
          <label>Pasos <input type="number" min="0" max="100000" aria-describedby="steps-help" value={checkin?.steps ?? ''} onChange={(e) => updateCheckin({ steps: Number(e.target.value) || undefined })} /></label>
          <small id="steps-help" className="fieldHint">Rango válido: 0 a 100000.</small>
          <label>Estado hombro
            <select value={checkin?.shoulderStatus ?? 'yellow'} onChange={(e) => updateCheckin({ shoulderStatus: e.target.value as Traffic })}>
              <option value="green">Verde</option><option value="yellow">Amarillo</option><option value="red">Rojo</option>
            </select>
          </label>
          <label className="check"><input type="checkbox" checked={checkin?.rightWeakness ?? false} onChange={(e) => updateCheckin({ rightWeakness: e.target.checked })} /> Pérdida de fuerza derecha</label>
        </div>
        {(checkin?.energy ?? 8) < 1 || (checkin?.energy ?? 8) > 10 ? <p className="fieldError" role="alert">La energía debe estar entre 1 y 10.</p> : null}
      </Card>

      <div className="grid two">
        <Card>
          <h3>Relojes musculares clave</h3>
          <div className="list">
            {keyMuscles.map((id) => {
              const m = MUSCLES.find((x) => x.id === id)!;
              const c = clocks.find((x) => x.muscleId === id)!;
              const v = vols.find((x) => x.muscleId === id)!;
              return <div className="listItem" key={id}>
                <div><strong>{m.icon} {m.name}</strong><span>{v.hardSets}/{m.targetSets10d[0]}-{m.targetSets10d[1]} series útiles · último fuerte {fmtHours(c.hoursSinceHard)}</span></div>
                <Pill tone={c.status === 'green' ? 'green' : c.status === 'yellow' ? 'yellow' : 'red'}>{c.status === 'green' ? 'listo' : c.status === 'yellow' ? `en ${fmtHours(c.readyInHours)}` : 'bloqueado'}</Pill>
              </div>;
            })}
          </div>
        </Card>
        <Card>
          <h3>Bloqueos de seguridad</h3>
          <p className="muted">Estos ejercicios quedan fuera hasta que el hombro, codos y técnica den permiso real.</p>
          <div className="chips">{BLOCKED_EXERCISES.map((x) => <Pill key={x} tone="red">{x}</Pill>)}</div>
        </Card>
      </div>

      {rec.warnings.length > 0 && <Card className="warningCard"><h3>Alertas</h3>{rec.warnings.map((w) => <p key={w}>{w}</p>)}</Card>}
    </div>
  );
}
