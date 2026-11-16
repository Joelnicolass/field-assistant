# RFC-005 · Extras y entrega

| | |
| --- | --- |
| **Estado** | Pendiente |
| **Features** | F24 y F25 (Must). F18, F19, F20, F21, F22, F23 y F27 (Should) |
| **Predecesores** | RFC-001 a RFC-004. Además necesita `VISUAL.md` |
| **Sucesores** | Ninguno |
| **Complejidad** | Alta |

## Resumen

Tiene dos mitades. La obligatoria es la entrega: el server publicado, el APK de release
probado en un teléfono, el Release y los documentos. La otra son los extras: manos libres, la
entrada con el logo, el splash con el ícono, las frases grabadas, el aviso de voz, y el tema y
el brillo según la luz.

## Antes de empezar

- **Una cuenta de Railway**, donde se publica el server. Sin ella no empieza el paso 1.
- **`VISUAL.md`** tiene que traer, para este RFC: dónde va el interruptor de manos libres y
  cómo se ve encendido, el logo y cómo se mueve en la entrada, y el ícono y el color del splash.
- **La clave de la voz de servicio con crédito**, para generar las frases grabadas una sola
  vez: son siete frases cortas, unos 140 caracteres en total.
- **El repositorio en GitHub.** Subir el código y publicar el Release necesita que el usuario
  lo haga o lo autorice en el momento (R59).

## Orden de los pasos

Primero la entrega completa con lo que ya existe, para que el proyecto sea entregable cuanto
antes. Después los extras. Al final se entrega de nuevo, con todo adentro.

| Paso | Qué | Features |
| --- | --- | --- |
| 1 | Server publicado, APK de release, prueba en el teléfono, repositorio y Release | F24 |
| 2 | README, DECISIONS.md y AI-USAGE.md completos | F25 |
| 3 | Manos libres | F19 |
| 4 | Entrada con el logo | F20 |
| 5 | Splash e ícono | F23 |
| 6 | Frases grabadas | F27 |
| 7 | Aviso de voz en español, tema según la luz y brillo al sol | F18, F21, F22 |
| 8 | APK final, prueba y batería en el teléfono, Release y documentos al día | F24, F25 |

## La entrega

### Server publicado (F24)

- Se publica tal cual, con https, en Railway. Arranca con `npm start` y
  escucha en el puerto de la variable `PORT` del servicio.
- Las claves se cargan como variables del servicio, nunca en el repositorio.
- Cada proveedor tiene un tope de gasto configurado en su panel (RNF-12). Se anota en
  `DECISIONS.md` cuál es.
- Queda disponible mientras dure la evaluación (RF-35). Un servicio gratuito puede dormirse y
  tardar en despertar más que el corte de 8 segundos: al abrir, la app llama a `GET /health`
  para despertarlo. Es una línea en el arranque, sin esperar la respuesta.

### APK de release (F24)

- La dirección del server es el ajuste `EXPO_PUBLIC_SERVER_URL`, que queda fija al compilar.
  Se compila con la receta que anotó el research (I8), para que el APK no salga con el valor
  viejo.
- Con el server en https se quita de `app.json` el permiso de tráfico sin cifrar. Para
  desarrollar contra un server local se usa el build de debug, que lo permite por su cuenta.
- El APK es para arm64, usa la firma de debug y lleva el JavaScript adentro: abre sin ningún
  servidor de desarrollo.
- Se publica como archivo de un Release de GitHub, con la etiqueta `v1.0.0` y el nombre
  `field-assistant-v1.0.0-arm64.apk`. El APK no se versiona.

Comprobaciones, desde `app/android`, sobre `app/build/outputs/apk/release/app-release.apk`:

| Qué | Comando | Se espera |
| --- | --- | --- |
| La dirección del server está adentro | `unzip -p <apk> assets/index.android.bundle \| grep -a -c '<host del server>'` | 1 o más |
| No apunta a un server local | El mismo, buscando `localhost:8787` | 0 |
| No lleva claves | El mismo, buscando el valor de cada clave | 0 |
| Es para arm64 | `unzip -l <apk> \| grep -c 'lib/arm64-v8a'` | 1 o más |
| El peso | `ls -l <apk>` | 100 MB o menos |

### Prueba final (RF-36)

