# Lectura en frío · RFC-003 (Design system y pantalla de inicio)

Leídos: `CHALLENGE.md`, `PRD.md`, `FEATURES.md`, `RULES.md`, `CLAUDE.md`, `RFC-001`, `RFC-002` y `RFC-003`.
No existe `VISUAL.md`: lo que el RFC delega expresamente en él no se cuenta como hueco.

Pregunta guía: **¿qué tendría que adivinar para implementarlo?** Los hallazgos van por impacto. Los marcados [BLOQUEA] no se pueden implementar sin una decisión.

---

## 1. [BLOQUEA] La cuenta de 4 segundos entra como `progress` numérico, y eso obliga a animar desde JavaScript

- **El RFC dice** (sección 2, `AppButton` e `InfoCardProps`): `progress` opcional de 0 a 1 "para la cuenta"; `buttons?: { …; progress?: number }[]`.
- **Problema.** Un número de 0 a 1 que sube durante 4 s tiene que actualizarse por estado de React, unas 60 veces por segundo, en el hilo de JS. Choca con R46 y con RNF-08 (las animaciones no corren en el hilo de JS). El RFC tampoco dice qué pasa cuando la cuenta se frena: F7 pide que, con la app en segundo plano, la propuesta quede esperando sin anotarse sola. Tampoco dice cómo se ve la cuenta (relleno del botón, número de segundos, aro). Habría que adivinar el tipo de la prop, quién la anima y cómo se ve la pausa.
- **Agregar** en `InfoCardProps.buttons[]` y en `AppButton`, en lugar de `progress`:
  > `countdown?: { durationMs: number; running: boolean }`. El botón rellena su fondo de 0 a 100 % de forma lineal durante `durationMs`, con una animación de Reanimated en el hilo de la interfaz (R46). Con `running: false` se frena en el valor que tenía. Al desaparecer la prop vuelve a 0. Quien arma la tarjeta (RFC-004) decide cuándo termina la cuenta con su propio temporizador; el botón solo la dibuja. Cómo se ve la cuenta (relleno, segundos restantes) lo define `VISUAL.md`.
- **Criterio nuevo.** "En el catálogo, la propuesta de lluvia muestra la cuenta de 4 s corriendo y otra con `running: false` quieta. La cuenta se ve fluida mientras un botón del catálogo bloquea el hilo de JS 2 s."

## 2. [BLOQUEA] Q3 (el orbe en reposo) está en conflicto con el PRD y deja a `ORB_STATES.Idle` sin definir

- **El RFC dice** (Riesgos): "Si en reposo conviene que se aquiete es la pregunta Q3 del PRD, que se decide antes de este RFC". Y: "El orbe se mueve siempre".
- **Problema.** El PRD (sección 10) deja Q3 abierta con fecha "Antes de la etapa 4", y este RFC es la etapa 3. Además hay dos frases contradictorias: "se mueve siempre" y "puede aquietarse". `OrbStateSpec` no dice cómo se expresa "quieto". Si `swirlMs: 0` significa "sin giro", una animación con duración 0 en bucle puede quedar en un ciclo infinito o dividir por cero.
- **Cambiar** el riesgo por:
  > Q3 se decide y se anota en `DECISIONS.md` antes de empezar este RFC. Para aquietar un estado no se agrega un caso al orbe: se escribe su ficha con `swirlMs: 0`, `breathSize: 0`, `ripples: false` y `glow` fijo. En `OrbStateSpec`, `swirlMs` y `breathMs` iguales a 0 significan "sin ese movimiento" (no se arma la animación). Ver `VISUAL.md` para el valor de `Idle`.
- Aclarar también la unidad de `breathSize`: "escala que se suma al respirar (0,05 = crece 5 %), no dp". Hoy no dice si son dp, porcentaje o escala.
- **Criterio nuevo.** "Existe un test que recorre `ORB_STATES` y falla si algún `swirlMs` o `breathMs` es negativo, y la ficha de `Idle` coincide con la decisión de Q3."

## 3. [BLOQUEA salvo que `VISUAL.md` lo traiga] El armado de la pantalla: espacio, varias tarjetas y de dónde sale la vista

