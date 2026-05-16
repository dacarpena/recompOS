import { AppData } from '../types';
import { campaignMissions } from '../lib/engines';
import { Card, Meter, Pill, SectionHeader } from './UI';

export function Campaign({ data }: { data: AppData }) {
  const missions = campaignMissions(data);
  const completed = missions.filter((m) => m.completed).length;
  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Campaign Mode" title="Camino hacia tu mejor físico" body="Misiones útiles: rangos musculares, hombro protegido, proteína, glúteo y V-shape. Sin confeti de baratillo: recompensas que cambian el plan." />
      <Card className="heroCard">
        <div>
          <span className="eyebrow">Campaña actual</span>
          <h1>Recomp Foundation</h1>
          <p>Construir base estética, proteger hombro, bajar cintura y subir los músculos con mayor retorno visual.</p>
        </div>
        <div className="campaignBadge"><strong>{completed}/{missions.length}</strong><span>misiones</span></div>
      </Card>
      <div className="missionGrid">
        {missions.map((m) => (
          <Card key={m.id} className={m.completed ? 'mission complete' : 'mission'}>
            <div className="row between">
              <h3>{m.title}</h3>
              <Pill tone={m.completed ? 'green' : 'purple'}>{m.completed ? 'completada' : m.reward}</Pill>
            </div>
            <p className="muted">{m.description}</p>
            <Meter value={m.current} max={m.target} label={`${Math.round(m.current)}/${m.target} · ${m.metric}`} />
          </Card>
        ))}
      </div>
      <Card>
        <h3>Próximas campañas</h3>
        <div className="timeline">
          <span><b>V-Shape Build</b> · hombros, dorsal, espalda alta, pecho superior</span>
          <span><b>Lean Armor</b> · cintura, abdomen, densidad, fotos</span>
          <span><b>Peak Phase</b> · mejor físico registrado y mantenimiento</span>
        </div>
      </Card>
    </div>
  );
}
