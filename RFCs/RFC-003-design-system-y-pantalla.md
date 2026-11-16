# RFC-003 · Design system y pantalla de inicio

| | |
| --- | --- |
| **Estado** | Pendiente |
| **Features** | F11 (pantalla). La parte visual de F2, F3, F7, F8, F12, F13, F14, F15 y F16 |
| **Predecesores** | RFC-001 y RFC-002. Además necesita `VISUAL.md` |
| **Sucesores** | RFC-004 y RFC-005 |
| **Complejidad** | Media |

## Resumen

Construye todo lo que se ve: el tema, el design system (con el orbe), la pantalla de inicio
con el resumen de hoy sobre los datos reales, y las tarjetas que va a usar el turno de voz.
Al terminar, la app abre en la pantalla real y muestra el campo. El orbe se ve y cambia de
estado, pero todavía no escucha: eso lo conecta el RFC-004.

## Antes de empezar

- **`VISUAL.md`.** De ahí salen los valores del tema y cómo se ve cada pieza. Tiene que traer:
  1. Los colores de los dos temas, con el uso de cada uno.
  2. La tipografía: familia, paquete del que salen los archivos, pesos, y el tamaño y el alto
     de renglón de cada variante de texto.
  3. Las escalas de espaciado, radios y sombras, y las duraciones de las animaciones.
  4. El orbe: los colores de cada estado y cómo se mueve en cada uno.
  5. La tarjeta: cómo se ve cada bloque (encabezado, número, renglones, ruta, botones).
  6. La pantalla: cómo se reparte el espacio entre el resumen, las tarjetas y la zona de voz,
     qué pasa cuando hay más de una tarjeta, y dónde va el contador de audios guardados.
  7. El resumen de hoy: qué forma tiene cada dato.

Si a `VISUAL.md` le falta algo de esa lista, se pregunta: no se inventa un valor.

## Enfoque técnico

### 1. Tema

`shared/presentation/theme` centraliza todo valor visual (R24). Ningún componente escribe a
mano un color, un tamaño de letra, un espaciado o un radio.

```ts
export enum ThemeMode { Light = 'light', Dark = 'dark' }

export type Theme = {
  mode: ThemeMode;
  colors: {
    background: string; surface: string; surfaceSoft: string; hairline: string;
    text: string; textMuted: string; brand: string; onBrand: string; warning: string; danger: string;
  };
  typography: {
    family: string;
    variants: Record<TextVariant, { size: number; lineHeight?: number; weight: string; letterSpacing?: number; italic?: boolean; tabular?: boolean; uppercase?: boolean }>;
  };
  spacing: Record<string, number>;
  radii: Record<string, number>;
  shadows: Record<string, string>;
  durations: Record<string, number>;
  touch: { minimum: number; button: number; primary: number };   // primary: 64 o más
  tones: Record<Tone, [string, string, string]>;   // el degradé de cada tono
  orb: Record<OrbState, OrbPalette>;
};
```

- Los valores y los nombres de cada paso de `spacing`, `radii`, `shadows` y `durations` salen
  de `VISUAL.md`.
- Hay un tema claro y uno oscuro, los dos completos.
- `ThemeProvider` vive en `shared/presentation/states` y recibe el modo por la prop `mode`. En
  este RFC `App.tsx` le pasa `ThemeMode.Light`; el RFC-005 lo conecta al sensor de luz.
- `useTheme()` y `useStyles(createStyles)` viven en `shared/presentation/hooks`.
- La tipografía se declara una sola vez, en el plugin de `expo-font` de `app.json`, como una
  familia con un archivo por peso. Cambiarla obliga a correr `npx expo prebuild`.
- El tema importa `OrbState` para sus claves; el orbe importa del tema solo tipos.

### 2. Design system

En `shared/presentation/components`, cada pieza en su carpeta (R19). Son presentacionales:
reciben datos y avisan con funciones (R20). No conocen el dominio (R25).

