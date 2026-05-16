import { useMemo, useState } from 'react';
import { AppData, BodyMetric } from '../types';
import { MUSCLES } from '../data/seed';
import { muscleRanks, projections } from '../lib/engines';
import { uid } from '../lib/format';
import { Card, Meter, Pill, SectionHeader, Stat } from './UI';

export function Progress({ data, onAddMetric }: { data: AppData; onAddMetric: (metric: BodyMetric) => void }) {
  const [weightKg, setWeightKg] = useState('');
  const [waistNavelCm, setWaistNavelCm] = useState('');
  const [waistMinCm, setWaistMinCm] = useState('');
  const [notes, setNotes] = useState('');
  const ranks = muscleRanks(data);
  const prs = useMemo(() => buildPRs(data), [data]);
  const physScore = useMemo(() => calculatePhysiqueScore(data), [data]);
  const proj = projections(data);

  function saveMetric() {
    onAddMetric({ id: uid('metric'), createdAt: new Date().toISOString(), weightKg: Number(weightKg) || undefined, waistNavelCm: Number(waistNavelCm) || undefined, waistMinCm: Number(waistMinCm) || undefined, notes });
    setWeightKg(''); setWaistNavelCm(''); setWaistMinCm(''); setNotes('');
  }

  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Physique Lab" title="Progreso real y proyecciones" body="Combina fuerza, rangos, peso, cintura y adherencia para estimar hacia dónde va tu físico." />
      <div className="grid three">
        <Card><Stat label="Best Physique Stage" value={`${physScore.total}/100`} hint="estimación por datos actuales" /><Meter value={physScore.total} /></Card>
        <Card><Stat label="V-Shape" value={`${physScore.vshape}/100`} hint="hombro + dorsal + cintura" /><Meter value={physScore.vshape} /></Card>
        <Card><Stat label="Pecho" value={`${physScore.chest}/100`} hint="prioridad emocional" /><Meter value={physScore.chest} /></Card>
      </div>
      <div className="grid two">
        <Card>
          <h3>Nueva medición</h3>
          <div className="formGrid compact">
            <label>Peso kg <input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} /></label>
            <label>Cintura ombligo cm <input type="number" step="0.1" value={waistNavelCm} onChange={(e) => setWaistNavelCm(e.target.value)} /></label>
            <label>Cintura mínima cm <input type="number" step="0.1" value={waistMinCm} onChange={(e) => setWaistMinCm(e.target.value)} /></label>
            <label>Notas <input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          </div>
          <button className="btn btn-primary" onClick={saveMetric}>Guardar medición</button>
        </Card>
        <Card>
          <h3>Últimas mediciones</h3>
          <div className="list">
            {data.metrics.slice(0, 6).map((m) => <div className="listItem" key={m.id}><div><strong>{new Date(m.createdAt).toLocaleDateString()}</strong><span>{m.weightKg ? `${m.weightKg} kg` : 'sin peso'} · {m.waistNavelCm ? `${m.waistNavelCm} cm cintura` : 'sin cintura'}</span></div></div>)}
          </div>
        </Card>
      </div>
      <Card>
        <h3>Proyecciones</h3>
        <div className="projectionGrid">
          {proj.map((p) => <div className="projection" key={p.label}><strong>{p.label}</strong><span>Conservador: {p.conservative}</span><span>Actual: {p.current}</span><span>Optimizado: {p.optimized}</span><Pill tone={p.confidence === 'alta' ? 'green' : p.confidence === 'media' ? 'yellow' : 'red'}>confianza {p.confidence}</Pill></div>)}
        </div>
      </Card>
      <div className="grid two">
        <Card>
          <h3>Rangos clave</h3>
          <div className="list">
            {ranks.slice(0, 8).map((r) => { const m = MUSCLES.find((x) => x.id === r.muscleId)!; return <div className="listItem" key={r.muscleId}><div><strong>{m.icon} {m.name}</strong><span>{r.tier} · {r.score}/1000</span></div><Meter value={r.progress * 100} /></div>; })}
          </div>
        </Card>
        <Card>
          <h3>PRs detectados</h3>
          <div className="list">{prs.length ? prs.map((p) => <div className="listItem" key={p}><span>{p}</span></div>) : <p className="muted">Registra más sesiones para detectar PRs útiles.</p>}</div>
        </Card>
      </div>
    </div>
  );
}

function buildPRs(data: AppData) {
  const best = new Map<string, number>();
  data.sessions.forEach((session) => session.sets.forEach((s) => {
    const key = s.exerciseId;
    const useful = s.weight * s.reps;
    best.set(key, Math.max(best.get(key) ?? 0, useful));
  }));
  return Array.from(best.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([exerciseId, value]) => `${exerciseId}: ${Math.round(value)} kg·rep`);
}

function calculatePhysiqueScore(data: AppData) {
  const ranks = muscleRanks(data);
  const get = (id: string) => ranks.find((r) => r.muscleId === id)?.score ?? 100;
  const chest = Math.round(clampScore(get('chest')));
  const shoulder = Math.round(clampScore((get('shoulder_lateral') + get('shoulder_rear')) / 2));
  const back = Math.round(clampScore((get('lats') + get('upper_back')) / 2));
  const arms = Math.round(clampScore((get('biceps') + get('triceps')) / 2));
  const glute = Math.round(clampScore(get('glutes')));
  const metrics = data.metrics;
  const hasWaist = metrics.some((m) => m.waistNavelCm);
  const waist = hasWaist ? 55 : 42;
  const vshape = Math.round((shoulder * 0.35 + back * 0.35 + waist * 0.3));
  const total = Math.round(vshape * 0.25 + chest * 0.2 + shoulder * 0.15 + back * 0.12 + arms * 0.1 + waist * 0.12 + glute * 0.06);
  return { total, vshape, chest, shoulder, back, arms, waist, glute };
}
function clampScore(score: number) { return Math.max(0, Math.min(100, (score / 650) * 100)); }
