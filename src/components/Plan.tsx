import { BLOCKED_EXERCISES, EXERCISES, TEMPLATES } from '../data/seed';
import { Card, Pill, SectionHeader } from './UI';

export function Plan() {
  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Plan Base" title="Sistema A/B/C/D/E por recuperación" body="La app no usa semanas fijas. Usa relojes musculares, volumen móvil de 10 días, dolor y prioridad estética." />
      <div className="grid two">
        {TEMPLATES.map((t) => (
          <Card key={t.id}>
            <span className="eyebrow">{t.estMinutes[0]}-{t.estMinutes[1]} min</span>
            <h3>{t.title}</h3>
            <p className="muted">{t.purpose}</p>
            <ol className="exerciseList">
              {t.exercises.map((item) => {
                const ex = EXERCISES.find((e) => e.id === item.exerciseId)!;
                return <li key={item.exerciseId}>{ex.name} <span>{item.sets ?? ex.defaultSets}×{ex.repRange[0]}-{ex.repRange[1]}</span></li>;
              })}
            </ol>
          </Card>
        ))}
      </div>
      <Card>
        <h3>Ejercicios bloqueados por Shoulder Guardian</h3>
        <div className="chips">{BLOCKED_EXERCISES.map((e) => <Pill key={e} tone="red">{e}</Pill>)}</div>
      </Card>
    </div>
  );
}