- **El RFC dice** (3 y 4): "el resumen arriba y la zona de voz abajo". "Sin tarjetas el orbe va grande y centrado en el espacio libre. Con una tarjeta, se achica y baja". `cards: (InfoCardProps & { key })[]`.
- **Problema.**
  - El resumen tiene nombre, actividad, ubicación, 4 datos y 8 lotes. En un teléfono de gama media no deja casi "espacio libre". No dice si la pantalla scrollea, si el resumen se achica cuando aparece una tarjeta o si queda tapado.
  - `cards` es una lista, pero solo se describe el caso de una tarjeta. En el RFC-004 pueden coincidir una propuesta y un "Audio guardado", o varios audios en cola. Falta decir cuántas caben, el orden y si hay scroll.
  - Quién llama a `useVoiceStage`: si lo llama `VoiceStage`, el catálogo no puede mostrarle datos de ejemplo (R20 y R21 piden componentes presentacionales).
  - Una feature (`catalog`) importa un componente de otra (`voice`). R4 no lo prohíbe, pero hay que decirlo.
- **Agregar** en la sección 4:
  > `VoiceStage` recibe `view: VoiceStageView` como prop y no llama a ningún hook. `HomeScreen` llama a `useVoiceStage()` y se lo pasa. `CatalogScreen` le pasa datos de ejemplo. La pantalla es un único `ScrollView` con el resumen arriba y `VoiceStage` abajo. La zona de tarjetas apila las tarjetas, la más nueva arriba, hasta `MAX_VISIBLE_CARDS` (en `constants.ts`). `VISUAL.md` fija las proporciones, los tamaños del orbe grande y chico, y si el resumen se colapsa cuando hay tarjeta.
- **Criterio nuevo.** "En el catálogo, `VoiceStage` se ve con cero, una y tres tarjetas, con el nombre de establecimiento más largo y un subtítulo de tres renglones, sin que nada quede cortado ni tapado."

## 4. [BLOQUEA salvo que `VISUAL.md` lo traiga] Los miembros de los enums y de los tipos del tema están elididos

- **El RFC dice**: `colors: { … }`, `sizes: { … }`, `OrbPalette` sin definir, y `TextVariant`, `IconName`, `ButtonVariant` y `Tone` solo nombrados.
- **Problema.** La delegación expresa a `VISUAL.md` cubre los valores y los nombres de las escalas del tema. No cubre los miembros de los enums que el RFC-004 tiene que usar: qué variantes de texto hay, qué íconos y qué variantes de botón. `Tone` tiene tres miembros (marca, aviso, peligro) y falta un tono neutro para el contenedor del resumen de hoy. Sin esa lista el RFC-004 inventa nombres.
- **Agregar** una sección "Enums del design system" que diga:
  > Miembros definitivos de `TextVariant`, `IconName` (como mínimo: micrófono, barras, puntos, cerrar, lluvia, animales, ruta, advertencia, ajustes), `ButtonVariant` (como mínimo: principal, secundario) y `Tone`. Los copia de `VISUAL.md` tal cual, con el mismo nombre en inglés. `OrbPalette` es `{ base: string; accent: string; glow: string }` (o lo que fije `VISUAL.md`). El resumen de hoy usa `Surface` con el tono neutro `Tone.Neutral`, si `VISUAL.md` lo prevé.
- Si `VISUAL.md` no los trae, la regla del RFC ya lo cubre ("se pregunta"): conviene citarla en esta sección.

## 5. Cuatro estados del orbe, tres dibujos de centro

- **El RFC dice**: `enum OrbGlyph { Microphone, Bars, Dots }`, y criterio 9: cada estado se distingue "por color, movimiento, dibujo del centro y texto".
- **Problema.** `OrbState` tiene cuatro miembros y `OrbGlyph` tiene tres: dos estados tienen que compartir dibujo, y no se distinguirían por el dibujo del centro (F2 y RF-02). F19 suma un quinto estado, "esperando la frase", con ícono propio. Habría que adivinar cuál es el cuarto dibujo y quién lo agrega.
- **Cambiar** a:
  > `OrbGlyph` tiene un miembro por estado (`Microphone`, `Bars`, `Dots` y el que `VISUAL.md` defina para `Speaking`). `ORB_STATES` no repite el dibujo en dos estados. Sumar un estado exige un `OrbGlyph` nuevo si ningún dibujo existente sirve.
