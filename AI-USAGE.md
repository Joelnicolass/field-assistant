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
