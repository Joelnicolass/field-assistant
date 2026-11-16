# RULES · Field Assistant

Reglas técnicas del proyecto. Las siguen las personas y los agentes de IA. Cada regla tiene
un identificador permanente (`R1`, `R2`…): no se renumeran; una regla que se quita se marca
`[QUITADA]`.

**Tipo de producto:** app móvil para Android con un server mínimo sin estado. No aplican y se
omiten: autenticación, base de datos, internacionalización, web y diseño adaptable a otros
tamaños. Hay dos pantallas, la de inicio y el catálogo del design system, con un stack de
navegación (D24).

## 1. Stack

Versiones comprobadas en el registro de npm el 15-nov-2026. El RFC-001 instala los paquetes
de Expo con `npx expo install`, que elige la versión compatible con el SDK; si alguna difiere
de esta tabla, se corrige la tabla.

| Para qué | Paquete | Versión |
| --- | --- | --- |
| Base | `expo` (SDK 58), con prebuild y build local | ~58.0.25 |
| Base | `react-native` | 0.88.1 |
| Base | `react` | 19.3.0 |
| Base | `typescript`, en modo estricto | ~6.0.3 |
| Animaciones | `react-native-reanimated` | 4.7.1 |
| Animaciones | `react-native-worklets` | 0.13.0 |
| Dibujo | `react-native-svg` | 15.16.0 |
| Márgenes del teléfono | `react-native-safe-area-context` | ~5.11.1 |
| Grabar audio | `expo-audio` | ~58.0.12 |
| Voz del teléfono | `expo-speech` | ~58.0.4 |
| Archivo local y subida de audio | `expo-file-system` | ~58.0.13 |
| Sensor de luz | `expo-sensors` | ~58.0.5 |
| Brillo de pantalla | `expo-brightness` | ~58.0.3 |
| Tipografía | `expo-font` | ~58.0.12 |
| Splash | `expo-splash-screen` | 58.0.14 |
| Ajustes del build nativo | `expo-build-properties` | ~58.0.12 |
| Barra de estado | `expo-status-bar` | ~58.0.5 |
| Navegación | `@react-navigation/native` y `@react-navigation/native-stack` (D24) | ^7.5.2 y ^7.21.1 |
| Pantallas nativas del stack | `react-native-screens` | ~4.30.1 |
| Frase de manos libres | `react-native-vosk`, con el modelo `vosk-model-small-es-0.42` | ^2.2.0 |
| Tests | `jest` | 30.5.2 |
| Tests | `jest-expo` | 58.0.14 |
| Lint | `eslint` | 10.15.0 |
| Lint | `eslint-config-expo` | 58.0.4 |
| Formato | `prettier` | 3.10.1 |
| Server | Node, que corre TypeScript sin compilar | 24 o superior |
| Server | `express` | ^5.3.0 |
| Server | `@types/express` | ^5.0.6 |

Proveedores, detrás del server: un modelo de lenguaje que recibe audio y devuelve JSON
(Gemini Flash-Lite) y una voz de servicio (ElevenLabs Flash v2.5). El identificador exacto de
cada modelo lo fija el research del RFC-001.

No se usan: librería de estado global, librería de inyección de dependencias ni Expo Go (hay
módulos nativos). La navegación entre pantallas va con React Navigation (D24): un stack nativo
en `presentation/navigation`, con las rutas tipadas.

## 2. Arquitectura

Arquitectura limpia en capas. `domain` dice qué, `data` dice cómo y `di` los conecta.

### Capas y dependencias

| ID | Regla |
| --- | --- |
| R1 | **`domain` solo tiene contratos y tipos**: interfaces, tipos de datos y enums. No tiene lógica, no importa React, Expo ni nada fuera de `domain`. |
| R2 | **`data` implementa los contratos de `domain`.** Nada fuera de `di` importa de `data`. |
| R3 | **`data/usecases` importa solo de `domain`.** Ahí viven las reglas del campo. No toca Expo, `fetch`, archivos ni otra carpeta de `data`: recibe por constructor los contratos que necesita. |
| R4 | **`presentation` importa de `domain`, `shared`, `core` y del hook de dependencias de `di`.** Nunca importa de `data`. |
| R5 | **`shared` no conoce las features ni el dominio.** No importa de `presentation/features`, `domain`, `data` ni `di`. |
| R6 | **`core` no importa nada del proyecto.** |
| R7 | Estas dependencias se comprueban con ESLint (`no-restricted-imports` por carpeta). Un import prohibido rompe el lint. |