```ts
// Las variantes de la sección 4.2 de VISUAL.md, con el mismo nombre.
export enum TextVariant {
  Display = 'display', DisplayUnit = 'displayUnit', Message = 'message', Farm = 'farm',
  TileValue = 'tileValue', LotNumber = 'lotNumber', Subtitle = 'subtitle', Button = 'button',
  RowValue = 'rowValue', Caption = 'caption', Noted = 'noted', RowLabel = 'rowLabel', Hint = 'hint',
  Status = 'status', Example = 'example', Heard = 'heard', LotHead = 'lotHead', Place = 'place',
  Overline = 'overline', Pill = 'pill', TileLabel = 'tileLabel', LotTag = 'lotTag', LotName = 'lotName',
}
export enum ButtonVariant { Primary = 'primary', Secondary = 'secondary' }
export enum Tone { Brand = 'brand', Warning = 'warning', Danger = 'danger' }
export enum IconName {
  Microphone = 'microphone', MicrophoneOff = 'microphone_off', Rain = 'rain', Move = 'move',
  Check = 'check', Question = 'question', Alert = 'alert', Offline = 'offline', Close = 'close',
}
```

| Componente | Qué es | Props principales |
| --- | --- | --- |
| `AppText` | Todo texto de la app | `variant`, `color` opcional |
| `Icon` | Los íconos, dibujados con `react-native-svg` | `name`, `size`, `color` |
| `Surface` | El contenedor de una tarjeta | `tone` |
| `AppButton` | Botón de texto | `label`, `variant`, `onPress`, `countdown` opcional |
| `InfoCard` | La tarjeta de comprobante | `InfoCardProps` |
| `Orb` | El botón principal | `state`, `level`, `size`, `onPress`, `accessibilityLabel` |
| `RevealText` | El subtítulo, que aparece palabra por palabra (sección 4.6 de `VISUAL.md`) | `text`, `variant`, `color` |

**La cuenta de un botón.** `countdown` es `{ durationMs: number; paused: boolean }`. El botón
dibuja su propia barra de avance, animada en el hilo de la interfaz. No avisa cuando termina:
es solo el dibujo. Quién anota al terminar la cuenta es el hook del RFC-004. Con `paused`, la
barra se frena donde está.

**`InfoCard`** dibuja una tarjeta a partir de un objeto, sin saber de qué habla:

```ts
export type InfoCardProps = {
  icon: IconName;
  label: string;                     // el título chico de arriba
  tone: Tone;
  big?: { value: string; unit: string };
  message?: string;                  // texto grande, para las tarjetas sin número
  hint?: string;
  route?: { from: string; to: string };
  rows?: { key: string; label: string; value: string; share?: number }[];
  examples?: string[];
  buttons?: { key: string; label: string; variant: ButtonVariant; onPress: () => void; countdown?: { durationMs: number; paused: boolean } }[];
  onClose?: () => void;              // con esto, la tarjeta muestra la cruz
};
```

- Cada bloque (encabezado, número, renglones, ruta, botones) es un componente chico dentro de
  la carpeta de `InfoCard`, y se dibuja si su dato está.
- `share` va de 0 a 1 y dibuja una barra: es la proporción del renglón respecto del mayor. La
  calcula quien arma la tarjeta.

**`Orb`** tiene sus estados como enum y una ficha por estado. Ningún componente pregunta por
un estado en particular: todos leen la ficha.

```ts
export enum OrbState { Idle = 'idle', Listening = 'listening', Thinking = 'thinking', Speaking = 'speaking' }
export enum OrbGlyph { Microphone = 'microphone', Bars = 'bars', Dots = 'dots' }

export type OrbStateSpec = {
  glyph: OrbGlyph;            // el dibujo del centro
  swirlMs: number;            // cuánto tardan los colores en dar una vuelta
  breathMs: number;           // cuánto dura una respiración
  breathSize: number;         // cuánto crece al respirar, como fracción del tamaño: 0,03 es un 3%
  glow: number;               // fuerza del resplandor, de 0 a 1
  ripples: boolean;           // si larga ondas
  followsVoice: boolean;      // si reacciona a `level`
};
export type OrbPalette = { core: string[]; blobs: string[]; ring: string[]; glow: string };

export const ORB_STATES: Record<OrbState, OrbStateSpec>;
export const ORB_GLYPHS: Record<OrbGlyph, ComponentType<OrbGlyphProps>>;
```

