import { AppData } from '../types';
import { MUSCLES } from '../data/seed';
import { muscleClocks, muscleRanks, rollingVolume } from '../lib/engines';
import { fmtHours } from '../lib/format';
import { Card, Meter, Pill, SectionHeader, TrafficDot } from './UI';

export function Atlas({ data }: { data: AppData }) {
  const ranks = muscleRanks(data);
  const vols = rollingVolume(data, 10);
  const clocks = muscleClocks(data);
  const topNext = [...ranks].sort((a, b) => b.progress - a.progress).slice(0, 4);

  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Atlas Muscular" title="Rangos, XP y relojes por músculo" body="Cada músculo sube de rango por volumen útil, fuerza relativa, progresión, técnica, consistencia y ausencia de dolor." />
      <Card>
        <h3>Cerca de subir rango</h3>
        <div className="grid four">
          {topNext.map((r) => {
            const muscle = MUSCLES.find((m) => m.id === r.muscleId)!;
            return <div className="rankMini" key={r.muscleId}><strong>{muscle.icon} {muscle.name}</strong><span>{r.tier}</span><Meter value={r.progress * 100} /></div>;
          })}
        </div>
      </Card>
      <div className="atlasGrid">
        {ranks.map((rank) => {
          const m = MUSCLES.find((x) => x.id === rank.muscleId)!;
          const v = vols.find((x) => x.muscleId === rank.muscleId)!;
          const c = clocks.find((x) => x.muscleId === rank.muscleId)!;
          return (
            <Card key={m.id} className="muscleCard">
              <div className="row between">
                <div><span className="muscleIcon">{m.icon}</span><h3>{m.name}</h3></div>
                <TrafficDot status={c.status} />
              </div>
              <div className="rankLine"><strong>{rank.tier}</strong><span>{rank.score}/1000</span></div>
              <Meter value={rank.progress * 100} />
              <div className="muscleMeta">
                <span>Series 10d: <b>{v.hardSets}</b> / {m.targetSets10d[0]}-{m.targetSets10d[1]}</span>
                <span>Último fuerte: <b>{fmtHours(c.hoursSinceHard)}</b></span>
                <span>XP 10d: <b>{v.xp}</b></span>
                <span>Tendencia: <b>{rank.trend === 'up' ? 'subiendo' : rank.trend === 'down' ? 'bajando' : 'plana'}</b></span>
              </div>
              <div className="row wrap">
                {rank.projectionWeeks != null && <Pill tone="purple">Próximo rango ~{rank.projectionWeeks} sem</Pill>}
                {rank.bottleneck && <Pill tone="yellow">{rank.bottleneck}</Pill>}
                {m.avoidOverdevelopment && <Pill tone="blue">mantener</Pill>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
