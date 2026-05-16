import { useEffect, useMemo, useState } from 'react';
import { AppData, BodyMetric, DailyCheckin, MealLog, SessionType, WorkoutSession } from './types';
import { addMeal, addMetric, addSession, exportData, getLegacyKey, importDataFile, keyForUser, loadData, readLegacyData, saveData, upsertCheckin } from './lib/storage';
import { getCurrentUser, signIn, signOut, signUp, User } from './lib/auth';
import { Today } from './components/Today';
import { Workout } from './components/Workout';
import { Atlas } from './components/Atlas';
import { Nutrition } from './components/Nutrition';
import { Progress } from './components/Progress';
import { Campaign } from './components/Campaign';
import { Plan } from './components/Plan';
import { Overload } from './components/Overload';
import { Auth } from './components/Auth';

type Tab = 'today' | 'train' | 'overload' | 'atlas' | 'nutrition' | 'progress' | 'campaign' | 'plan';

export default function App() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>('today');
  const [initialWorkout, setInitialWorkout] = useState<SessionType>('A_PUSH');

  useEffect(() => {
    if (!user) {
      setData(null);
      setTab('today');
      return;
    }
    setData(loadData(user.id));
  }, [user]);

  useEffect(() => {
    if (!user || !data) return;
    saveData(user.id, data);
  }, [user, data]);

  const canImportLegacy = useMemo(() => {
    if (!user || !readLegacyData()) return false;
    return !localStorage.getItem(keyForUser(user.id));
  }, [user]);

  function handleSaveCheckin(checkin: DailyCheckin) { setData((d) => (d ? upsertCheckin(d, checkin) : d)); }
  function handleSaveSession(session: WorkoutSession) { setData((d) => (d ? addSession(d, session) : d)); setTab('atlas'); }
  function handleAddMeal(meal: MealLog) { setData((d) => (d ? addMeal(d, meal) : d)); }
  function handleAddMetric(metric: BodyMetric) { setData((d) => (d ? addMetric(d, metric) : d)); }
  function startSession(type: string) { setInitialWorkout(type as SessionType); setTab('train'); }

  async function importFile(file?: File) {
    if (!file || !user) return;
    const imported = await importDataFile(user.id, file);
    setData(imported);
  }

  function handleImportLegacy() {
    if (!user) return;
    const legacy = readLegacyData();
    if (!legacy) return;
    saveData(user.id, legacy);
    setData(legacy);
    localStorage.removeItem(getLegacyKey());
  }

  function handleSignOut() {
    signOut();
    setData(null);
    setUser(null);
  }

  if (!user) {
    return (
      <Auth
        currentUser={null}
        onSignUp={(input) => setUser(signUp(input).user)}
        onSignIn={(input) => setUser(signIn(input).user)}
        onSignOut={handleSignOut}
        canImportLegacy={false}
        onImportLegacy={handleImportLegacy}
      />
    );
  }

  if (!data) return null;

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
          <button onClick={() => exportData(user.id, data)}>Exportar</button>
          <label className="importButton">Importar<input type="file" accept="application/json" onChange={(e) => importFile(e.target.files?.[0])} /></label>
        </div>
      </header>
      <main>
        <Auth
          currentUser={user}
          onSignUp={() => undefined}
          onSignIn={() => undefined}
          onSignOut={handleSignOut}
          canImportLegacy={canImportLegacy}
          onImportLegacy={handleImportLegacy}
        />
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
