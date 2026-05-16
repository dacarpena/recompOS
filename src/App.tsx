import { useEffect, useState } from 'react';
import { AppData, BodyMetric, DailyCheckin, MealLog, SessionType, WorkoutSession } from './types';
import { addMeal, addMetric, addSession, exportData, importDataFile, loadData, saveData, upsertCheckin } from './lib/storage';
import { Today } from './components/Today';
import { Workout } from './components/Workout';
import { Atlas } from './components/Atlas';
import { Nutrition } from './components/Nutrition';
import { Progress } from './components/Progress';
import { Campaign } from './components/Campaign';
import { Plan } from './components/Plan';
import { Overload } from './components/Overload';

type Tab = 'today' | 'train' | 'overload' | 'atlas' | 'nutrition' | 'progress' | 'campaign' | 'plan';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [tab, setTab] = useState<Tab>('today');
  const [initialWorkout, setInitialWorkout] = useState<SessionType>('A_PUSH');

  useEffect(() => saveData(data), [data]);

  function handleSaveCheckin(checkin: DailyCheckin) { setData((d) => upsertCheckin(d, checkin)); }
  function handleSaveSession(session: WorkoutSession) { setData((d) => addSession(d, session)); setTab('atlas'); }
  function handleAddMeal(meal: MealLog) { setData((d) => addMeal(d, meal)); }
  function handleAddMetric(metric: BodyMetric) { setData((d) => addMetric(d, metric)); }
  function startSession(type: string) { setInitialWorkout(type as SessionType); setTab('train'); }

  async function importFile(file?: File) {
    if (!file) return;
    const imported = await importDataFile(file);
    setData(imported);
  }

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="brand" onClick={() => setTab('today')}>
          <span className="logo">◆</span>
          <div><strong>RecompOS</strong><small>Data-driven physique RPG</small></div>
        </div>
        <nav className="topNav">
          <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}>Hoy</button>
          <button className={tab === 'train' ? 'active' : ''} onClick={() => setTab('train')}>Entrenar</button>
          <button className={tab === 'overload' ? 'active' : ''} onClick={() => setTab('overload')}>Sobrecarga</button>
          <button className={tab === 'atlas' ? 'active' : ''} onClick={() => setTab('atlas')}>Atlas</button>
          <button className={tab === 'nutrition' ? 'active' : ''} onClick={() => setTab('nutrition')}>Nutrición</button>
          <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}>Progreso</button>
          <button className={tab === 'campaign' ? 'active' : ''} onClick={() => setTab('campaign')}>Campaña</button>
          <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}>Plan</button>
        </nav>
        <div className="headerActions">
          <button onClick={() => exportData(data)}>Exportar</button>
          <label className="importButton">Importar<input type="file" accept="application/json" onChange={(e) => importFile(e.target.files?.[0])} /></label>
        </div>
      </header>
      <main>
        {tab === 'today' && <Today data={data} onSaveCheckin={handleSaveCheckin} onStartSession={startSession} />}
        {tab === 'train' && <Workout data={data} initialType={initialWorkout} onSaveSession={handleSaveSession} />}
        {tab === 'overload' && <Overload data={data} />}
        {tab === 'atlas' && <Atlas data={data} />}
        {tab === 'nutrition' && <Nutrition data={data} onAddMeal={handleAddMeal} />}
        {tab === 'progress' && <Progress data={data} onAddMetric={handleAddMetric} />}
        {tab === 'campaign' && <Campaign data={data} />}
        {tab === 'plan' && <Plan />}
      </main>
    </div>
  );
}