### Carpetas

```
app/src/
  domain/
    entities/        tipos de datos del campo, sin comportamiento
    enums/           conjuntos cerrados
    errors/          fallas esperadas y el tipo Result
    repositories/    contratos de acceso a datos
    datasources/     contratos de las fuentes de datos
    services/        contratos de capacidades del teléfono y de proveedores
    usecases/        contratos de las acciones
  data/
    usecases/        las reglas
    repositories/
    datasources/
    services/
    models/          la forma en que un dato viaja o se guarda
    mappers/         model ↔ entity
  di/                arma las implementaciones y las expone
  presentation/
    features/<feature>/
      components/
      hooks/
      states/
  shared/presentation/
    components/      el design system
    hooks/
    states/
    theme/
  core/configs/      ajustes y variables de entorno
server/src/          misma idea, en chico: domain, data, http
```

### Piezas

| ID | Regla |
| --- | --- |
| R8 | **Caso de uso:** una acción. Su contrato es una interfaz con un solo método, `execute(input)`. Su implementación es una clase chica que recibe sus dependencias por constructor. |
| R9 | **Repositorio:** acceso a los datos del campo. Usa datasources. |
| R10 | **Datasource:** una fuente concreta de datos: el archivo local, el server. |
| R11 | **Service:** una capacidad que no guarda datos: micrófono, voz, detector de frase, sensor de luz, brillo. |
| R12 | **Entidad:** un `type` con datos y sin métodos. |
| R13 | **Model y mapper:** solo donde la forma que viaja o se guarda difiere de la entidad. El mapper son funciones puras `toEntity` y `toModel`. |
| R14 | **Los hooks de una feature usan casos de uso para todo lo que toca datos del campo, y contratos de `domain/services` para las capacidades del teléfono.** No se crean casos de uso que solo reenvían una llamada a un service. |
| R15 | **Inyección a mano.** `di/container.ts` construye cada implementación una sola vez. Un proveedor de React la expone y un hook la entrega por contrato. Sin librería y sin decoradores. Los tests arman su propio contenedor con dobles. |

### Nombres

| ID | Regla |
| --- | --- |
| R16 | Contrato e implementación comparten nombre. La implementación suma `Impl` (`RegisterRainUseCase` → `RegisterRainUseCaseImpl`) o, si es de un proveedor, lleva la tecnología delante (`AudioRecorderService` → `ExpoAudioRecorderService`). |
| R17 | Un archivo por componente, hook, clase, contrato o tipo, con su nombre. Las funciones puras chicas de un mismo tema pueden compartir un archivo, con el nombre del tema. Componentes y tipos en `PascalCase`; hooks, funciones y mappers en `camelCase`. |
| R18 | Código e identificadores en inglés. Los textos que ve o escucha la persona, en español rioplatense. |

Ejemplo de las tres capas para una acción:

```ts
// domain/usecases/RegisterRainUseCase.ts
export interface RegisterRainUseCase {
  execute(input: RegisterRainInput): Promise<Result<RainReceipt>>;
}

// data/usecases/RegisterRainUseCaseImpl.ts
export class RegisterRainUseCaseImpl implements RegisterRainUseCase {
  constructor(private readonly farm: FarmRepository) {}

  async execute(input: RegisterRainInput): Promise<Result<RainReceipt>> { … }
}

// di/container.ts
const registerRain: RegisterRainUseCase = new RegisterRainUseCaseImpl(farmRepository);
```

## 3. Componentes y design system

