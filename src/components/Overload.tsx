import { AppData, ExerciseOverloadState, MuscleOverloadState, OverloadAction } from '../types';
import { overloadDashboard } from '../lib/engines';
import { Card, Meter, Pill, SectionHeader, Stat, TrafficDot } from './UI';

const actionTone: Record<OverloadAction, 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'default'> = {
  increase_load: 'green',
  increase_reps: 'purple',
  hold: 'blue',
  rebuild_quality: 'yellow',
  reduce_load: 'yellow',
  add_set: 'green',
  deload: 'red',
  skip: 'red'
};

const modeTone: Record<string, 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'default'> = {
  push: 'green',
  build: 'purple',
  hold: 'blue',
  deload: 'yellow',
  recover: 'red'
};

export function Overload({ data }: { data: AppData }) {
  const dashboard = overloadDashboard(data);
  const priorityMuscles = dashboard.muscleStates.slice(0, 8);

  return (
    <div className="screenGrid">
      <SectionHeader
        eyebrow="Progressive Overload Engine"
        title="Sobrecarga progresiva guiada"
        body="La app decide si conviene subir carga, sumar reps, añadir series, consolidar técnica o descargar. El objetivo es progresar donde toca, sin pagar con hombro, codo o lumbar."
      />

      <div className="grid three">
        <Card>
          <Stat label="Modo global" value={dashboard.globalMode.toUpperCase()} hint={dashboard.headline} />
          <Pill tone={modeTone[dashboard.globalMode]}>estrategia activa</Pill>
        </Card>
        <Card>
          <Stat label="Readiness" value={`${dashboard.globalScore}/100`} hint="sueño, energía, HRV, dolor y hombro" />
          <Meter value={dashboard.globalScore} />
        </Card>
        <Card>
          <Stat label="Acciones candidatas" value={dashboard.nextBestActions.length} hint="ordenadas por retorno/seguridad" />
          <p className="muted">Prioriza las primeras si encajan con la sesión recomendada.</p>
        </Card>
      </div>

      <Card>
        <h3>Próximas acciones de sobrecarga</h3>
        <div className="overloadActionGrid">
          {dashboard.nextBestActions.map((state) => <ExerciseActionCard key={state.exerciseId} state={state} />)}
        </div>
      </Card>

      <div className="grid two">
        <Card>
          <h3>Músculos que piden estímulo</h3>
          <div className="list">
            {priorityMuscles.map((state) => <MuscleDirective key={state.muscleId} state={state} />)}
          </div>
        </Card>
        <Card>
          <h3>Reglas de progresión</h3>
          <div className="ruleStack">
            {dashboard.rules.map((rule, index) => <div className="ruleItem" key={rule}><b>{index + 1}</b><span>{rule}</span></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ExerciseActionCard({ state }: { state: ExerciseOverloadState }) {
  return (
    <div className="overloadActionCard">
      <div className="row between gap">
        <div>
          <span className="eyebrow">{state.confidence} confianza</span>
          <h3>{state.exerciseName}</h3>
        </div>
        <TrafficDot status={state.readiness} />
      </div>
      <div className="row wrap">
        <Pill tone={actionTone[state.action]}>{state.actionLabel}</Pill>
        {state.lastBestSet && <Pill tone="blue">último mejor {state.lastBestSet}</Pill>}
      </div>
      <div className="overloadNumbers">
        <span><b>{state.recommendedWeight}</b><small>kg</small></span>
        <span><b>{state.recommendedReps}</b><small>reps objetivo</small></span>
        <span><b>{state.recommendedSets}</b><small>series</small></span>
        <span><b>{state.targetRir[0]}-{state.targetRir[1]}</b><small>RIR</small></span>
      </div>
      <div className="reasonList">
        {state.reasons.slice(0, 2).map((reason) => <span key={reason}>• {reason}</span>)}
        {state.projectedNextMilestone && <span>• {state.projectedNextMilestone}</span>}
      </div>
      {state.warnings.length ? <div className="chips">{state.warnings.map((w) => <Pill key={w} tone="red">{w}</Pill>)}</div> : null}
    </div>
  );
}

function MuscleDirective({ state }: { state: MuscleOverloadState }) {
  const tone = state.recommendedStimulus === 'hard' ? 'green' : state.recommendedStimulus === 'light' ? 'purple' : state.recommendedStimulus === 'recover' ? 'red' : 'blue';
  return (
    <div className="listItem overloadMuscleItem">
      <div>
        <strong>{state.muscleName}</strong>
        <span>{state.currentSets10d}/{state.targetSets10d[0]}-{state.targetSets10d[1]} series útiles · prioridad {state.priority}/10</span>
        <small>{state.overloadDirective}</small>
      </div>
      <div className="row wrap">
        <TrafficDot status={state.readiness} />
        <Pill tone={tone}>{state.recommendedStimulus}</Pill>
        {state.limitingFactor && <Pill tone="yellow">{state.limitingFactor}</Pill>}
      </div>
    </div>
  );
}
