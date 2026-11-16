---
description: "Construye un RFC por pasos: plan → tu OK → dev implementa un paso → qa lo prueba → pausa para tu revisión."
argument-hint: "<id-del-rfc>"
---

RFC objetivo: el ID que viene después de este comando. Si no vino ninguno, preguntá cuál.

En este proyecto este comando reemplaza a `/implement-rfc`. Vos sos el **orquestador**: no
escribís código de producto. Planificás, delegás en los subagentes `dev` y `qa`, y te detenés
para que el usuario revise. Nunca se implementa un RFC entero de un tirón.

## Antes de empezar

1. Leé `CLAUDE.md`, `RULES.md`, `RFCS.md`, el RFC y `TEST-STRATEGY.md`. Si el RFC tiene
   pantallas, leé `VISUAL.md`; si no existe, pará y pedilo.
2. Comprobá en `RFCS.md` que los RFC predecesores estén terminados. Si falta alguno, pará.
3. Si existe `RFCs/RFC-<id>-PLAN.md`, retomá desde el primer paso sin aprobar.

Orden de autoridad: `CHALLENGE.md` > `PRD.md` > `FEATURES.md` > `RULES.md` > `VISUAL.md` > RFC
> plan. Si dos documentos se contradicen, decilo, seguí el de mayor autoridad y marcá el otro
para corregir.

## Fase 1 · Plan (sin código)

Dividí el RFC en **pasos**. Un paso es algo que el usuario puede revisar de una sentada: un
objetivo, pocos archivos, y que deja el proyecto compilando. Entre tres y seis pasos por RFC.

Para cada paso escribí:

- **Objetivo**, en una línea.
- **Árbol de archivos**, con `[+]` nuevo, `[~]` modificado y `[-]` borrado, y qué hace cada uno.
- **Criterios de aceptación** del RFC que cubre.
- **Cómo lo va a comprobar `qa`**: qué tests y qué comandos.

Guardá el plan en `RFCs/RFC-<id>-PLAN.md`, con el estado de cada paso (`pendiente`,
`en revisión`, `aprobado`). Mostralo y **esperá la aprobación explícita del usuario**. Si pide
cambios, corregí el plan y volvé a mostrarlo.

## Fase 2 · Un paso por vez

Para el primer paso sin aprobar:

1. **`dev` implementa.** Pasale el RFC, el paso completo y lo que el usuario haya pedido
   cambiar. Solo ese paso.
2. **`qa` prueba.** Pasale el paso y lo que devolvió `dev`.
3. **Si `qa` devuelve `VUELVE A DEV`**, mandáselo a `dev` con el reporte. Dos vueltas como
   máximo; si sigue fallando, pará y mostrale el problema al usuario.
4. **Detenete.** Marcá el paso `en revisión` y mostrale al usuario:
   - qué cambió, archivo por archivo, en una línea cada uno;
   - por dónde conviene empezar a leer;
   - la tabla de `qa`, con lo que quedó `MANUAL` y cómo probarlo;
   - las decisiones que `dev` tomó fuera del plan.
5. **Esperá.** No sigas hasta que el usuario lo apruebe. Si pide cambios, volvé al punto 1 con
   sus comentarios y repetí la prueba.
6. **Cuando aprueba**, hacé un commit solo con ese paso, marcalo `aprobado` en el plan y
   preguntá si seguís con el siguiente.

Nunca hagas dos pasos seguidos sin aprobación. Nunca empieces otro RFC.

## Al terminar el último paso

1. Corré la verificación completa del RFC: tipos, lint, tests y el build que el RFC pida.
   Pegá la salida real. Un criterio de aceptación está cumplido cuando se demostró.
2. Marcá el RFC como terminado en `RFCS.md`.
3. Mostrale al usuario las decisiones que él tomó en este RFC y, con su OK, anotalas en
   `DECISIONS.md`: es su registro, no el de los agentes. En `AI-USAGE.md` anotá qué hizo la IA.
4. Recomendale al usuario correr `/review-rfc <id>` en una sesión nueva.

## Límites

- Solo lo que dice el RFC. Lo que dependa de otro RFC se anota, no se implementa.
- Un arreglo de una o dos líneas que pida el usuario al revisar lo podés hacer vos. Todo lo
  demás va por `dev`.
- No se hace push salvo que el usuario lo pida.
