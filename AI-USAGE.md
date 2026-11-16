# Uso de IA

Qué herramienta de IA se usó y para qué. Las decisiones y la revisión de cada paso son del autor.

## Herramienta

Claude Code (Claude Opus), en la app de escritorio, con comandos y subagentes propios del
proyecto (`.claude/`).

## Planificación

- Redactar el PRD a partir de la consigna, revisarlo (`PRD-REVIEW.md`) y extraer las features.
- Escribir `RULES.md`, los cinco RFCs y la estrategia de tests.
- Leer cada RFC en frío buscando lo que habría que adivinar para implementarlo
  (`reviews/COLD-READ-RFC-*.md`).
- Armar `VISUAL.md` a partir de las referencias visuales que eligió el autor.

## RFC-001 · Base, librerías y research

- Dividir el RFC en seis pasos (`RFCs/RFC-001-PLAN.md`), que el autor aprobó uno por uno antes
  de cada commit.
- Pasos 1 a 4: un subagente `dev` implementó cada paso y un subagente `qa` lo probó contra los
  criterios del RFC y las reglas. Pasos 5 y 6, más chicos: los implementó y probó el
  orquestador directamente.
- Verificar las APIs de Expo, React Native y las librerías en los tipos y el README instalados.
- Compilar los builds de Android, instalarlos en el teléfono por `adb` y tomar capturas.
- Correr las comprobaciones del research y los scripts contra los proveedores, y anotar los
  resultados en `docs/RESEARCH.md`.
- Generar los audios de prueba con la voz de la computadora (`say`).

Lo que decidió el autor en este RFC: usar Express en el server (D13), apagar React Compiler
(D20), cómo se reparten los pasos en ramas y PRs, y cerrar el paso 5 con las pruebas de voz real
pendientes.

## RFC-002 · Datos y reglas del campo

- Dividir el RFC en pasos e implementarlos: el dominio, el archivo del campo, los nueve casos de
  uso y sus tests, uno por criterio.
- Simplificar el mapper y los tests cuando el autor lo pidió.
- Escribir `reviews/REVIEW-RFC-002.md`, a pedido del autor, en la misma sesión.

Lo que decidió el autor en este RFC: "lo anotado hoy" cuenta por el día en que se anotó (D21), un
mapper mínimo y un comentario corto en cada caso de uso y cada hook (R34).

## RFC-003 · Design system y pantalla de inicio

- Implementar el tema, la tipografía, `AppText`, `Icon`, `Surface`, `AppButton`, `InfoCard`, el
  orbe, `RevealText`, la pantalla de inicio y la zona de voz, siguiendo `RULES.md`.
- Probar cada paso en el teléfono por Metro, con capturas por `adb`.
- Medir la fluidez con `dumpsys gfxinfo` y bajar el tiempo por cuadro de 44 a 9 ms: el orbe
  monta cada capa una sola vez, y Reanimated aplica las animaciones directo a la vista (D22).
- Comparar el orbe y el resumen con las capturas del autor y ajustar `VISUAL.md` a lo que se
  decidió.

Lo que decidió el autor en este RFC: las decisiones visuales V1 a V4 (`VISUAL.md`), el orbe más
parecido a su referencia, el resumen con el orden de su captura, el nombre de la app que alterna
entre "Field Data" y "Field Assistant", encender la opción de Reanimated (D22) y dejar el
catálogo en la app (D23).

## RFC-004 · Server y turno de voz

- Dividir el RFC en seis pasos (`RFCs/RFC-004-PLAN.md`). Los pasos A, B y D los implementó el
  orquestador; C, E y F, un subagente `dev`, con un subagente `qa` que los probó en el teléfono.
- Escribir el server: las rutas para entender un audio y para hablar, los errores y la clave de
  la app; el Dockerfile y la publicación en Railway.
- Armar la batería automática contra el modelo real y ajustar las instrucciones con lo que falló.
- Implementar el turno de voz en la app: escuchar, entender, proponer con la cuenta, anotar,
  preguntar, la cola de audios guardados y lo que la app dice.
- Probar los turnos en el teléfono con audio de prueba, medir la latencia y buscar en el registro
  la causa de las fallas (la voz que no sonaba y el grabador que se usaba después de liberarlo).

Lo que decidió el autor en este RFC: la navegación con React Navigation (D24), la voz "Cande"
(D25), publicar el server con Docker y una clave de la app, que el resumen se actualice con un
callback desde la pantalla de inicio, sin trucos de tipos, la voz en streaming y siempre la misma
en un turno, cómo se reintentan y se muestran los audios guardados, el texto para el servicio
saturado, y las cinco categorías en la tarjeta de un lote.

## RFC-005 · Extras y entrega

- Dividir el RFC en seis pasos (`RFCs/RFC-005-PLAN.md`). Por pedido del autor, los pasos los
  implementa el orquestador directamente, y la prueba en el teléfono la hace el autor.
- Paso A: el ícono, el despertar del server al abrir, el APK de release con sus comprobaciones,
  la entrada del logo en el orbe fusionada con el splash, el desenfoque detrás de las tarjetas y
  el fundido de la lista.
- Corregir la cola de audios guardados: la píldora aparece al guardar y reintenta al tocarla.
- Pasos C y E (manos libres, tema según la luz y brillo) en paralelo, y el merge de los tres.
- Paso D: el script que graba las frases con la voz de la app, la muletilla al pensar, el aviso
  sin señal grabado y la tarjeta de la voz en español; el desenfoque en tema oscuro.

Lo que decidió el autor en este RFC: el desenfoque con `expo-blur` y las tarjetas a todo el alto
(D26), el splash como primer cuadro de la entrada (D27), y hacer los pasos sin subagentes.
