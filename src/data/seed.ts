import { Exercise, FoodTemplate, Muscle, WorkoutTemplate } from '../types';

export const MUSCLES: Muscle[] = [
  { id: 'chest', name: 'Pectoral', icon: '◖', aestheticPriority: 10, hardRecoveryHours: 72, lightRecoveryHours: 48, targetSets10d: [10, 14] },
  { id: 'shoulder_lateral', name: 'Deltoide lateral', icon: '⬡', aestheticPriority: 10, hardRecoveryHours: 48, lightRecoveryHours: 24, targetSets10d: [14, 20] },
  { id: 'shoulder_rear', name: 'Deltoide posterior', icon: '◒', aestheticPriority: 9, hardRecoveryHours: 48, lightRecoveryHours: 24, targetSets10d: [12, 18] },
  { id: 'shoulder_front', name: 'Deltoide anterior', icon: '◓', aestheticPriority: 4, hardRecoveryHours: 72, lightRecoveryHours: 48, targetSets10d: [2, 6], avoidOverdevelopment: true },
  { id: 'lats', name: 'Dorsal ancho', icon: '🪽', aestheticPriority: 10, hardRecoveryHours: 72, lightRecoveryHours: 48, targetSets10d: [12, 16] },
  { id: 'upper_back', name: 'Espalda alta', icon: '▰', aestheticPriority: 8, hardRecoveryHours: 72, lightRecoveryHours: 48, targetSets10d: [10, 14] },
  { id: 'biceps', name: 'Bíceps/Braquial', icon: '⌁', aestheticPriority: 8, hardRecoveryHours: 48, lightRecoveryHours: 48, targetSets10d: [10, 14] },
  { id: 'triceps', name: 'Tríceps', icon: '⌂', aestheticPriority: 8, hardRecoveryHours: 48, lightRecoveryHours: 48, targetSets10d: [10, 14] },
  { id: 'glutes', name: 'Glúteo', icon: '◠', aestheticPriority: 7, hardRecoveryHours: 72, lightRecoveryHours: 48, targetSets10d: [10, 14] },
  { id: 'hamstrings', name: 'Femoral', icon: '⋒', aestheticPriority: 5, hardRecoveryHours: 72, lightRecoveryHours: 72, targetSets10d: [6, 10] },
  { id: 'quads', name: 'Cuádriceps', icon: '▱', aestheticPriority: 3, hardRecoveryHours: 96, lightRecoveryHours: 72, targetSets10d: [4, 8], avoidOverdevelopment: true },
  { id: 'calves', name: 'Gemelos', icon: '⌇', aestheticPriority: 4, hardRecoveryHours: 48, lightRecoveryHours: 48, targetSets10d: [6, 10] },
  { id: 'core', name: 'Core/Abdomen', icon: '◎', aestheticPriority: 7, hardRecoveryHours: 48, lightRecoveryHours: 48, targetSets10d: [4, 8] },
  { id: 'rotator_cuff', name: 'Manguito rotador', icon: '✺', aestheticPriority: 6, hardRecoveryHours: 24, lightRecoveryHours: 24, targetSets10d: [6, 12] },
  { id: 'serratus', name: 'Serrato', icon: '≋', aestheticPriority: 6, hardRecoveryHours: 24, lightRecoveryHours: 24, targetSets10d: [4, 10] },
  { id: 'traps_upper', name: 'Trapecio superior', icon: '△', aestheticPriority: 2, hardRecoveryHours: 96, lightRecoveryHours: 72, targetSets10d: [0, 4], avoidOverdevelopment: true },
  { id: 'forearms', name: 'Antebrazo', icon: '╳', aestheticPriority: 4, hardRecoveryHours: 48, lightRecoveryHours: 48, targetSets10d: [4, 8] }
];