Con el APK de release recién instalado en un teléfono físico con Android 11 o superior,
contra el server publicado:

1. Las cuatro frases de la consigna, que son las cuatro primeras de `docs/BATERIA.md`, con el
   resultado que dice ahí.
2. La batería completa de `docs/BATERIA.md`. Pasa con 18 de 20 o más.

El resultado de cada frase se anota en `docs/RESEARCH.md`, con el teléfono y la fecha. Lo que
solo se pudo probar en el emulador se anota como tal (RNF-01).

### Documentos (F25)

- **`README.md`:** qué es; requisitos; cómo compilar desde cero (instalar, bajar el modelo de
  voz, prebuild, build de debug y de release); cómo levantar el server y configurar sus claves
  con `.env.example`; cómo apuntar la app a un server local; y cómo correr los tests. Se
  comprueba siguiéndolo en una copia limpia del repositorio.
- **`DECISIONS.md`:** una entrada por decisión, con qué se decidió, por qué y qué se resignó.
  Como mínimo:
  1. el stack, y por qué no las alternativas;
  2. por qué se toca para hablar, y qué lugar tiene manos libres;
  3. proponer antes de anotar;
  4. quién pone los números: el modelo entiende, el código calcula;
  5. la cola sin señal;
  6. la arquitectura;
  7. la lectura de la semilla (S1 del PRD);
  8. qué quedó afuera y por qué, si algo quedó afuera;
  9. escalabilidad: qué pasa de un productor a miles, con estos cinco puntos: costo por
     pedido, límites del server, datos en el teléfono o en un servicio, identificar a quien
     llama, y qué cambiaría primero.
- **`AI-USAGE.md`:** qué herramienta de IA se usó en cada etapa y para qué.
- **Historial:** un commit por paso aprobado, en GitHub.

## Los extras

### Manos libres (F19)

```ts
// domain/services
export interface WakePhraseService {
  start(onDetected: () => void): Promise<void>;
  stop(): Promise<void>;   // termina cuando el micrófono quedó libre
}
```

- **`VoskWakePhraseService`** (`data/services`) carga el modelo la primera vez y lo deja
  cargado. Le pasa a Vosk una lista con la frase, sus palabras sueltas, las palabras comunes
  que eligió el research (I5) y `[unk]`. Avisa una sola vez, cuando lo que Vosk cree oír, a
  medio decir o al terminar, contiene la frase entera. La lista de palabras comunes vive en un
  `constants.ts` junto al service.
- La frase es el ajuste `wakePhrase` (`EXPO_PUBLIC_WAKE_PHRASE`), con el valor que eligió el
  research. Sus dos palabras están en el vocabulario del modelo.
- **El orbe sigue en reposo mientras espera la frase**, como en cualquier manos libres. No hay
  una fase ni un estado nuevos. Lo que dice que la app está atenta es el interruptor encendido
  y el texto de estado, que en reposo y con manos libres pasa a "Decí «…» y contame qué pasó".
  Al oír la frase, el paso a escuchando es evidente: vibra, y el orbe cambia de color y de dibujo.
- **Un solo evento nuevo**, `PhraseDetected`, que en reposo lleva a escuchando, igual que un
  toque. Antes de grabar se frena el detector y se espera a que suelte el micrófono.
- **`useHandsFree(phase, dispatch)`** (feature `voice`) guarda si el interruptor está
  encendido. Arranca el detector cuando el interruptor está encendido, la app está a la vista y
  la fase es reposo, y lo frena en cualquier otro caso. Al detectar la frase vibra y despacha
  `PhraseDetected`. Después de cada turno, al volver a reposo, el detector arranca solo.
- La vibración es una llamada a `Vibration` de React Native en el hook: no necesita un service.
- Necesita el permiso de micrófono. Si está denegado, o si el detector no puede arrancar, el
  interruptor se apaga y la app lo dice. Con el permiso denegado muestra además la tarjeta
  "Sin micrófono".
- **El interruptor** es un componente nuevo del design system, `ToggleChip` (`label`, `value`,
  `onChange`), apagado por defecto. `HomeScreen` se lo pasa a `TodaySummaryPanel` con lo que
  entrega `useHandsFree`. Dónde va y cómo se ve encendido lo define `VISUAL.md`.