| ID | Regla |
| --- | --- |
| R19 | **Cada componente en su carpeta**, con `Name.tsx` e `index.ts`. Sus estilos van en `styles.ts` y sus constantes en `constants.ts`: esos archivos existen cuando el componente tiene estilos o constantes. Si hace falta: `types.ts`, `useName.ts` y `helpers.ts`. |
| R20 | **Los componentes son presentacionales:** reciben datos y avisan con funciones. No llaman casos de uso ni leen `di`. |
| R21 | **La lógica vive en hooks.** El hook de una feature entrega a la pantalla todo resuelto: qué mostrar y qué hace cada botón. |
| R22 | **Estilos en `styles.ts`.** Si usan el tema, `styles.ts` exporta `createStyles(theme)` y el componente los pide con el hook de estilos de `shared`. En el componente solo quedan los estilos animados. |
| R23 | **Constantes en `constants.ts`:** los números y textos fijos del componente. Sin números sueltos en el componente. |
| R24 | **Un tema central** en `shared/presentation/theme`: colores, tipografía, tamaños de letra, espaciados, radios, sombras, duraciones y tamaños táctiles. Ningún componente escribe a mano un color, un tamaño de letra, un espaciado o un radio. Los valores salen de `VISUAL.md`. |
| R25 | **El design system** vive en `shared/presentation/components`: piezas presentacionales reutilizables (texto, superficie, botón, ícono, el orbe). No conocen el dominio: el orbe define sus propios estados y cada feature los traduce. |
| R26 | **Reutilizar antes de crear.** Antes de un componente nuevo se busca uno del design system que sirva o se pueda extender. |
| R27 | **Sin cajones de utilidades.** No hay carpetas `utils` ni `helpers` generales. Una función de ayuda es pura y vive al lado de quien la usa; pasa a `shared` cuando la usan dos features. |
| R28 | **Señales de que algo hay que dividirlo:** un componente de más de 120 líneas, una función de más de 25 o un hook con dos responsabilidades. |

```
Orb/
  Orb.tsx          dibuja
  styles.ts        createStyles(theme)
  constants.ts     tamaños, duraciones, textos
  useOrbMotion.ts  los valores animados
  index.ts         export { Orb }
```

## 4. Estilo de código

| ID | Regla |
| --- | --- |
| R29 | **Declarativo y funcional.** `map`, `filter`, `reduce` y composición de funciones. Sin mutar: `const` y copias. Sin bucles con índice salvo una necesidad medida. |
| R30 | **Enums para conjuntos cerrados:** estados, categorías, tipos de pedido. En la app, `enum` de texto. Nunca textos sueltos comparados con `===`. |
| R31 | **Objetos en lugar de condicionales.** Un `Record<Enum, …>` reemplaza a un `switch` o a una cadena de `if`. Si falta un caso, no compila. |
| R32 | **Funciones chicas que hacen una sola cosa**, con un nombre que dice qué devuelven o qué hacen. Hasta tres parámetros; con más, un objeto. |
| R33 | **Nombres que se explican solos**, sin abreviaturas. |
| R34 | **Comentarios: pocos.** Cada contrato de caso de uso y cada hook llevan un `/** … */` de una o dos líneas que dice qué hacen. Además, solo para un porqué que el código no puede decir, como una limitación de la plataforma. Nada de encabezados de archivo ni de explicar línea por línea. |
| R35 | **Sin validaciones de más.** Se confía en los tipos. Se valida solo en los bordes: lo que llega del server, del archivo guardado o de un módulo nativo. Sin `try/catch` que solo relanza o que esconde el error, y sin valores por defecto "por las dudas". |
| R36 | **TypeScript estricto:** sin `any`, sin `!`, y `as` solo en los mappers de borde. |
| R37 | **Las fallas esperadas son valores, no excepciones.** Un caso de uso que puede fallar devuelve `Result`: el valor o la falla con su código. Uno que no puede fallar devuelve el valor. |
| R38 | **Exports con nombre.** `index.ts` solo en carpetas de componente, salvo `app/index.ts`, el punto de entrada que registra la app en Expo. |
| R39 | **Sin pendientes:** nada de `TODO`, código muerto ni código comentado. |