export const EXERCISES: Exercise[] = [
  {
    id: 'machine-chest-press-neutral', name: 'Press pecho máquina convergente agarre neutro', pattern: 'push_horizontal',
    primary: ['chest'], contributions: { chest: 1, triceps: 0.45, shoulder_front: 0.25 }, defaultSets: 3, repRange: [8, 12], rirTarget: [2, 3],
    risk: { shoulder: 3, elbow: 2 }, cues: ['Escápulas atrás y abajo', 'Codos a 30-45º', 'No bloquees agresivamente arriba'], stopSignals: ['Pérdida de fuerza derecha', 'Pinchazo anterior del hombro'], alternatives: ['low-to-high-cable-fly','pec-deck']
  },
  {
    id: 'incline-machine-press', name: 'Press inclinado máquina / mancuernas bajo ángulo', pattern: 'push_incline',
    primary: ['chest'], contributions: { chest: 0.95, shoulder_front: 0.4, triceps: 0.35 }, defaultSets: 3, repRange: [8, 12], rirTarget: [2, 3],
    risk: { shoulder: 4, elbow: 2 }, cues: ['Banco 15-30º', 'Agarre neutro si existe', 'Rango sin pinzamiento'], stopSignals: ['Hombro se va hacia delante', 'Pérdida de fuerza derecha'], alternatives: ['machine-chest-press-neutral','low-to-high-cable-fly']
  },
  {
    id: 'low-to-high-cable-fly', name: 'Cruce polea bajo → alto', pattern: 'fly', primary: ['chest'], contributions: { chest: 1, shoulder_front: 0.15 }, defaultSets: 3, repRange: [12, 20], rirTarget: [1, 2], risk: { shoulder: 2 }, cues: ['Sube hacia línea clavicular', 'Pecho alto', 'No fuerces estiramiento'], stopSignals: ['Pinchazo anterior'], alternatives: ['pec-deck']
  },
  {
    id: 'pec-deck', name: 'Pec deck suave', pattern: 'fly_machine', primary: ['chest'], contributions: { chest: 1, shoulder_front: 0.2 }, defaultSets: 2, repRange: [12, 20], rirTarget: [2, 3], risk: { shoulder: 3 }, cues: ['Rango cómodo', 'Pausa corta al cerrar', 'Evita estirar de más atrás'], stopSignals: ['Dolor anterior hombro'], alternatives: ['low-to-high-cable-fly']
  },
  {
    id: 'lateral-raise-machine', name: 'Elevación lateral máquina', pattern: 'shoulder_abduction', primary: ['shoulder_lateral'], contributions: { shoulder_lateral: 1, traps_upper: 0.1 }, defaultSets: 4, repRange: [12, 20], rirTarget: [1, 2], risk: { shoulder: 2, neck: 2 }, cues: ['Hombros bajos', 'Sube sin encoger trapecio', 'Controla bajada'], stopSignals: ['Trapecio domina', 'Pinzamiento lateral'], alternatives: ['cable-lateral-raise']
  },
  {
    id: 'cable-lateral-raise', name: 'Elevación lateral polea unilateral', pattern: 'shoulder_abduction', primary: ['shoulder_lateral'], contributions: { shoulder_lateral: 1, traps_upper: 0.1 }, defaultSets: 3, repRange: [15, 25], rirTarget: [1, 2], risk: { shoulder: 2, neck: 2 }, cues: ['Brazo en plano escapular', 'Pulgar neutro o ligeramente arriba', 'Cero balanceo'], stopSignals: ['Pérdida de control', 'Trapecio cargado'], alternatives: ['lateral-raise-machine']
  },
  {
    id: 'pushdown-rope', name: 'Pushdown tríceps cuerda', pattern: 'elbow_extension', primary: ['triceps'], contributions: { triceps: 1, forearms: 0.15 }, defaultSets: 3, repRange: [10, 15], rirTarget: [1, 2], risk: { elbow: 3 }, cues: ['Codos fijos', 'Separar cuerda abajo', 'No balancear torso'], stopSignals: ['Dolor codo >3'], alternatives: ['single-arm-triceps-cable']
  },
  {
    id: 'single-arm-triceps-cable', name: 'Extensión tríceps unilateral en polea', pattern: 'elbow_extension', primary: ['triceps'], contributions: { triceps: 1 }, defaultSets: 2, repRange: [12, 20], rirTarget: [1, 2], risk: { elbow: 2 }, cues: ['Controla muñeca', 'Codo estable', 'Simetría derecha/izquierda'], stopSignals: ['Dolor codo'], alternatives: ['pushdown-rope']
  },
  {
    id: 'serratus-push-up-plus', name: 'Serratus push-up / push-up plus', pattern: 'scapular_protraction', primary: ['serratus'], contributions: { serratus: 1, rotator_cuff: 0.2, chest: 0.15 }, defaultSets: 2, repRange: [12, 15], rirTarget: [3, 5], risk: { shoulder: 1 }, cues: ['Protrae escápulas al final', 'No colapses lumbar', 'Rango limpio'], stopSignals: ['Pinchazo hombro'], alternatives: ['serratus-punch']
  },
  {
    id: 'neutral-lat-pulldown', name: 'Jalón al pecho agarre neutro/semiprono', pattern: 'vertical_pull', primary: ['lats'], contributions: { lats: 1, biceps: 0.45, upper_back: 0.35, shoulder_rear: 0.15 }, defaultSets: 4, repRange: [8, 12], rirTarget: [2, 2], risk: { shoulder: 3, elbow: 2 }, cues: ['Primer gesto: baja escápulas', 'Codos hacia costillas', 'No tires con cuello'], stopSignals: ['Dolor hombro', 'Hormigueo', 'Pérdida de fuerza'], alternatives: ['cable-pullover']
  },
  {
    id: 'supported-machine-row', name: 'Remo máquina pecho apoyado', pattern: 'horizontal_pull', primary: ['upper_back','lats'], contributions: { upper_back: 1, lats: 0.75, biceps: 0.35, shoulder_rear: 0.25 }, defaultSets: 4, repRange: [8, 12], rirTarget: [1, 2], risk: { shoulder: 2, lumbar: 1, elbow: 2 }, cues: ['Pecho pegado', 'Pausa atrás', 'No tires con lumbar'], stopSignals: ['Asimetría derecha clara', 'Dolor codo'], alternatives: ['v-grip-cable-row']
  },
  {
    id: 'v-grip-cable-row', name: 'Remo horizontal agarre V', pattern: 'horizontal_pull', primary: ['upper_back','lats'], contributions: { upper_back: 0.9, lats: 0.65, biceps: 0.35, shoulder_rear: 0.2 }, defaultSets: 3, repRange: [10, 15], rirTarget: [1, 2], risk: { shoulder: 2, lumbar: 2, elbow: 2 }, cues: ['Al ombligo', 'Escápulas controladas', 'Torso quieto'], stopSignals: ['Lumbar toma el control'], alternatives: ['supported-machine-row']
  },
  {
    id: 'cable-pullover', name: 'Pullover polea o máquina', pattern: 'straight_arm_pull', primary: ['lats'], contributions: { lats: 1, serratus: 0.2, triceps: 0.1 }, defaultSets: 3, repRange: [12, 20], rirTarget: [1, 2], risk: { shoulder: 2 }, cues: ['Brazos casi estirados', 'Dorsal, no tríceps', 'Costillas abajo'], stopSignals: ['Pinchazo hombro'], alternatives: ['neutral-lat-pulldown']
  },
  {
    id: 'reverse-pec-deck', name: 'Reverse pec deck', pattern: 'rear_delt_fly', primary: ['shoulder_rear'], contributions: { shoulder_rear: 1, upper_back: 0.35, rotator_cuff: 0.15 }, defaultSets: 4, repRange: [15, 25], rirTarget: [1, 2], risk: { shoulder: 1 }, cues: ['Codos abiertos suaves', 'No eleves trapecio', 'Pausa atrás'], stopSignals: ['Cuello cargado'], alternatives: ['face-pull-rope']
  },
  {
    id: 'face-pull-rope', name: 'Face pull cuerda', pattern: 'scapular_retraction_external_rotation', primary: ['upper_back','rotator_cuff'], contributions: { upper_back: 0.6, shoulder_rear: 0.45, rotator_cuff: 0.5, traps_upper: 0.1 }, defaultSets: 3, repRange: [15, 20], rirTarget: [2, 3], risk: { shoulder: 1, neck: 2 }, cues: ['Tira hacia la cara', 'Rotación externa suave', 'Hombros lejos de orejas'], stopSignals: ['Trapecio domina'], alternatives: ['reverse-pec-deck']
  },
  {
    id: 'preacher-curl', name: 'Curl bíceps máquina/predicador', pattern: 'elbow_flexion', primary: ['biceps'], contributions: { biceps: 1, forearms: 0.2 }, defaultSets: 3, repRange: [8, 12], rirTarget: [1, 2], risk: { elbow: 3 }, cues: ['Sin rebote abajo', 'Muñeca neutra', 'Control total'], stopSignals: ['Dolor codo'], alternatives: ['hammer-curl']
  },
  {
    id: 'hammer-curl', name: 'Curl martillo cuerda o mancuerna', pattern: 'elbow_flexion_neutral', primary: ['biceps','forearms'], contributions: { biceps: 0.75, forearms: 0.55 }, defaultSets: 3, repRange: [10, 15], rirTarget: [1, 2], risk: { elbow: 2 }, cues: ['Agarre neutro', 'Codo quieto', 'No balancear'], stopSignals: ['Dolor codo'], alternatives: ['preacher-curl']
  },
  {
    id: 'kickback-machine-cable', name: 'Kickback máquina o polea', pattern: 'hip_extension', primary: ['glutes'], contributions: { glutes: 1, hamstrings: 0.2 }, defaultSets: 4, repRange: [12, 20], rirTarget: [1, 2], risk: { lumbar: 1 }, cues: ['Pelvis estable', 'No arquees lumbar', 'Aprieta glúteo arriba'], stopSignals: ['Lumbar domina'], alternatives: ['bulgarian-split-squat-glute']
  },
  {
    id: 'bulgarian-split-squat-glute', name: 'Búlgara inclinada a glúteo', pattern: 'single_leg_squat', primary: ['glutes','quads'], contributions: { glutes: 0.9, quads: 0.55, hamstrings: 0.2 }, defaultSets: 3, repRange: [8, 12], rirTarget: [2, 2], risk: { lumbar: 2 }, cues: ['Tronco ligeramente inclinado', 'Zancada larga', 'Empuja desde talón'], stopSignals: ['Rodilla/lumbar molesta'], alternatives: ['kickback-machine-cable']
  },
  {
    id: 'leg-curl', name: 'Curl femoral sentado o tumbado', pattern: 'knee_flexion', primary: ['hamstrings'], contributions: { hamstrings: 1 }, defaultSets: 4, repRange: [10, 15], rirTarget: [1, 2], risk: {}, cues: ['Pausa contraído', 'Bajada lenta', 'No levantes cadera'], stopSignals: ['Calambre raro'], alternatives: []
  },
  {
    id: 'cable-pull-through', name: 'Cable pull-through', pattern: 'hip_hinge', primary: ['glutes','hamstrings'], contributions: { glutes: 0.85, hamstrings: 0.45 }, defaultSets: 3, repRange: [12, 15], rirTarget: [2, 2], risk: { lumbar: 3 }, cues: ['Bisagra de cadera', 'Costillas abajo', 'No hiperextiendas lumbar'], stopSignals: ['Lumbar >3'], alternatives: ['kickback-machine-cable']
  },
  {
    id: 'leg-press-moderate', name: 'Prensa 45º moderada', pattern: 'leg_press', primary: ['quads','glutes'], contributions: { quads: 0.8, glutes: 0.45, hamstrings: 0.15 }, defaultSets: 3, repRange: [10, 15], rirTarget: [3, 3], risk: { lumbar: 2 }, cues: ['No convertir en batalla', 'Rango controlado', 'No bloquear rodillas'], stopSignals: ['Drenaje excesivo', 'Lumbar'], alternatives: ['bulgarian-split-squat-glute']
  },
  {
    id: 'abduction-machine', name: 'Abducción máquina', pattern: 'hip_abduction', primary: ['glutes'], contributions: { glutes: 0.75 }, defaultSets: 3, repRange: [15, 25], rirTarget: [1, 2], risk: { lumbar: 1 }, cues: ['Tronco algo inclinado', 'Pausa abierta', 'Controla vuelta'], stopSignals: ['Lumbar se carga'], alternatives: ['kickback-machine-cable']
  },
  {
    id: 'standing-calf-raise', name: 'Gemelo de pie/prensa', pattern: 'plantar_flexion', primary: ['calves'], contributions: { calves: 1 }, defaultSets: 4, repRange: [8, 15], rirTarget: [0, 2], risk: {}, cues: ['Pausa abajo', 'Pausa arriba', 'Recorrido largo'], stopSignals: ['Dolor tendón'], alternatives: []
  },
  {
    id: 'cable-crunch', name: 'Crunch polea o máquina', pattern: 'spinal_flexion', primary: ['core'], contributions: { core: 1 }, defaultSets: 3, repRange: [10, 15], rirTarget: [1, 2], risk: { lumbar: 1 }, cues: ['Costillas hacia pelvis', 'No tires con brazos', 'Control'], stopSignals: ['Lumbar'], alternatives: []
  },
  {
    id: 'cable-y-raise', name: 'Cable Y-raise / trapecio bajo', pattern: 'scapular_upward_rotation', primary: ['rotator_cuff','serratus'], contributions: { rotator_cuff: 0.55, serratus: 0.35, shoulder_rear: 0.25, traps_upper: 0.1 }, defaultSets: 3, repRange: [12, 20], rirTarget: [3, 4], risk: { shoulder: 2, neck: 2 }, cues: ['Ligero', 'Hombros bajos', 'Control escapular'], stopSignals: ['Cuello/trapecio toma el control'], alternatives: ['wall-slides']
  },
  {
    id: 'external-rotation-band', name: 'Rotación externa banda/cable', pattern: 'external_rotation', primary: ['rotator_cuff'], contributions: { rotator_cuff: 1 }, defaultSets: 2, repRange: [15, 20], rirTarget: [4, 5], risk: { shoulder: 1 }, cues: ['Codo pegado', 'Carga ridículamente manejable', 'Sin dolor'], stopSignals: ['Pinchazo'], alternatives: []
  },
  {
    id: 'wall-slides', name: 'Wall slides', pattern: 'mobility', primary: ['serratus','rotator_cuff'], contributions: { serratus: 0.6, rotator_cuff: 0.4 }, defaultSets: 2, repRange: [10, 12], rirTarget: [4, 5], risk: { shoulder: 1 }, cues: ['Costillas abajo', 'Escápulas controladas', 'Sin dolor'], stopSignals: ['Pinchazo'], alternatives: []
  },
  {
    id: 'serratus-punch', name: 'Serratus punch banda/polea', pattern: 'scapular_protraction', primary: ['serratus'], contributions: { serratus: 1, rotator_cuff: 0.15 }, defaultSets: 2, repRange: [12, 15], rirTarget: [4, 5], risk: { shoulder: 1 }, cues: ['Alcanza sin encoger hombro', 'Movimiento de escápula', 'Ligero'], stopSignals: ['Dolor'], alternatives: ['serratus-push-up-plus']
  }
];