- Sumar un estado es agregarlo al enum, escribir su ficha y darle colores en los dos temas. Si
  necesita un dibujo nuevo, se suma a `OrbGlyph` y a `ORB_GLYPHS`. Si falta algo, no compila.
- El orbe se dibuja en tres capas, de atrás hacia adelante: el resplandor, el aro y la esfera,
  con el dibujo del centro adentro de la esfera.
- El movimiento vive en un hook del componente y corre en el hilo de la interfaz (R46). Solo se
  animan posición, tamaño, giro y opacidad. Android 11 no desenfoca en vivo: lo borroso se
  resuelve con degradés o con imágenes ya desenfocadas (I9 del research).
- `level` va de 0 a 1 y solo lo usan los estados con `followsVoice`.
- Mide `theme.touch.primary` o más y su área táctil es mayor que el dibujo, también cuando la
  pantalla lo achica.
- En reposo el orbe sigue animado: no se aquieta por falta de uso (Q3 del PRD).
- El orbe ignora la opción "reducir animaciones" del teléfono (`ReduceMotion.Never`); el resto
  de las animaciones la respeta (V3 de `VISUAL.md`).

### 3. Feature `home`

```
presentation/features/home/
  components/
    HomeScreen/           arma la pantalla
    TodaySummaryPanel/    el resumen de hoy
  hooks/
    useTodaySummary.ts        pide el resumen y lo entrega listo para dibujar
    todaySummaryView.ts       función pura: TodaySummary → TodaySummaryView
    todaySummaryView.test.ts
```

- **`HomeScreen`** llama a `useTodaySummary` y a `useVoiceStage`, y les pasa lo que devuelven
  a `TodaySummaryPanel` y a `VoiceStage`. No calcula nada. Respeta los márgenes seguros del
  teléfono.
- **`useTodaySummary(): TodaySummaryView | null`** llama a `getTodaySummary` con el `today` de
  `clock`, al montarse. Devuelve `null` mientras carga, y la pantalla no dibuja el resumen.
- **`todaySummaryView(summary: TodaySummary): TodaySummaryView`** arma los textos: los números
  con separador de miles y su unidad; la última lluvia como "hoy", "ayer" o "hace N días", a
  partir de `lastRain.daysAgo`; "sin lluvias" si no hay; y la frase de lo anotado hoy.
- **`TodaySummaryPanel`** muestra: nombre, actividad y ubicación; cabezas totales; lluvia del
  mes; última lluvia; los 8 lotes con su total; y lo anotado hoy.

### 4. Feature `voice`, solo lo que se ve

```
presentation/features/voice/
  components/
    VoiceStage/        subtítulo, orbe, texto de estado, tarjetas y contador de guardados
  hooks/
    useVoiceStage.ts   entrega lo que VoiceStage dibuja
```

```ts
export type VoiceStageView = {
  orbState: OrbState;
  level: number;
  statusText: string;
  subtitle: string;
  cards: (InfoCardProps & { key: string })[];
  pendingCount: number;           // audios guardados sin señal; con 0 no se muestra
  onOrbPress: () => void;
};
```

- Sin tarjetas, el orbe va grande y centrado en el espacio libre. Con una tarjeta, se achica y
  baja para dejarle el lugar. El cambio es animado, con una escala, sin recalcular la pantalla.
- Si las tarjetas no entran, su zona se desplaza con el dedo. La más nueva va abajo, junto al
  orbe (V2).
