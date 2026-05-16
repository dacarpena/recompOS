import { useEffect, useMemo, useState } from 'react';
import { Activity, Apple, BarChart3, CalendarDays, CheckCircle2, Circle, Download, Dumbbell, Gauge, Map, ShieldCheck, Trophy, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppData, BodyMetric, DailyCheckin, MealLog, SessionType, WorkoutSession } from './types';
import { addMeal, addMetric, addSession, exportData, getLegacyKey, importDataFile, keyForUser, loadData, readLegacyData, readOnboardingCompleted, saveData, saveOnboardingCompleted, upsertCheckin } from './lib/storage';
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
import { Onboarding } from './components/Onboarding';

type Tab = 'today' | 'train' | 'overload' | 'atlas' | 'nutrition' | 'progress' | 'campaign' | 'plan';

const NAV_TABS: Tab[] = ['today', 'train', 'overload', 'atlas', 'nutrition', 'progress', 'campaign', 'plan'];

const TAB_META: Record<Tab, { label: string; cta: string; description: string; icon: LucideIcon }> = {
  today: { label: 'Hoy', cta: 'Guardar check-in', description: 'Decisión diaria', icon: Gauge },
  train: { label: 'Entrenar', cta: 'Continuar entrenamiento', description: 'Logger de sesión', icon: Dumbbell },
  overload: { label: 'Sobrecarga', cta: 'Aplicar recomendación', description: 'Progresión', icon: Activity },
  atlas: { label: 'Atlas', cta: 'Explorar atlas', description: 'Músculos y rangos', icon: Map },
  nutrition: { label: 'Nutrición', cta: 'Registrar comida', description: 'Proteína y hábitos', icon: Apple },
  progress: { label: 'Progreso', cta: 'Registrar progreso', description: 'Métricas y PRs', icon: BarChart3 },
  campaign: { label: 'Campaña', cta: 'Ver misiones', description: 'Objetivos', icon: Trophy },
  plan: { label: 'Plan', cta: 'Revisar plan', description: 'Estructura A/B/C', icon: CalendarDays }
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>('today');
  const [initialWorkout, setInitialWorkout] = useState<SessionType>('A_PUSH');
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);

  useEffect(() => {
    if (!user) {
      setData(null);
      setTab('today');
      setOnboardingCompleted(true);
      return;
    }
    setData(loadData(user.id));
    setOnboardingCompleted(readOnboardingCompleted(user.id));
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

  function handleCompleteOnboarding() {
    if (!user) return;
    saveOnboardingCompleted(user.id, true);
    setOnboardingCompleted(true);
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
        <button className="brand" type="button" onClick={() => goToTab('today')} aria-label="Ir al panel de hoy">
          <span className="logo"><ShieldCheck size={21} strokeWidth={2.4} /></span>
          <span><strong>RecompOS</strong><small>Physique operating system</small></span>
        </button>
        <div className="navStack">
          <nav className="topNav" aria-label="Navegación principal">
            {NAV_TABS.map((navTab) => {
              const Icon = TAB_META[navTab].icon;
              return (
                <button key={navTab} className={tab === navTab ? 'active' : ''} onClick={() => goToTab(navTab)}>
                  <Icon size={18} strokeWidth={2.25} />
                  <span>{TAB_META[navTab].label}</span>
                </button>
              );
            })}
          </nav>
          <div className="contextLine">
            <span>{activeMeta.description}</span>
            <strong>{activeMeta.label}</strong>
          </div>
        </div>
        <div className="headerActions">
          <button className="iconTextButton" aria-label="Exportar datos" onClick={() => exportData(user.id, data)}><Download size={16} /> <span>Exportar</span></button>
          <label className="importButton iconTextButton" aria-label="Importar datos"><Upload size={16} /> <span>Importar</span><input type="file" accept="application/json" onChange={(e) => importFile(e.target.files?.[0])} /></label>
        </div>
      </header>
      <main className="appMain">
        <Auth
          currentUser={user}
          onSignUp={() => undefined}
          onSignIn={() => undefined}
          onSignOut={handleSignOut}
          canImportLegacy={canImportLegacy}
          onImportLegacy={handleImportLegacy}
        />
        <section className="card guidePanel">
          <Onboarding completed={onboardingCompleted} onComplete={handleCompleteOnboarding} />
          <div className="guideLayout">
            {firstSession ? (
              <div className="guideChecklist">
                <h3>Tu primera sesión guiada</h3>
                <div className="list">
                  {onboardingChecklist.map((item) => (
                    <button key={item.id} className="listItem checklistItem" onClick={() => goToTab(item.tab)}>
                      <span className={`checkState ${item.done ? 'done' : ''}`}>
                        {item.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        <strong>{item.label}</strong>
                      </span>
                      <span>{item.done ? 'Completado' : 'Ir ahora'}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p>Checklist inicial completado. Mantén consistencia y sigue el siguiente paso recomendado.</p>
            )}
            <div className="nextStepBanner">
              <span className="pill pill-purple">Siguiente paso recomendado</span>
              <strong>{nextStep ? nextStep.label : 'Explorar Progreso para revisar avances'}</strong>
              <button className="primaryButton" onClick={() => goToTab(nextStep ? nextStep.tab : 'progress')}>
                {nextStep ? `Ir a ${TAB_META[nextStep.tab].label}` : activeMeta.cta}
              </button>
            </div>
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
