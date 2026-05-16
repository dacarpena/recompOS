# RecompOS Web

App web local-first para entrenamiento, nutrición, recuperación, gamificación muscular y recomposición estética.

Diseñada para el caso de Dani:

- recomposición corporal estética;
- prioridad: pecho, hombros, espalda, brazos, cintura y glúteo;
- sistema rotativo A/B/C/D/E, no calendario semanal rígido;
- lesión/limitación de hombro derecho con Shoulder Guardian;
- nutrición práctica para vida en furgo;
- rangos musculares gamificados: Hierro, Bronce, Plata, Oro, Platino, Diamante, Ónix;
- proyecciones realistas por tendencia registrada;
- Progressive Overload Engine para decidir cuándo subir carga, reps, series, consolidar técnica o descargar.

## Stack

- React + TypeScript + Vite
- CSS propio, sin Tailwind obligatorio
- LocalStorage local-first
- Deploy estático en Cloudflare Pages

## Instalar

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Genera `dist/`.

## Despliegue Cloudflare Pages

Opción A, desde dashboard:

- Build command: `npm run build`
- Build output directory: `dist`

Opción B, Wrangler:

```bash
npm run build
npx wrangler pages deploy dist --project-name recomp-os
```

También puedes usar:

```bash
npm run deploy:pages
```

## Persistencia

La versión MVP guarda los datos en `localStorage`. Incluye botones de exportar/importar JSON para backups.

Siguiente paso recomendado si quieres multi-dispositivo:

- Cloudflare D1 para datos estructurados.
- Cloudflare R2 para fotos de progreso.
- Cloudflare Access o Clerk/Auth.js para autenticación.
- Worker API con Hono o routing propio.

## Arquitectura

```text
src/
├── App.tsx
├── main.tsx
├── styles.css
├── types.ts
├── components/
│   ├── Today.tsx
│   ├── Workout.tsx
│   ├── Overload.tsx
│   ├── Atlas.tsx
│   ├── Nutrition.tsx
│   ├── Progress.tsx
│   ├── Campaign.tsx
│   ├── Plan.tsx
│   └── UI.tsx
├── data/
│   └── seed.ts
└── lib/
    ├── engines.ts
    ├── storage.ts
    └── format.ts
```

## Motores implementados

- `RecommendationEngine`: recomienda la siguiente sesión.
- `MuscleClockEngine`: calcula estado verde/amarillo/rojo de cada músculo.
- `VolumeEngine`: calcula series útiles, XP y carga útil por músculo.
- `MuscleRankEngine`: asigna rangos por músculo.
- `ProjectionEngine`: genera proyecciones iniciales.
- `ProgressiveOverloadEngine`: calcula la próxima acción por ejercicio y por músculo, integrando doble progresión, dolor, RIR, técnica, ROM, volumen móvil y recuperación.
- `NutritionEngine`: controla proteína, creatina y score diario.
- `CampaignEngine`: genera misiones útiles.

## Progressive Overload Engine

La pestaña `Sobrecarga` añade una capa de decisión específica para progresar sin improvisar:

- `Subir carga`: solo si se completa el techo de reps con RIR objetivo, técnica limpia, ROM limpio y dolor bajo.
- `Sumar reps`: mantiene peso y busca micro-PRs cuando todavía no toca subir carga.
- `Añadir serie`: se activa si el músculo prioritario va bajo de volumen en la ventana móvil de 10 días.
- `Consolidar`: mantiene carga si el músculo está amarillo o el estímulo todavía no es estable.
- `Reconstruir técnica`: baja carga si técnica o ROM caen.
- `Bajar carga` / `Descargar`: se activa ante dolor, pérdida de fuerza derecha o recuperación roja.
- `Saltar hoy`: bloquea ejercicios no compatibles con el estado articular.

Cada ejercicio devuelve peso recomendado, reps objetivo, series, RIR, confianza, razones, warnings y próximo milestone. La pantalla `Entrenar` usa esas recomendaciones automáticamente en el logger.

## Limitaciones MVP

- No integra todavía HealthKit/Garmin.
- No tiene backend ni multi-dispositivo.
- Las proyecciones son heurísticas iniciales y se vuelven útiles con más datos.
- Las fórmulas de ranking están diseñadas para motivación y decisión práctica, no como medición clínica.

## Próximas mejoras

1. PWA instalable.
2. Fotos privadas con comparación.
3. Cloudflare D1 + R2.
4. Importación CSV de Garmin.
5. Algoritmo más fino por ejercicio y simetría derecha/izquierda.
6. Modo coach AI para revisión de ciclos.

## Sistema de diseño y composición (UI)

Para mantener consistencia visual y velocidad de desarrollo:

- Tokens base en `src/styles/tokens.css` (espaciados, radios, tipografía, elevaciones y estados semánticos).
- Componentes base en `src/components/UI.tsx`:
  - `Button` con variantes `primary`, `secondary`, `ghost`, `danger`.
  - `Input` para campos estándar.
  - `Card` para contenedores.
  - `Badge` para etiquetas de estado/contexto.
  - `EmptyState` para bloques sin datos.

### Reglas de composición

Usar estos bloques como patrón antes de crear excepciones:

1. `sectionBlock`
   - Contiene: `SectionHeader` + contenido.
2. `actionBlock`
   - Fila de acciones primarias/secundarias (CTA principal + soporte).
3. `emptyBlock`
   - Presenta `EmptyState` cuando no hay datos.
4. `listBlock`
   - Lista vertical homogénea de items (`list`, `listItem`).

### Convención de variantes

Evitar estilos ad-hoc en JSX. Preferir:

- `btn btn-primary`
- `btn btn-secondary`
- `btn btn-ghost`
- `btn btn-danger`

Si aparece un nuevo caso visual, primero evaluar si encaja en una variante existente; si no, ampliar tokens y variante de forma explícita.