- Mientras hay un turno, el resumen baja al 35 % de opacidad (V4).
- En este RFC `useVoiceStage` devuelve el estado de reposo, sin tarjetas, con `pendingCount` en
  0 y un `onOrbPress` que no hace nada. El RFC-004 reemplaza el contenido del hook por el turno
  de voz real; `VoiceStage` no cambia.

### 5. Catálogo

`presentation/features/catalog/components/CatalogScreen` muestra cada pieza del design system
en todas sus variantes, para revisar lo visual sin depender del flujo:

- un selector de tema, claro u oscuro;
- los textos, los íconos, los botones (con y sin cuenta) y las superficies;
- el orbe, con un selector de estado y tres niveles de voz;
- una `InfoCard` por cada tarjeta de la tabla de abajo, con datos de ejemplo;
- `VoiceStage` con y sin tarjeta, y con audios guardados.

Los datos de ejemplo viven en el `constants.ts` del catálogo.

Qué pantalla abre la app lo decide un ajuste:

```ts
// core/configs/settings.ts
export enum RootScreen { Home = 'home', Catalog = 'catalog' }
settings.rootScreen   // RootScreen.Catalog si EXPO_PUBLIC_SHOW_CATALOG es "1"; si no, Home
```

`App.tsx` elige el componente con un objeto `Record<RootScreen, ComponentType>`, y monta, de
afuera hacia adentro: el proveedor de márgenes seguros, `ThemeProvider`,
`DependenciesProvider`, la barra de estado y la pantalla.

Tarjetas que el catálogo muestra y que usan el RFC-004 y el RFC-005:

| Tarjeta | Tono | Usa de `InfoCardProps` | Cómo se sale |
| --- | --- | --- | --- |
| Propuesta de lluvia | Marca | `big` (milímetros), `hint` (el día), `buttons` | "Anotar" (con la cuenta) y "Cancelar" |
| Propuesta de movimiento | Marca | `big` (cantidad y categoría), `route`, `buttons` | "Anotar" y "Cancelar" |
| Propuesta de corrección | Marca | `big` (la cantidad nueva), `hint` (la anterior), `buttons` | "Anotar" y "Cancelar" |
| Comprobante | Marca | `big`, `hint` o `route`, y el total nuevo en `rows` | La cruz |
| Respuesta de lluvia | Marca | `big` (el total), `rows` (un renglón por día) | La cruz |
| Respuesta de lote | Marca | `big` (el total), `rows` (un renglón por categoría, con `share`) | La cruz |
| Pregunta | Marca | `message` | La cruz |
| No entendió | Aviso | `message`, `examples` | La cruz |
| Rechazo | Peligro | `message` | La cruz |
| Sin micrófono | Aviso | `message`, `hint`, `buttons` | "Abrir ajustes" y la cruz |
| Audio guardado | Aviso | `message`, `hint` | La cruz |
| Grabado sin señal | Marca | Como la propuesta, sin cuenta | "Anotar" y "Descartar" |
| Guardado que no se entendió | Aviso | `message` | "Descartar" |
| Falta la voz en español | Aviso | `message`, `hint`, `buttons` | "Instalar voz" y la cruz |

### 6. Limpieza

Se borra la feature `research` del RFC-001.

## Criterios de aceptación

**Tema**

1. `shared/presentation/theme` exporta `Theme`, `ThemeMode` y los temas claro y oscuro, con los
   valores de `VISUAL.md`.
2. En `src/presentation` y en `src/shared/presentation/components` no hay colores, tamaños de
   letra, espaciados ni radios escritos a mano: `qa` lo comprueba buscando literales en los
   `styles.ts` y en los componentes.
3. `ThemeProvider` recibe `mode`. `useTheme()` y `useStyles(createStyles)` existen, y los
   componentes que usan el tema exportan `createStyles(theme)` desde su `styles.ts`.
4. `theme.test.ts` comprueba, en los dos temas: que el contraste del texto sobre el fondo y
   sobre la superficie es de 4,5 a 1 o más; que las variantes `Subtitle`, `Button`, `Display`,
   `RowValue` y `LotNumber` miden 20 o más; y que `touch.primary` es 64 o más.