export const TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'A_PUSH', title: 'A · Push Estético Seguro', short: 'Pecho + lateral + tríceps', purpose: 'Construir pecho sin irritar hombro y sumar anchura visual con deltoide lateral.', estMinutes: [65, 85], focus: ['chest','shoulder_lateral','triceps','serratus'],
    exercises: [
      { exerciseId: 'machine-chest-press-neutral' }, { exerciseId: 'incline-machine-press' }, { exerciseId: 'low-to-high-cable-fly' }, { exerciseId: 'lateral-raise-machine' }, { exerciseId: 'cable-lateral-raise', sets: 2 }, { exerciseId: 'pushdown-rope' }, { exerciseId: 'single-arm-triceps-cable' }, { exerciseId: 'serratus-push-up-plus' }
    ]
  },
  {
    id: 'B_PULL', title: 'B · Pull Estético', short: 'Dorsal + espalda + posterior + bíceps', purpose: 'V-taper, espalda alta, postura y brazos sin dominadas libres.', estMinutes: [70, 90], focus: ['lats','upper_back','shoulder_rear','biceps'],
    exercises: [
      { exerciseId: 'neutral-lat-pulldown' }, { exerciseId: 'supported-machine-row' }, { exerciseId: 'v-grip-cable-row' }, { exerciseId: 'cable-pullover' }, { exerciseId: 'reverse-pec-deck' }, { exerciseId: 'face-pull-rope' }, { exerciseId: 'preacher-curl' }, { exerciseId: 'hammer-curl' }
    ]
  },
  {
    id: 'C_GLUTE_LOWER', title: 'C · Glúteo/Femoral + pierna mantenimiento', short: 'Glúteo sin lumbar', purpose: 'Mejorar glúteo y femoral sin drenar en exceso piernas ni lumbar.', estMinutes: [60, 80], focus: ['glutes','hamstrings','quads','calves','core'],
    exercises: [
      { exerciseId: 'kickback-machine-cable' }, { exerciseId: 'bulgarian-split-squat-glute' }, { exerciseId: 'leg-curl' }, { exerciseId: 'cable-pull-through' }, { exerciseId: 'leg-press-moderate' }, { exerciseId: 'abduction-machine' }, { exerciseId: 'standing-calf-raise' }, { exerciseId: 'cable-crunch' }
    ]
  },
  {
    id: 'D_MICRO', title: 'D · Micro Estético', short: 'Hombro + brazos + rehab', purpose: 'Subir rangos de deltoides y brazos con coste sistémico bajo.', estMinutes: [40, 60], focus: ['shoulder_lateral','shoulder_rear','biceps','triceps','rotator_cuff'],
    exercises: [
      { exerciseId: 'cable-lateral-raise' }, { exerciseId: 'lateral-raise-machine' }, { exerciseId: 'reverse-pec-deck' }, { exerciseId: 'cable-y-raise' }, { exerciseId: 'preacher-curl' }, { exerciseId: 'hammer-curl', sets: 2 }, { exerciseId: 'pushdown-rope' }, { exerciseId: 'single-arm-triceps-cable' }, { exerciseId: 'external-rotation-band' }
    ]
  },
  {
    id: 'E_RECOVERY', title: 'E · Recuperación Activa', short: 'Hombro + escápula + movilidad', purpose: 'Proteger hombro, cuello, escápula y sostener el hábito sin fatigar.', estMinutes: [25, 35], focus: ['rotator_cuff','serratus','upper_back'],
    exercises: [
      { exerciseId: 'wall-slides' }, { exerciseId: 'serratus-punch' }, { exerciseId: 'external-rotation-band' }, { exerciseId: 'face-pull-rope', sets: 2 }, { exerciseId: 'cable-y-raise', sets: 2 }
    ]
  }
];

