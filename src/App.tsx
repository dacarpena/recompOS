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

const PRIMARY_TABS: Tab[] = ['today', 'train', 'progress'];
const SECONDARY_TABS: Tab[] = ['nutrition', 'atlas', 'overload', 'campaign', 'plan'];

const TAB_META: Record<Tab, { label: string; cta: string }> = {
  today: { label: 'Hoy', cta: 'Guardar check-in' },
  train: { label: 'Entrenar', cta: 'Continuar entrenamiento' },
  progress: { label: 'Progreso', cta: 'Registrar progreso' },
  nutrition: { label: 'Nutrición', cta: 'Registrar comida' },
  atlas: { label: 'Atlas', cta: 'Explorar atlas' },
  overload: { label: 'Sobrecarga', cta: 'Aplicar recomendación' },
  campaign: { label: 'Campaña', cta: 'Ver misiones' },
  plan: { label: 'Plan', cta: 'Revisar plan' }
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>('today');
  const [moreOpen, setMoreOpen] = useState(false);
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

  const onboardingChecklist = useMemo(() => {
    if (!data) return [];
    return [
      { id: 'checkin', label: 'Completar check-in', done: data.checkins.length > 0, tab: 'today' as Tab },
      { id: 'series', label: 'Registrar primera serie', done: data.sessions.some((s) => s.sets.length > 0), tab: 'train' as Tab },
      { id: 'meal', label: 'Registrar comida', done: data.meals.length > 0, tab: 'nutrition' as Tab }
    ];
  }, [data]);

  const firstSession = onboardingChecklist.some((item) => !item.done);
  const nextStep = onboardingChecklist.find((item) => !item.done);
  const activeMeta = TAB_META[tab];

  function goToTab(next: Tab) {
    setTab(next);
    setMoreOpen(false);
  }

  function handleSaveCheckin(checkin: DailyCheckin) { setData((d) => (d ? upsertCheckin(d, checkin) : d)); }
  function handleSaveSession(session: WorkoutSession) { setData((d) => (d ? addSession(d, session) : d)); goToTab('atlas'); }
  function handleAddMeal(meal: MealLog) { setData((d) => (d ? addMeal(d, meal) : d)); }
  function handleAddMetric(metric: BodyMetric) { setData((d) => (d ? addMetric(d, metric) : d)); }
  function startSession(type: string) { setInitialWorkout(type as SessionType); goToTab('train'); }

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
        <div className="brand" onClick={() => goToTab('today')}>
          <span className="logo">◆</span>
          <div><strong>RecompOS</strong><small>Data-driven physique RPG</small></div>
        </div>
        <div className="navStack">
          <nav className="topNav" aria-label="Navegación principal">
            {PRIMARY_TABS.map((primaryTab) => (
              <button key={primaryTab} className={tab === primaryTab ? 'active' : ''} onClick={() => goToTab(primaryTab)}>{TAB_META[primaryTab].label}</button>
            ))}
            <div className="moreMenu">
              <button className={SECONDARY_TABS.includes(tab) ? 'active' : ''} onClick={() => setMoreOpen((open) => !open)}>Más</button>
              {moreOpen && (
                <div className="moreDropdown">
                  {SECONDARY_TABS.map((secondaryTab) => (
                    <button key={secondaryTab} className={tab === secondaryTab ? 'active' : ''} onClick={() => goToTab(secondaryTab)}>{TAB_META[secondaryTab].label}</button>
                  ))}
                </div>
              )}
            </div>
          </nav>
          <div className="contextLine">
            <span className="muted">Inicio / {SECONDARY_TABS.includes(tab) ? 'Más / ' : ''}{activeMeta.label}</span>
            <strong>{activeMeta.label}</strong>
          </div>
        </div>
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
        <section className="card guidePanel">
          {firstSession ? (
            <>
              <h3>Tu primera sesión guiada</h3>
              <div className="list">
                {onboardingChecklist.map((item) => (
                  <button key={item.id} className="listItem checklistItem" onClick={() => goToTab(item.tab)}>
                    <strong>{item.done ? '✅' : '⬜'} {item.label}</strong>
                    <span>{item.done ? 'Completado' : 'Ir ahora'}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>Checklist inicial completado. Mantén consistencia y sigue el siguiente paso recomendado.</p>
          )}
          <div className="nextStepBanner">
            <span className="pill pill-purple">Siguiente paso recomendado</span>
            <strong>{nextStep ? nextStep.label : 'Explorar Progreso para revisar avances'}</strong>
            <button className="primaryButton" onClick={() => goToTab(nextStep ? nextStep.tab : 'progress')}>{activeMeta.cta}</button>
          </div>
        </section>
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