- Mientras espera la frase, nada se graba ni se envía: `VoskWakePhraseService` no escribe
  archivos ni llama a la red.
- **Para probar sin voz:** con el ajuste del audio de prueba (RFC-004), el contenedor usa
  `ScriptedWakePhraseService`, que "oye" la frase cuando aparece un audio en la dirección
  configurada.
- Un pedido que entró por la frase se anota igual que uno por toque: solo, a los 4 segundos
  (Q6 del PRD).

### Entrada con el logo (F20)

El orbe suma una prop opcional, `intro`. Sin ella aparece ya armado. El orbe no sabe qué
entrada es: recibe valores animados para sus tres capas y dos lugares donde dibujar.

```ts
import type { DerivedValue } from 'react-native-reanimated';

export type OrbIntro = {
  sphereScale: DerivedValue<number>;   // por cuánto se multiplica el tamaño de cada capa
  ringScale: DerivedValue<number>;
  haloScale: DerivedValue<number>;
  glyphOpacity: DerivedValue<number>;  // el dibujo del centro
  glyphScale: DerivedValue<number>;
  swirlBoost: DerivedValue<number>;    // por cuánto se multiplica el giro de los colores
  behind: ReactNode;                   // lo que la entrada dibuja detrás de la esfera
  inside: ReactNode;                   // lo que dibuja adentro
};
```

- **`useLogoIntro({ size, enabled, ready, onEnd }): OrbIntro | undefined`** vive en
  `shared/presentation/components/LogoIntro`. Arma la entrada con un solo reloj en el hilo de
  la interfaz. Con `enabled` en falso no devuelve nada.
- **`ready`** es verdadero cuando la pantalla ya midió su espacio y el orbe está a la vista. La
  entrada empieza en ese momento, no mientras se cargan los datos.
- **La pantalla.** `HomeScreen` tiene tres momentos: el orbe solo, en el centro; el orbe en su
  lugar con el resto a la vista; y el orbe abajo, cuando hay tarjetas. Con la entrada encendida
  arranca en el primero y pasa al segundo cuando llega `onEnd`. Con la entrada apagada arranca
  directamente en el segundo. Las tarjetas que existan al abrir aparecen recién en el segundo.
- Un toque al orbe durante la entrada no hace nada.
- Dura 3,5 segundos o menos. No se repite al volver del segundo plano: corre una vez por
  apertura.
- Se apaga con el ajuste `logoIntro` (`EXPO_PUBLIC_LOGO_INTRO=0`).
- El tema no cambia durante la entrada: si el sensor pide otro, se aplica al terminar.
- El logo, sus piezas y cómo se mueven salen de `VISUAL.md`.

### Splash e ícono (F23)

- Ícono adaptable de Android y splash con el color y el logo de la marca, configurados en
  `app.json` (`expo-splash-screen`).
- El splash y el primer cuadro de la app comparten el color de fondo: no hay salto.

### Frases grabadas (F27)

Siete audios cortos, con la voz de servicio, guardados dentro de la app. Suenan al instante y
sin red.

```ts
// domain
export enum CueKind { Thinking = 'thinking', Offline = 'offline' }

export interface CuePlayerService {
  play(kind: CueKind): Promise<string>;   // devuelve el texto de la frase; termina cuando deja de sonar
  stop(): void;
}
```

| Tipo | Frases |
| --- | --- |
| Mientras piensa | "Dame un segundo." · "A ver." · "Ya te digo." · "Dejame ver." · "Un momento." |
| Sin señal | "No tengo señal. Lo guardé y lo anoto cuando vuelva." · "Sin señal por ahora. Te lo guardo." |

- **Se generan una sola vez**, con `npm run cues` en `server/`: el script
  `server/scripts/cues.ts` le pide cada frase a la voz de servicio y guarda los `.mp3` en
  `app/assets/cues/`. Los audios se versionan. Gasta crédito de la voz: unos 140 caracteres.
- **`BundledCuePlayerService`** (`data/services`) reproduce el audio con `expo-audio`. De cada
  tipo va turnando las frases en orden, sin azar. Los textos y los archivos viven juntos en un
  `constants.ts`, en un objeto por `CueKind`.
- **Al empezar a pensar**, la app dice una muletilla. La respuesta espera a que termine: duran
  menos de un segundo. Si el turno se cancela, se corta.