- **Criterio nuevo.** "Un test comprueba que no hay dos estados de `ORB_STATES` con el mismo `glyph`."

## 6. [Contradicción] El criterio 7 es circular y no dice qué tarjetas llevan la cruz

- **El RFC dice** (criterio 7): "Toda tarjeta tiene al menos una acción a la vista, un botón o la cruz de cerrar, salvo el comprobante y las respuestas, que se cierran con la cruz."
- **Problema.**
  - La excepción es vacía: lo que se exceptúa también tiene la acción (la cruz).
  - La tabla de tarjetas no dice cuáles llevan `onClose`. "Pregunta", "No entendió", "Audio guardado" y "Rechazo" no tienen botón en la tabla.
  - F13 pide "Descartar" para un audio guardado que no se entiende. La tabla no tiene esa tarjeta.
  - F18 (Should) tiene su tarjeta "Instalar voz", que tampoco está.
  - F16 exige una salida a la vista en cada tarjeta.
- **Cambiar** el criterio 7 por:
  > Toda tarjeta de la tabla tiene como mínimo un botón o la cruz de cerrar (`onClose`). Pregunta, No entendió, Rechazo, Audio guardado, Comprobante y Respuestas llevan la cruz. Las propuestas llevan "Anotar" y "Cancelar". Sin micrófono lleva "Abrir ajustes" y la cruz. Grabado sin señal lleva "Anotar" y "Descartar".
- **Agregar** a la tabla dos filas: "Audio guardado no entendido (Aviso): mensaje y 'Descartar'" y "Instalar voz (Aviso, Should): mensaje y 'Instalar voz'".
- **Comprobación.** Un test sobre los datos de ejemplo de `catalog/constants.ts`: cada elemento tiene `buttons` con al menos un elemento o `onClose`.

## 7. [Falta] El contador de audios guardados (F13) no tiene lugar en la pantalla

- **El RFC dice** (Features): "la parte visual de … F13". F13: "La pantalla muestra cuántos audios hay guardados".
- **Problema.** Ni `HomeScreen`, ni `TodaySummary`, ni `VoiceStageView` tienen un campo para ese contador ("1 guardado" en J4). El RFC-004 no podría mostrarlo sin tocar un componente que acá se declara cerrado ("el componente no cambia").
- **Agregar** a `VoiceStageView`:
  > `pendingAudios: number` (cantidad de audios guardados sin enviar; 0 la oculta). `VoiceStage` dibuja una insignia con el texto "N guardado(s)" arriba del orbe, y `useVoiceStage` devuelve 0 en este RFC. El texto y la forma los fija `VISUAL.md`.
- Sumar al catálogo la zona de voz con 0 y con 2 audios guardados.

## 8. Las tarjetas de la tabla no se pueden convertir a `InfoCardProps` sin interpretar

- **El RFC dice** (5): la tabla da "Contenido" en prosa ("Número grande con 'mm', el día, y los botones…"), y `InfoCardProps` tiene `big`, `message`, `hint`, `route`, `rows`, `examples`.
- **Problema.**
  - No dice qué prop usa cada tarjeta (¿"el día" va en `hint` o en `label`?).
  - No dice qué `IconName` y qué `label` lleva cada una.
  - `big` y `message` parecen excluyentes ("para las tarjetas sin número"), pero el tipo permite los dos o ninguno.
  - `share` (0 a 1): no dice respecto de qué se calcula.
  - Los números "de cuatro cifras no se cortan" (Riesgos) choca con el mínimo de 20 sp del criterio 23: reducir la letra para que entre la baja de 20.
- **Agregar** una columna "Props" a la tabla, por ejemplo:
  > Propuesta de lluvia: `icon`, `label`, `big{value,unit}`, `hint` (el día), `buttons[Anotar+countdown, Cancelar]`.
  > Respuesta de lluvia: `big`, `rows[{label: día, value: mm, share}]`, `onClose`.
  > Respuesta de lote: `big`, `rows[{label: categoría, value: cantidad, share}]`, `onClose`. (Y así las once.)
