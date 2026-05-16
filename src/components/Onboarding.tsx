import { Card, Pill } from './UI';

type OnboardingStep = { id: string; title: string; detail: string; tabHint: string };

const STEPS: OnboardingStep[] = [
  { id: '1', title: 'Completa el check-in', detail: 'Registra sueño, energía y estado articular para que el motor estime Readiness real.', tabHint: 'Hoy' },
  { id: '2', title: 'Revisa la recomendación', detail: 'Abre la sesión sugerida; viene filtrada por recuperación muscular, dolor y bloqueos.', tabHint: 'Hoy → Empezar' },
  { id: '3', title: 'Loguea series útiles', detail: 'Registra peso, reps, RIR, técnica y ROM en cada set para medir volumen útil.', tabHint: 'Entrenar' },
  { id: '4', title: 'Registra nutrición mínima', detail: 'Añade al menos una comida para que el score nutricional y proteína diaria sean accionables.', tabHint: 'Nutrición' },
  { id: '5', title: 'Cierra el bucle', detail: 'Revisa progreso y repite mañana con microajustes en carga, descanso o ejecución.', tabHint: 'Progreso' }
];

export function Onboarding({ completed, onComplete }: { completed: boolean; onComplete: () => void }) {
  if (completed) return null;
  return (
    <Card>
      <div className="row between wrap gap">
        <div>
          <h3>Tour inicial (2 min)</h3>
          <p className="muted">Sigue estos pasos una vez para entender qué medir y cómo decidir cada sesión.</p>
        </div>
        <button className="secondaryButton" onClick={onComplete}>Marcar onboarding como completado</button>
      </div>
      <div className="list">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="listItem">
            <div>
              <strong>{idx + 1}. {step.title}</strong>
              <span>{step.detail}</span>
            </div>
            <Pill tone="blue">{step.tabHint}</Pill>
          </div>
        ))}
      </div>
    </Card>
  );
}
