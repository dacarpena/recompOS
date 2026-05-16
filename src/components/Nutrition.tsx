import { useState } from 'react';
import { AppData, MealLog } from '../types';
import { FOOD_TEMPLATES } from '../data/seed';
import { nutritionToday } from '../lib/engines';
import { uid } from '../lib/format';
import { Card, Meter, Pill, SectionHeader, Stat } from './UI';

export function Nutrition({ data, onAddMeal }: { data: AppData; onAddMeal: (meal: MealLog) => void }) {
  const today = nutritionToday(data);
  const [customName, setCustomName] = useState('Comida libre');
  const [customProtein, setCustomProtein] = useState(40);

  function addTemplate(id: string) {
    const f = FOOD_TEMPLATES.find((x) => x.id === id)!;
    onAddMeal({ id: uid('meal'), createdAt: new Date().toISOString(), name: f.name, protein: f.protein, caloriesMin: f.caloriesMin, caloriesMax: f.caloriesMax, tags: f.tags });
  }

  function addCustom() {
    onAddMeal({ id: uid('meal'), createdAt: new Date().toISOString(), name: customName, protein: customProtein, tags: ['manual'] });
  }

  function addCreatine() {
    onAddMeal({ id: uid('meal'), createdAt: new Date().toISOString(), name: 'Creatina 7 g', protein: 0, tags: ['creatina'] });
  }

  return (
    <div className="screenGrid">
      <SectionHeader eyebrow="Nutrition OS" title="Nutrición práctica para furgo" body="No finge precisión imposible. Prioriza proteína, creatina, pre/post entreno y tendencia real de peso/cintura." />
      <div className="grid three">
        <Card><Stat label="Proteína" value={`${today.protein}/${today.proteinTarget} g`} hint="objetivo base" /><Meter value={today.protein} max={today.proteinTarget} /></Card>
        <Card><Stat label="Nutrition Score" value={`${today.score}/100`} hint="proteína + creatina + post" /><Meter value={today.score} /></Card>
        <Card><Stat label="Creatina" value={today.creatine ? 'Hecha' : 'Pendiente'} hint="7 g/día" /><button className="secondaryButton full" onClick={addCreatine}>Marcar creatina</button></Card>
      </div>
      <Card>
        <h3>Comidas rápidas</h3>
        <div className="foodGrid">
          {FOOD_TEMPLATES.map((f) => <button className="foodButton" key={f.id} onClick={() => addTemplate(f.id)}><strong>{f.name}</strong><span>{f.protein} g proteína · {f.caloriesMin}-{f.caloriesMax} kcal</span></button>)}
        </div>
      </Card>
      <div className="grid two">
        <Card>
          <h3>Añadir manual</h3>
          <div className="formGrid compact">
            <label>Nombre <input value={customName} onChange={(e) => setCustomName(e.target.value)} /></label>
            <label>Proteína <input type="number" value={customProtein} onChange={(e) => setCustomProtein(Number(e.target.value))} /></label>
          </div>
          <button className="secondaryButton" onClick={addCustom}>Añadir comida</button>
        </Card>
        <Card>
          <h3>Hoy</h3>
          <div className="list">
            {today.meals.map((m) => <div className="listItem" key={m.id}><div><strong>{m.name}</strong><span>{m.protein} g proteína</span></div><div className="chips">{m.tags.slice(0,2).map((t) => <Pill key={t}>{t}</Pill>)}</div></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}