- Y estas reglas:
  > `big` y `message` son excluyentes (si vienen los dos, manda `big`). `share` es la fracción de la barra que se llena: quien arma la tarjeta decide el divisor (en la lluvia por día, el día de más lluvia; en las categorías, el total del lote). Un valor largo se parte en renglones, nunca se achica por debajo del tamaño de su variante (criterio 23).

## 9. La lógica de `todaySummaryView` y `useTodaySummary` no está cerrada

- **El RFC dice** (3): "`todaySummaryView` arma los textos: … la última lluvia como 'ayer', 'hoy' o 'hace N días'". "`useTodaySummary` llama a `GetTodaySummaryUseCase` con el `today` de `ClockService`, al montarse".
- **Problemas.**
  - Para decir "hace N días" hay que restar dos `DateText`, y la función de fechas está en `data/usecases/rules/dates.ts`. `presentation` no puede importar de `data` (R4). El RFC no dice dónde vive la resta ni cuál es la firma de `todaySummaryView` (¿recibe `today`?).
  - Faltan el tipo del resultado, el formato de los números (coma decimal, separador de miles: "1.250") y los textos para "sin lluvias" y para "nada anotado hoy". Tampoco dice qué pasa con N = 1 ("hace 1 días").
  - `TodaySummary` es a la vez el nombre del tipo del dominio y el de un componente.
  - F11 y RF-15 piden que el resumen cambie "en el momento en que se anota algo". El hook solo carga "al montarse", y el RFC cita F11.
  - R43 limita los efectos a sincronizar con algo de afuera. Cargar el archivo es I/O, y el RFC no lo aclara. Falta el estado de carga (F16: nunca pantalla vacía).
- **Agregar:**
  > `todaySummaryView(summary: TodaySummary, today: DateText): TodaySummaryView`. La resta de fechas la hace una función pura al lado de `todaySummaryView` (R27), con su test: `daysBetween(from, to)`. Los números se formatean con `Intl.NumberFormat('es-AR')`. Textos: "Sin lluvias registradas" y "Nada anotado hoy" (o los de `VISUAL.md`). El componente se llama `TodaySummaryCard` para no chocar con el tipo del dominio.
  > `useTodaySummary` devuelve `{ phase: SummaryPhase; view: TodaySummaryView | null; refresh(): Promise<void> }`, donde `SummaryPhase` es un enum (`Loading`, `Ready`). Mientras carga se ve un esqueleto del resumen, nunca una pantalla vacía. `refresh` lo llama el RFC-004 después de anotar: es lo que cumple RF-15. Cargar el archivo es una sincronización con algo de afuera (R43).
- **Criterio nuevo.** "`daysBetween` tiene tests para el mismo día, el día anterior, un cambio de mes y un cambio de año."

## 10. Nombres de lo que se toma de los RFC anteriores, y ajustes de `App.tsx`

- **El RFC dice**: "`App.tsx` elige la pantalla con un objeto, no con un `if`". "Se abre con el ajuste `EXPO_PUBLIC_SHOW_CATALOG=1`". "`App.tsx` monta `ThemeProvider`, `DependenciesProvider` y `HomeScreen`".
- **Problemas.**
  - `Dependencies` (RFC-001, RFC-002): el RFC-002 dice que `container.ts` "expone por su contrato" el reloj y los casos de uso, pero no los nombres de los campos. Hay que usar `GetTodaySummaryUseCase` y `ClockService` sin saber cómo se llaman en `Dependencies`.
  - `settings` (RFC-001) solo tiene `serverUrl`. El RFC-001 solo trae `readNumber`. La bandera del catálogo no existe y no hay lector de banderas. Elegir el objeto con una bandera booleana en realidad pide `flag ? A : B`, que es un condicional (R31).
  - Falta `SafeAreaProvider` (el RFC pide respetar los márgenes seguros) y `StatusBar` según el tema.