- **Cuando un audio va a la cola**, en lugar de pedirle la frase a la voz, suena una de las dos
  de "sin señal", y el subtítulo muestra el texto que devuelve `play`.
- **Las frases grabadas pasan por la misma cola de sonidos que la voz** (RFC-004). Sin señal
  el envío falla al instante, cuando la muletilla recién empieza: el aviso espera a que
  termine, y nunca suenan dos a la vez.
- Si un audio no se puede reproducir, la app sigue como antes de este extra: sin muletilla, y
  con el aviso de sin señal dicho por la voz del teléfono.

### Aviso de voz en español (F18)

```ts
export interface SpanishVoiceService {
  isInstalled(): Promise<boolean>;
  openInstaller(): Promise<void>;
}
```

- **`PhoneSpanishVoiceService`** usa `spanishVoice`, la misma función con la que
  `PhoneSpeakerService` elige la voz (RFC-004): hay voz en español si alguna tiene un idioma
  que empieza con `es`. `openInstaller` le pide a Android la pantalla de instalar voces con
  `Linking.sendIntent('android.speech.tts.engine.INSTALL_TTS_DATA')`; si el teléfono no la
  tiene, abre sus ajustes de voz.
- **`useSpanishVoiceNotice`** consulta al abrir y cada vez que la app vuelve a estar a la
  vista. Si no hay voz en español, suma a las tarjetas la de "Falta la voz en español" (RFC-003),
  con "Instalar voz" y la cruz. Deja de mostrarla si la persona la cierra o si la voz ya está.

### Tema según la luz y brillo al sol (F21 y F22)

```ts
export interface AmbientLightService {
  isAvailable(): Promise<boolean>;
  watch(onLux: (lux: number) => void): () => void;   // devuelve cómo dejar de escuchar
}
export interface ScreenBrightnessService {
  boost(): Promise<void>;     // brillo al máximo, solo en la app
  restore(): Promise<void>;   // vuelve al del teléfono
}
```

- **`nextThemeMode(lux, current): ThemeMode`**, función pura: con más de `lightAboveLux` (600),
  claro; con menos de `darkBelowLux` (150), oscuro; entre los dos, el que estaba.
- **`nextBrightness(lux, boosted): boolean`**, función pura: con más de `sunAboveLux` (10.000),
  verdadero; con menos de `sunBelowLux` (3.000), falso; entre los dos, lo que estaba.
- **`useAmbientTheme`** y **`useSunBrightness`** viven en la feature `home`. `App.tsx` monta un
  componente, `AmbientShell`, que los llama y le pasa el modo a `ThemeProvider`.
- El modo inicial es claro. Si el teléfono no tiene sensor, se usa el tema del sistema y el
  brillo no se toca.
- No se pide ningún permiso. Al salir de la app, el brillo vuelve al del teléfono.
- Los cuatro umbrales son ajustes, con sus variables `EXPO_PUBLIC_*`.

## Criterios de aceptación

**Entrega (Must)**

1. El server responde `GET /health` y `POST /interpret-audio` en una dirección https pública.
   Sus claves están cargadas como variables del servicio.
2. El APK de release compila y abre sin servidor de desarrollo.
3. Las cinco comprobaciones de la tabla "APK de release" dan lo esperado.
4. Con el server en https, `app.json` no pide tráfico sin cifrar.
5. Al abrir, la app llama a `GET /health`.
6. Las cuatro frases de la consigna dan el resultado de `docs/BATERIA.md` desde el APK
   instalado en un teléfono físico, contra el server publicado. Queda anotado.
7. La batería de `docs/BATERIA.md` se corrió con voz real: 18 de 20 o más. Queda anotado el
   resultado de cada frase.
8. El código está en GitHub con un commit por paso, y el APK está publicado en un Release.
9. Siguiendo solo el `README.md`, en una copia limpia del repositorio, se llega a la app
   corriendo y al server levantado.
10. `DECISIONS.md` tiene las nueve entradas de la lista, la de escalabilidad con sus cinco
    puntos, y el tope de gasto de cada proveedor.
11. `AI-USAGE.md` dice qué se usó y para qué en cada etapa.
12. Cada extra que no entró está en `DECISIONS.md` con su motivo.

**Manos libres (F19, Should)**