5. La tipografía de `VISUAL.md` está declarada en el plugin de `expo-font` y la app la muestra.

**Design system**

6. Existen `AppText`, `Icon`, `Surface`, `AppButton`, `InfoCard`, `Orb` y `RevealText`, cada uno
   en su carpeta, según R19.
7. Ningún archivo de `shared` importa de `presentation/features`, `domain`, `data` ni `di`, y
   ninguno de `presentation` importa de `data`. `npm run lint` lo comprueba.
8. `InfoCard` dibuja las catorce tarjetas de la tabla a partir de `InfoCardProps`, sin una rama
   por tipo de tarjeta.
9. Toda tarjeta de la tabla tiene la salida que dice su columna "Cómo se sale".
10. El botón con `countdown` anima su barra en el hilo de la interfaz y la frena con `paused`.
11. `Orb` tiene los cuatro estados de `OrbState`, cada uno con su ficha y sus colores. Un test
    comprueba que no falta ninguno. Escuchando y hablando comparten el dibujo de las barras y se
    distinguen por el color, las ondas y porque al escuchar siguen la voz (sección 5.3 de
    `VISUAL.md`).
12. En el catálogo, cada estado del orbe se distingue por color, movimiento, dibujo del centro
    y texto.
13. En los estados con `followsVoice`, el orbe cambia con `level`.
14. El área táctil del orbe mide 64 dp o más, grande y achicado. Se comprueba con
    `adb shell uiautomator dump`.
15. Todo lo que se toca tiene `accessibilityRole` y `accessibilityLabel`.
16. Las animaciones solo cambian posición, tamaño, giro y opacidad.

**Pantalla de inicio (F11)**

17. La app abre en `HomeScreen`, con el resumen de hoy calculado por `getTodaySummary`.
18. El resumen muestra el nombre del establecimiento, las cabezas totales, la lluvia del mes,
    la última lluvia (cuánto y cuándo), el total de cada uno de los 8 lotes y lo anotado hoy.
19. La pantalla se ve completa en modo avión.
20. `todaySummaryView` tiene tests para: última lluvia de hoy, de ayer, de hace varios días y
    sin lluvias; lo anotado hoy con y sin registros; y un número de cuatro cifras.
21. Un nombre de establecimiento largo, un subtítulo de tres renglones y un número de cuatro
    cifras no se cortan ni se pisan. Se revisa en el catálogo.
22. La pantalla respeta los márgenes seguros del teléfono.

**Zona de voz**

23. `VoiceStage` dibuja el subtítulo, el orbe, el texto de estado, las tarjetas y el contador
    de guardados a partir de `VoiceStageView`.
24. Sin tarjetas el orbe va grande y centrado; con una tarjeta se achica y baja. El cambio es
    animado y sigue fluido con el hilo de JavaScript ocupado.
25. `useVoiceStage` devuelve el estado de reposo, sin tarjetas.

**Catálogo y limpieza**

26. Con `EXPO_PUBLIC_SHOW_CATALOG=1` la app abre en `CatalogScreen`, que muestra todo lo del
    punto 5, en los dos temas.
27. La feature `research` ya no existe.

**Chequeos**

28. `npm run typecheck`, `npm run lint` y `npm test` pasan.

## Reglas que aplican

R4 a R7 (capas), R17 a R28 (nombres, componentes y design system), R29 a R39 (estilo), R40 a
R47 (React y animaciones), R48 a R51 (tests) y R58 (verificar las APIs).

## Riesgos y casos límite

- **Textos largos.** El criterio 21 los cubre.
- **Teléfonos angostos y con barra de navegación.** La pantalla respeta los márgenes seguros.
- **Rendimiento.** El orbe se mueve en el hilo de la interfaz: sigue fluido aunque JavaScript
  esté ocupado.
- **Cambiar la tipografía** obliga a correr prebuild y a compilar de nuevo.