- **Agregar:**
  > `Dependencies` suma `clock: ClockService` y `getTodaySummary: GetTodaySummaryUseCase`. `settings` suma `startScreen: StartScreen` (enum `Home` / `Catalog`), leído de `EXPO_PUBLIC_SHOW_CATALOG` con un `readFlag` al lado de `readNumber` y con su test. `App.tsx` usa `const SCREENS: Record<StartScreen, ComponentType>`. `App.tsx` monta `SafeAreaProvider`, `ThemeProvider mode={ThemeMode.Light}`, `DependenciesProvider` y la pantalla, y pone `StatusBar` con el estilo del tema.
- **Criterio nuevo.** "`readFlag` tiene tests: variable en `1`, ausente y con otro valor."

## 11. La tipografía: una sola `family` no alcanza con fuentes incrustadas, y nadie trae los archivos

- **El RFC dice** (1): `typography: { family: string; sizes; weights; lineHeights }`. RFC-001: plugin `expo-font` con "La tipografía, incrustada en el APK".
- **Problema.**
  - En Android, con fuentes incrustadas, cada peso es un archivo y un `fontFamily` distinto. `fontWeight` solo no elige el archivo. Con `family: string` y `weights` no se puede dibujar un texto en negrita.
  - El RFC-001 no dice qué archivos de letra son ni de dónde salen. Cambiar los archivos del plugin obliga a un `prebuild` y a compilar de nuevo.
- **Cambiar** el tipo y agregar un paso:
  > `typography: { families: Record<FontWeight, string>; sizes; lineHeights }`, donde `FontWeight` es un enum y cada valor es el nombre exacto del archivo de letra incrustado. Este RFC agrega los archivos de la tipografía de `VISUAL.md` a `app/assets/fonts/`, los declara en el plugin `expo-font` de `app.json`, y vuelve a correr `npx expo prebuild --platform android` y el build de debug.
- **Criterio nuevo.** "Un texto en cada peso de `FontWeight` se ve con su archivo (captura del catálogo en el emulador)."

## 12. Lo que el RFC nombra en su prosa y no está en los criterios

| Prosa del RFC | Criterio que falta |
| --- | --- |
| `RevealText` ("Solo si `VISUAL.md` lo pide") | "Si `VISUAL.md` lo pide, existe `RevealText` con las cuatro partes de R19 y el catálogo lo muestra." |
| `ThemeProvider` en `shared/presentation/states`, con una prop que elige el tema | "`ThemeProvider` recibe `mode: ThemeMode` y entrega el tema oscuro cuando recibe `ThemeMode.Dark`." |
| `Icon` "dibujado con SVG" | "`Icon` usa `react-native-svg` y no hay imágenes de ícono sueltas." |
| `useVoiceStage` "con un `onOrbPress` que no hace nada" | Sumarlo al criterio 19. |
| `App.tsx` "con un objeto" | Ver hallazgo 10. |
| Datos de ejemplo en `constants.ts` del catálogo | "Los datos de ejemplo del catálogo están en `catalog/.../constants.ts`." |
| Márgenes seguros, "teléfonos angostos" | "En el emulador con la barra de navegación de tres botones y en uno de 360 dp de ancho, nada queda debajo de las barras del sistema." |
| Textos largos (nombre largo, subtítulo de tres renglones, números de cuatro cifras) | Ver hallazgo 3. |
| "Solo se animan posición, tamaño, giro y opacidad" (R46) | "Ningún estilo animado toca color, ancho, alto ni margen; un estilo animado lee sus valores compartidos directamente." |
| Los límites de capas para `shared` y `presentation/features` (R4, R5, R7) | "Un import de `domain` desde `shared/presentation/components` y uno de `data` desde `presentation/features` hacen fallar `npm run lint`." El RFC-001 solo demostró un import prohibido, y las carpetas `shared` y `presentation` se llenan recién acá. |

## 13. Varios criterios no dicen cómo se demuestran

