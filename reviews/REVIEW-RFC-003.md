# Review · RFC-003 · Design system y pantalla de inicio

- **Fecha:** 16-nov-2026.
- **Quién:** el orquestador, en la misma sesión de la implementación, por pedido del autor. No es
  una lectura independiente.

## Veredicto

**Aprobado.** `typecheck`, `lint` y los 63 tests pasan. La app abre en la pantalla de inicio con
los datos de `farm.json`, también en modo avión, y el catálogo muestra cada pieza en los dos
temas.

## Cambios respecto del RFC, decididos por el autor

- **El catálogo se queda** como pantalla aparte, con "Ver el DS" y "Volver" (D23).
- **El encabezado** muestra el logo y el nombre de la app, que alterna entre "Field Data" y
  "Field Assistant"; el nombre del campo va en el renglón de abajo (criterio 18).
- **El resumen** sigue el orden de la captura del autor: el aviso de lo anotado, los datos con su
  unidad y el panel de cabezas por lote. `VISUAL.md` 7.1 quedó con esos valores.
- **El orbe** se acercó a la referencia nueva (aro, filo y manchas, VISUAL 5.1) y el aro se
  aplasta con la esfera al presionar.
- **D22:** Reanimated aplica `transform` y `opacity` directo a la vista. El cuadro baja de 20 a
  10 ms en desarrollo y queda en 8–9 ms en producción.

## Observaciones

- **Fuera del plan, para el RFC:** `VoiceStageView` suma `busy`, y `OrbStateSpec` suma
  `barsLevel` (las barras al hablar).
- **Criterio 14:** `uiautomator dump` no lee la pantalla mientras el orbe se anima. El área
  táctil se midió con `dumpsys activity top`: 168 dp más 20 de `hitSlop`; achicado, 0,56 de eso
  (unos 116 dp).
- **Pendiente para iterar:** el subtítulo se superpone con el panel de lotes mientras aparece, y
  muestra manchas grises durante el desenfoque.
- **Para el RFC-005:** la píldora "Manos libres" y el ícono de la app, que el autor ya entregó.