13. El interruptor está apagado al abrir la app.
14. Encendido y en reposo, decir la frase hace vibrar el teléfono y empieza una escucha.
15. Mientras espera la frase, el orbe sigue en reposo, el interruptor se ve encendido y el
    texto de estado dice que está esperando la frase.
16. No espera la frase durante un turno, con una propuesta en cuenta ni con la app en segundo
    plano. Después de un turno, vuelve a esperar sola.
17. Con el permiso denegado o si el detector no arranca, el interruptor se apaga y la app lo dice.
18. `voiceTransitions` tiene un test para `PhraseDetected`, y sigue pasando el de "de toda fase
    se puede volver a reposo".
19. Con el audio de prueba configurado, dejar un audio en la dirección hace que la app empiece
    un turno sin tocar nada: manos libres se puede probar sin voz.
20. Con manos libres encendido y sin decir la frase, el server no recibe ningún pedido.

**Entrada (F20, Should)**

21. Al abrir, la entrada corre con el orbe solo y el resto de la pantalla aparece al terminar.
22. Dura 3,5 segundos o menos, y empieza cuando el orbe ya está a la vista.
23. Con `EXPO_PUBLIC_LOGO_INTRO=0` la pantalla aparece directamente, con el orbe en su lugar.
24. No se repite al volver del segundo plano, y un toque durante la entrada no hace nada.
25. Sin la prop `intro`, el orbe se ve igual que en el RFC-003.

**Splash e ícono (F23, Should)**

26. La app instalada muestra el ícono adaptable de la marca, y al abrir, el splash sin salto
    de color.

**Frases grabadas (F27, Should)**

27. `npm run cues` genera los siete `.mp3` en `app/assets/cues/`.
28. Al empezar a pensar suena una muletilla, y las cinco se van turnando. El test de
    `BundledCuePlayerService` comprueba el turno con un doble del reproductor.
29. En modo avión, el aviso de sin señal suena con una frase grabada y el subtítulo muestra su
    texto.
30. Si el audio no se puede reproducir, el turno sigue y el aviso lo dice la voz del teléfono.
31. En modo avión, la muletilla y el aviso de sin señal no se pisan: el aviso empieza cuando
    la muletilla terminó. Se comprueba de oído en un teléfono y por el orden en el registro.

**Voz, tema y brillo (F18, F21 y F22, Should)**

32. Sin voces en español aparece la tarjeta de aviso. "Instalar voz" abre la pantalla del
    teléfono donde se instalan, y la cruz la cierra.
33. `nextThemeMode` tiene tests: claro arriba de 600, oscuro abajo de 150, sin cambio entre los
    dos y en los valores justos.
34. `nextBrightness` tiene tests: sube arriba de 10.000, baja abajo de 3.000, sin cambio entre
    los dos y en los valores justos.
35. Cambiar la luz cambia el tema y el brillo. En el emulador se prueba con
    `adb emu sensor set light`, y el brillo pedido se lee con `adb shell dumpsys window`.
36. La app no pide ningún permiso nuevo por el brillo ni por el sensor.

**Chequeos**

37. `npm run typecheck`, `npm run lint` y `npm test` pasan.

## Reglas que aplican

R1 a R7 (capas), R8 a R18 (piezas y nombres), R19 a R28 (componentes), R29 a R47 (estilo y
React), R48 a R51 (tests), R52 a R55 (server), R58 a R62 (proceso).

## Riesgos y casos límite

- **El detector se dispara solo.** Con una frase de dos palabras y la lista de palabras
  comunes se dispara mucho menos, pero puede pasar con frases que suenan parecido. Por eso
  manos libres está apagado por defecto.
- **Memoria.** Cargar el modelo de voz suma alrededor de 100 MB. Se carga recién al encender
  manos libres.
- **No hay voz argentina en el teléfono.** El motor de voz de Android ofrece español de España
  y de Estados Unidos. El acento depende de la voz de servicio.
- **Brillo al máximo** gasta más batería. En algunos teléfonos el brillo automático del
  sistema llega más alto al sol que lo que puede pedir una app: se compara en el teléfono real.
- **El server dormido.** El primer pedido después de un rato puede ir a la cola. La llamada a
  `/health` al abrir lo reduce; el reintento lo resuelve.