| # | Qué falta | Comprobación concreta que propongo |
| --- | --- | --- |
| 2 | "Ningún componente escribe a mano un color…" | Un test de Jest que lee los `.tsx` y `styles.ts` bajo `shared/presentation/components` y `presentation/features` y falla si encuentra `#` seguido de 3 a 8 dígitos hexadecimales, `rgb(`/`rgba(`, o `fontSize`, `padding*`, `margin*`, `gap` o `borderRadius` con un número literal. |
| 8 | "Un test comprueba que no falta ninguno" | `Object.values(OrbState)` contra las claves de `ORB_STATES` y de `theme.orb` en los dos temas. Es un test de datos puros y no necesita una librería de renderizado. |
| 11 | "mide 64 dp o más… área táctil mayor" | Test: `theme.touch.primary >= 64`. En el emulador, `adb shell uiautomator dump` y mirar los `bounds` del nodo con el `content-desc` del orbe, que deben ser mayores que el dibujo. Hay que fijar cuánto mayor (`ORB_HIT_SLOP` en `constants.ts`), y que el orbe achicado también mida 64 dp o más. |
| 12 | "Todo lo que se toca tiene `accessibilityRole` y `accessibilityLabel`" | El stack no trae una librería de renderizado para tests. Se comprueba con `grep -rn "Pressable\|Touchable" app/src`: los resultados son solo `AppButton`, `Orb` y la cruz de `InfoCard`, cada uno con rol y etiqueta, y se verifica con TalkBack en el catálogo. |
| 15 | "Se ve completa sin red" | Modo avión en el emulador y abrir la app. En este RFC la app no usa la red, y conviene decirlo. |
| 18, 10 | "corre en el hilo de la interfaz", "cambia con `level`" | Botón del catálogo que bloquea el hilo de JS 2 s: el orbe y el achicado siguen moviéndose. El catálogo con los tres niveles de voz y la captura de cada uno. |
| 23 | "Se comprueba con los valores del tema y se anota" | No dice dónde se anota ni qué pares de colores se miden. Propongo `theme.test.ts`: calcula el contraste de cada par texto/fondo (texto sobre fondo, sobre cada `Tone` de `Surface`, y sobre cada `ButtonVariant`), en los dos temas, y verifica `size >= 20` para `Subtitle`, `BigNumber` y `Button`. El resultado se anota en `docs/RESEARCH.md`. La función de contraste vive al lado del test (R27). |

## 14. El tema oscuro no se puede revisar, y falta usar lo que dejó el RFC-001

- **El RFC dice**: "Hay un tema claro y uno oscuro, los dos completos. En este RFC la app usa el claro". Criterio 8: colores del orbe "en los dos temas".
- **Problema.**
  - El catálogo no tiene un selector de tema. El oscuro no se puede ver ni demostrar hasta el RFC-005.
  - El RFC-001 midió en I9 que `filter: blur` no funciona en Android 11 y que `backgroundImage` (degradé lineal y radial) y `boxShadow` sí, y en I10 el patrón de Reanimated que funciona. El RFC-003 no los cita, y el orbe (resplandor y colores que giran) depende de ellos.
- **Agregar** al catálogo y a la sección del orbe:
  > El catálogo tiene un interruptor claro/oscuro que cambia `ThemeProvider mode`. El resplandor y las ondas del orbe se arman con `backgroundImage` y `boxShadow`, sin `filter: blur` (I9 de `docs/RESEARCH.md`). Los estilos animados siguen el patrón de I10.
- **Criterio nuevo.** "En el catálogo, cada pieza se ve en los dos temas con el interruptor."

## 15. Detalles de reglas de componentes y de React que el RFC deja a interpretar

- **R19, R17 y R38.** El RFC no da el árbol de archivos de `shared/presentation/theme`, de `Orb` ni de `ThemeProvider`. R17 pide un archivo por símbolo, y solo de `Orb` salen cuatro (`OrbState`, `OrbGlyph`, `OrbStateSpec`, `ORB_STATES`). R38 limita `index.ts` a las carpetas de componente. Además, el tema importa `OrbState` del componente `Orb` y `Orb` importa el tema: es una dependencia circular. Agregar:
  > `OrbState`, `OrbGlyph`, `OrbStateSpec` y `OrbPalette` viven en `shared/presentation/theme/orb/`, un archivo por símbolo, y el componente `Orb` los importa de ahí. `ORB_STATES` está en `Orb/constants.ts`. El movimiento está en `Orb/useOrbMotion.ts`. El tema está en `theme/Theme.ts`, `theme/ThemeMode.ts`, `theme/lightTheme.ts` y `theme/darkTheme.ts`. `ThemeProvider` tiene su carpeta con las cuatro partes de R19. Los componentes de `InfoCard` (encabezado, número, renglones, ruta, botones) son carpetas propias dentro de `InfoCard/components/`.
