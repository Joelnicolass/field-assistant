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
  orbe, `RevealText`, la pantalla de inicio y la zona de voz, tomando como guía una
  implementación de referencia y adaptándola a `RULES.md`.
- Probar cada paso en el teléfono por Metro, con capturas por `adb`.
- Medir la fluidez con `dumpsys gfxinfo` y bajar el tiempo por cuadro de 44 a 9 ms: el orbe
  monta cada capa una sola vez, y Reanimated aplica las animaciones directo a la vista (D22).
- Comparar el orbe y el resumen con las capturas del autor y ajustar `VISUAL.md` a lo que se
  decidió.

Lo que decidió el autor en este RFC: las decisiones visuales V1 a V4 (`VISUAL.md`), el orbe más
parecido a su referencia, el resumen con el orden de su captura, el nombre de la app que alterna
entre "Field Data" y "Field Assistant", encender la opción de Reanimated (D22) y dejar el
catálogo en la app (D23).
