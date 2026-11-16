# Review · RFC-001 · Base del proyecto, librerías y research

- **Fecha:** 16-nov-2026.
- **Rama:** `feature/rfc-001`, con los seis pasos mergeados (PR #3 a #8).
- **Quién:** el orquestador, en la misma sesión de la implementación, por pedido del autor para no
  perder tiempo. No es una lectura independiente: conviene tenerlo en cuenta.
- **Contra qué:** los 20 criterios del RFC-001, las reglas que el RFC lista y los documentos de
  más autoridad.

## Veredicto

**Aprobado con observaciones.** Los criterios de proyecto, chequeos, server y builds se cumplen
con evidencia. Del research, el criterio 17 se cumple en parte: Q5 está contestada (un turno
tarda de 1,8 a 4 s), Q4 quedó medida pero la voz la elige el autor, y Q2 sigue abierta porque
la frase de manos libres se prueba con voz real en el RFC-005. Ninguna observación frena al
RFC-002.

## Criterios de aceptación

| # | Criterio | Estado | Evidencia |
| --- | --- | --- | --- |
| 1 | Expo SDK 58, TypeScript estricto, `app.json` del punto 2 | Cumple | `npx expo config` (paso 1) |
| 2 | Todas las librerías del stack y los tres plugins | Cumple | `npx expo install --check` y `npm ls` (paso 1) |
| 3 | Alias `@/` en tsc, app y Jest | Cumple | tsc, el test de `settings` y `expo export` (paso 2) |
| 4 | Script del modelo y `.gitignore` | Cumple | descarga probada desde cero; `model-es`, `.env` y `android/` ignorados |
| 5 | `vosk-words.py` con código 0 o 1 | Cumple | `hola asistente` → 0; `hola zzqx` → 1 |
| 6 | Archivos del punto 3 | Cumple | `core/configs`, `di/`, `App.tsx` y la feature `research` |
| 7 | React Compiler apagado (D20) | Cumple | `app.json` sin `experiments.reactCompiler` |
| 8 | `typecheck`, `lint`, `format` y `test` sin errores | Cumple | corridos al cerrar el paso 6 |
| 9 | `settings.test.ts` con el valor por defecto | Cumple | 2 tests pasan |
| 10 | Un import prohibido rompe el lint | Cumple | `core` → `di` (R6), `presentation` → `data` (R4), `shared` → features (R5) |
| 11 | Server en 8787, `/health` y `404` | Cumple | `npm start` y `curl` al cerrar el paso 6 |
| 12 | `typecheck` del server | Cumple | sin errores |
| 13 | `.env.example` y carpetas del server | Cumple, con una diferencia | tiene las tres variables y dos opcionales más (`GEMINI_MODEL`, `ELEVENLABS_VOICE_ID`) |
| 14 | Debug instalado en Android 11, abre `ResearchScreen` | Cumple | moto e40, capturas en los pasos 4 y 5 |
| 15 | Release con R8 y peso anotado | Cumple | 76,9 MB (I7) |
| 16 | `RESEARCH.md` con las comprobaciones, fecha, dispositivo, esperado y resultado | Cumple | doce comprobaciones (I12 quitada) |
| 17 | Q2, Q4 y Q5 contestadas | **Cumple en parte** | Q5 contestada (I13); Q4 medida con "Sarah", falta que el autor elija (neutra gratis o argentina paga); Q2 sin elegir (I5 pendiente) |
| 18 | Un botón por comprobación en el teléfono | Cumple | I1, I4, I5, I9, I10 e I11 en `ResearchScreen` |
| 19 | Audios de prueba y comandos de research | Cumple | `server/scripts/samples/`, `research:interpret` y `research:speak` |
| 20 | `README.md`, `DECISIONS.md` y `AI-USAGE.md`, y los comandos del README andan | Cumple | probados los que no compilan; los builds, en el paso 4 |

## Reglas

| Regla | Estado | Nota |
| --- | --- | --- |
| R1 a R7 (capas) | Cumple | el lint las hace cumplir |
| R15 (inyección a mano) | Cumple | `container` y `DependenciesProvider` por prop |
| R17 a R23 (archivos y componentes) | Cumple | cada componente en su carpeta, estilos y constantes aparte |
| R28 (señales para dividir) | Observación | `useRecordingCheck` pasa las 25 líneas por función. Es código de research que borra el RFC-003 |
| R34 (comentarios) | Cumple | un solo comentario, con su porqué, en `eslint.config.js` |
| R36 y R39 | Cumple | sin `any`, sin `!`, sin `TODO` |
| R41 (sin memoización a mano) | Cumple | |
| R42 (`use()` y `<Context value>`) | Cumple | `useDependencies` y `DependenciesProvider` |
| R45 (keys estables) | Observación | `CheckCard` usa el texto de cada renglón como `key`; dos renglones iguales chocarían. Research |
| R52 a R55 (server) | Cumple | Express, sin estado, `.env` fuera de git |
| R58 (APIs verificadas) | Cumple | cada API se miró en `node_modules` |
| R59 (un commit por paso aprobado) | Cumple | más un commit aparte para apagar React Compiler |
| R60 (`DECISIONS.md`) | Observación | falta decidir si se adopta desactivar `import/no-unresolved`, `import/namespace` e `import/no-duplicates` |

## Contradicciones y documentos para corregir

1. **R46 contra I10.** R46 dice que un estilo animado tiene que leer el valor compartido
   directamente, "no dentro de otra función". En el teléfono, una función `'worklet'` que recibe
   el valor también lo sigue. Hay que ajustar el texto de R46 o dejarlo como recomendación.
2. **El RFC-001 contra I8.** El RFC esperaba que la caché de Metro conservara el valor viejo de
   `EXPO_PUBLIC_*`; lo conserva Gradle. Está anotado en `RESEARCH.md`; la fila del RFC sigue con
   la expectativa original, como registro.
3. **Tabla del stack de `RULES.md`.** Faltan `@types/node` (server) y `@jest/globals` (app), y
   `expo-splash-screen` figura sin `~`.
4. **PRD, preguntas abiertas.** Q7 (teléfono) y Q8 (minutos) siguen como abiertas: Q7 se
   resolvió con el moto e40. Q1 todavía pregunta hasta cuándo queda publicado el server.

## Lo que hereda cada RFC

- **RFC-003:** decidir si el orbe respeta "reducir animaciones" (el moto e40 la tiene activada y
  Reanimated salta al final); con `.set()` y `.get()` para los valores compartidos, por el lint.
- **RFC-004:** campos obligatorios con `null` en el esquema del modelo; límite de tiempo en el
  server (la cola llega a 17 s); el `503` de Gemini como falla técnica, con el audio a la cola;
  un handler de errores que conteste JSON.
- **RFC-005:** Q4 (voz neutra o argentina paga); la frase de manos libres (I5, Q2);
  "vaquillonas" y "mové" no están en el vocabulario de Vosk.