- **Orb y R46.** "se achica y baja" y el `size` como prop son ambiguos: ¿se anima el ancho (layout) o se aplica una escala (transformación)? Con escala, el área táctil achicada tiene que seguir midiendo `theme.touch.primary` o más. `level` es un `number` que llega por props ~10 veces por segundo: falta decir que se copia a un valor compartido y con qué suavizado. Agregar: "`size` solo cambia entre dos valores fijos (grande/chico) y la transición es una escala animada; `level` se copia a un valor compartido y se suaviza con una duración de `theme.durations`".
- **R45.** Los `rows`, `examples` y `buttons` no tienen `key`. Dicen "usan `label` como `key`; `label` es único dentro de una tarjeta".
- **R22.** El RFC no dice que `AppText`, `Icon` y `Surface` también llevan `constants.ts` aunque quede casi vacío (R19 lo exige). Decirlo evita dudas.

---

## Lo que `VISUAL.md` tiene que traer

1. **Tema claro y oscuro completos**, con los nombres y la cantidad de pasos de cada escala: colores (fondo, superficies, texto, marca, aviso, peligro, neutro), tamaños de letra, pesos, interlineados, espaciados, radios, sombras, duraciones y `touch.minimum` / `touch.primary` (no menos de 64 dp).
2. **La tipografía**: nombre, un archivo por peso y la fuente de la que se bajan, y dónde se usa cada peso.
3. **Las listas cerradas**: `TextVariant`, `IconName` (con el dibujo de cada ícono), `ButtonVariant`, `Tone` (incluido el neutro, si lo hay) y `FontWeight`.
4. **El orbe**: la ficha de cada estado (`glyph`, `swirlMs`, `breathMs`, `breathSize`, `glow`, `ripples`, `followsVoice`) y los colores de cada estado en los dos temas. Debe haber un dibujo de centro distinto por estado. Debe decir cómo reacciona a `level`, qué hace `Idle` (Q3), los dos tamaños (grande y chico) y el margen del área táctil.
5. **La cuenta de 4 segundos**: cómo se ve (relleno, segundos, aro) y cómo se ve frenada.
6. **El armado de `HomeScreen` y `VoiceStage`**: proporciones, scroll, cuántas tarjetas caben y cómo se apilan, el lugar y el estilo del contador de audios guardados y la animación de entrada y salida de una tarjeta.
7. **Cada tarjeta de la tabla**: ícono, título, tono y composición (qué bloques usa y en qué orden), más las dos tarjetas que se suman (Audio guardado no entendido e Instalar voz).
8. **Los textos de estado** de cada `OrbState` (por ejemplo "Tocá para hablar") y cuál es el texto del subtítulo en reposo.
9. **`RevealText`**: si se usa o no.
10. **El resumen de hoy**: jerarquía de los datos (nombre, cabezas, lluvia del mes, última lluvia, 8 lotes, lo anotado hoy) y su textura cuando carga.

---

**Veredicto:** el RFC es buen punto de partida (el contrato de `InfoCard` y las fichas del orbe están bien pensados, y los identificadores R y F que cita existen y dicen lo que afirma). Con la deuda de los hallazgos 1 a 4, no se puede implementar sin adivinar: el contrato de la cuenta de la propuesta contradice R46, Q3 está sin resolver y varias piezas del armado de la pantalla dependen de un `VISUAL.md` que todavía no existe.

## Qué se hizo con estos hallazgos

Se reescribió el RFC-003. Aplicados: 1 (la cuenta la anima el botón, con `countdown`), 2 (Q3 se decide antes de este RFC; el PRD se corrigió), 3 y 4 (lo que `VISUAL.md` tiene que traer, y los miembros de cada enum), 5 (un dibujo de centro por estado), 6 (cómo se sale de cada tarjeta, y las tres que faltaban), 7 (`pendingCount`), 8, 9, 10, 11, 12, 13 (los que tienen comprobación concreta), 14 (selector de tema en el catálogo) y 15.