export const BLOCKED_EXERCISES = [
  'Press militar', 'Fondos', 'Dominadas libres', 'Press banca plano con barra', 'Jalón tras nuca', 'Upright row / remo al mentón', 'Hip thrust barra'
];

export const FOOD_TEMPLATES: FoodTemplate[] = [
  { id: 'chicken-potatoes', name: '1/4 pollo + patatas', protein: 55, caloriesMin: 650, caloriesMax: 900, tags: ['furgo', 'comida real', 'alta proteína'] },
  { id: 'whey-50', name: 'Batido whey 50 g proteína', protein: 50, caloriesMin: 220, caloriesMax: 320, tags: ['post-entreno', 'rápido'] },
  { id: 'protein-yogurt', name: 'Yogur proteico', protein: 20, caloriesMin: 120, caloriesMax: 220, tags: ['snack'] },
  { id: 'poke', name: 'Poke alto en proteína', protein: 45, caloriesMin: 550, caloriesMax: 850, tags: ['comida completa'] },
  { id: 'eggs', name: 'Tortilla 3-4 huevos', protein: 30, caloriesMin: 320, caloriesMax: 520, tags: ['cena'] },
  { id: 'tuna-bread', name: 'Latas pescado + pan/arroz', protein: 40, caloriesMin: 380, caloriesMax: 650, tags: ['furgo', 'barato'] },
  { id: 'quark', name: 'Queso fresco batido / skyr', protein: 35, caloriesMin: 220, caloriesMax: 450, tags: ['noche', 'alto proteína'] }
];
