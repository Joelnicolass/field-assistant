# Review · RFC-002 · Datos y reglas del campo

- **Fecha:** 16-nov-2026.
- **Quién:** el orquestador, en la misma sesión de la implementación, por pedido del autor. No es
  una lectura independiente.

## Veredicto

**Aprobado.** Los 35 criterios se cumplen. 46 tests, `typecheck` y `lint` pasan, y la app abre en
el teléfono con todo conectado en `di`.

## Cambios respecto del RFC, decididos por el autor

- **`notedOn`** en lluvias y movimientos: "lo anotado hoy" cuenta por el día en que se anotó
  (D21, criterio 27).
- **El mapper** comprueba solo la versión y las tres listas: el archivo lo escribe la app
  (criterio 9).
- **R34** permite un comentario corto en cada contrato de caso de uso y en cada hook.

## Observaciones

- Las reglas no tienen un test por archivo: los prueban los tests de los casos de uso, uno por
  criterio. Solo `dates` y `nextId` tienen el suyo.
- `farm.json` todavía no se probó en el teléfono: se ve cuando el resumen de hoy lo lea (RFC-003).
- Para el RFC-004: un mismo turno repetido (un reintento o un doble toque) anotaría dos veces. Los
  ids son números; hace falta identificar el turno.