```ts
// R30 y R31: el estado es un enum y lo que depende de él es un objeto
const STATUS_TEXT: Record<VoicePhase, string> = {
  [VoicePhase.Idle]: 'Tocá para hablar',
  [VoicePhase.Listening]: 'Te escucho',
  [VoicePhase.Thinking]: 'Pensando…',
  [VoicePhase.Speaking]: 'Tocá para interrumpir',
};
```

## 5. React

| ID | Regla |
| --- | --- |
| R40 | Solo componentes de función y hooks. |
| R41 | **Sin React Compiler.** Está apagado: en esta versión de Expo es experimental y la app no lo necesita (D20). `useMemo`, `useCallback` y `memo` se escriben solo con una medición que lo justifique. |
| R42 | **APIs actuales de React 19:** `ref` como una prop más (sin `forwardRef`), `use()` para leer contexto, `<Context value={…}>` como proveedor y `useEffectEvent` para la lógica de un efecto que no debe volver a dispararlo. |
| R43 | **Efectos solo para sincronizar con algo de afuera:** un sensor, el micrófono, un temporizador, el estado de la app. Lo que se puede calcular al dibujar se calcula, y no se guarda estado que se deriva de otro. |
| R44 | **Estado mínimo, con una máquina por feature.** Las fases son un enum y las transiciones un objeto, en `states/`, sin React. El hook las usa con `useReducer`. Lo que comparten dos features va por contexto en `shared/presentation/states`. |
| R45 | Las listas usan una `key` estable, no el índice. |
| R46 | **Animaciones con Reanimated, en el hilo de la interfaz.** Solo se animan posición, tamaño, giro y opacidad. Un estilo animado lee sus valores compartidos directamente, no dentro de otra función. |
| R47 | Todo lo que se toca tiene `accessibilityRole` y `accessibilityLabel`. |

## 6. Tests

| ID | Regla |
| --- | --- |
| R48 | Se testea con Jest: cada caso de uso, con dobles de sus contratos; cada mapper; y cada mapa de transiciones de estado. |
| R49 | Un test por regla, y su nombre dice la regla. |
| R50 | El test vive al lado de lo que prueba: `Name.test.ts`. |
| R51 | Los componentes presentacionales no llevan test salvo que el RFC lo pida. Lo que solo se ve en el teléfono se prueba a mano y se anota. |

## 7. Server

| ID | Regla |
| --- | --- |
| R52 | El server no guarda nada: recibe, llama al proveedor y contesta. Usa Express (D13), sin otras librerías de servidor. |
| R53 | Las claves viven solo en `.env`, que no se versiona. Hay un `.env.example` sin valores. |
| R54 | Mismas capas, en chico: contratos en `domain`, proveedores en `data` y rutas en `http`. |
| R55 | Como corre sin compilar, los conjuntos cerrados del server son objetos `as const` con su tipo derivado, no `enum`. |

## 8. Proceso

| ID | Regla |
| --- | --- |
| R56 | **Cinco RFCs como máximo.** El RFC-001 es el scaffold de Expo, todas las librerías y el research. |
| R57 | **Se implementa con `/build-rfc`:** un paso por vez, y el usuario revisa y aprueba cada paso antes del siguiente. |
| R58 | **Las APIs se verifican antes de usarlas,** en los tipos y el README instalados en `node_modules`. |
| R59 | **Un commit por paso aprobado,** con el formato `tipo: descripción` en español (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`). Sin push salvo pedido del usuario. |
| R60 | **`DECISIONS.md` registra las decisiones del usuario:** qué se usa, qué se hace y por qué. Va en el mismo commit que el código que la aplica. No es para justificar sugerencias de una revisión que no se tomaron, ni para elecciones que hizo un agente: esas se le muestran al usuario, y entran solo si él las hace suyas. El uso de IA va a `AI-USAGE.md`. |
| R61 | **Primero lo obligatorio.** Los requisitos `Must` del PRD van antes que los `Should`. |
| R62 | **Ante una duda, se pregunta o se anota el supuesto.** No se inventa un requisito ni una API. |

## 9. Autochequeo

Hay 62 reglas, de `R1` a `R62`, sin saltos ni repetidos. Las versiones de la tabla del stack
se consultaron en el registro de npm el 15-nov-2026.
