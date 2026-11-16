# RFCs · Field Assistant

Cinco RFCs, el máximo que fija `RULES.md` (R56). Se implementan en este orden, uno por vez,
con `/build-rfc <id>`: un paso por vez, con revisión y aprobación del usuario en cada paso.

## Orden de implementación

| RFC | Qué deja | Features | Predecesores | Complejidad | Minutos | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| [001](RFCs/RFC-001-base-librerias-research.md) | Proyecto armado, librerías, server mínimo y research | F26 | Ninguno | Media | 30 | Terminado |
| [002](RFCs/RFC-002-datos-y-reglas.md) | Los datos y las reglas del campo, con tests y sin pantalla | F17, y los datos de F5, F6, F7, F8, F9, F10 y F11 | 001 | Media | 35 | Terminado |
| [003](RFCs/RFC-003-design-system-y-pantalla.md) | El design system y la pantalla de inicio | F11, y lo visual de F2, F3, F7, F8, F12, F13, F14, F15 y F16 | 001 y 002, y `VISUAL.md` | Media | 55 | Pendiente |
| [004](RFCs/RFC-004-server-y-turno-de-voz.md) | El server y el turno de voz, con los errores con salida | F1, F3, F4, F12, F13, F14, F15 y F16, el flujo de F5, F6, F7, F9, F10 y F11, F2 conectada, y F8 | 001, 002 y 003 | Alta | 70 | Pendiente |
| [005](RFCs/RFC-005-extras-y-entrega.md) | La entrega y los extras | F24, F25, F18, F19, F20, F21, F22, F23 y F27 | 001 a 004, y `VISUAL.md` | Alta | 50 | Pendiente |

Los minutos suman 240: la ventana de 4 horas del PRD.

## Dependencias

```
001 ──► 002 ──► 003 ──► 004 ──► 005
```

Es una sola línea: cada RFC necesita a todos los anteriores. El 003 y el 005 necesitan además
`VISUAL.md`, que se arma con `/create-visual-guide` antes de empezar el 003.

| RFC | Lo usan después |
| --- | --- |
| 001 | 002, 003, 004 y 005 |
| 002 | 003 (el resumen), 004 (las reglas) y 005 |
| 003 | 004 (las tarjetas y el orbe) y 005 (la entrada, el interruptor y la tarjeta de aviso) |
| 004 | 005 |
| 005 | Ninguno |

## Dónde se implementa cada feature

| Feature | Prioridad | RFC |
| --- | --- | --- |
| F1 · Escuchar con un toque | Must | 004 |
| F2 · El estado del micrófono | Must | 003 (el orbe) y 004 (conectado) |
| F3 · Respuesta hablada con subtítulo | Must | 003 (el subtítulo) y 004 (la voz) |
| F4 · Entender el pedido | Must | 004 |
| F5 · Registrar lluvia | Must | 002 (reglas) y 004 (flujo) |
| F6 · Mover animales | Must | 002 (reglas) y 004 (flujo) |
| F7 · Proponer antes de anotar | Must | 002 (dos pasos), 003 (tarjeta) y 004 (la cuenta) |
| F8 · Corregir lo último | Should | 002 (reglas), 003 (tarjeta) y 004 (flujo) |
| F9 · Consultar lluvia | Must | 002 (cálculo) y 004 (flujo) |
| F10 · Consultar un lote | Must | 002 (cálculo) y 004 (flujo) |
| F11 · Resumen de hoy | Must | 002 (cálculo), 003 (pantalla) y 004 (se actualiza al anotar) |
| F12 · Micrófono denegado | Must | 003 (tarjeta) y 004 (flujo) |
| F13 · Cola de audios sin señal | Must | 003 (tarjetas) y 004 (flujo) |
| F14 · No entendió | Must | 003 (tarjeta) y 004 (flujo) |
| F15 · Preguntar lo que falta | Must | 003 (tarjeta) y 004 (flujo) |
| F16 · Siempre hay una salida | Must | 003 (cada tarjeta) y 004 (las fases) |
| F17 · Datos iniciales y guardado | Must | 002 |
| F18 · Aviso de voz en español | Should | 005 |
| F19 · Manos libres | Should | 005 |
| F20 · Entrada con el logo | Should | 005 |
| F21 · Tema según la luz | Should | 005 |
| F22 · Brillo al sol | Should | 005 |
| F23 · Splash e ícono | Should | 005 |
| F24 · APK de release | Must | 001 (compila) y 005 (se entrega) |
| F25 · Documentos de entrega | Must | 001 (se empiezan) y 005 (se completan) |
| F26 · Base técnica y research | Must | 001 |
| F27 · Frases grabadas | Should | 005 |

Las 27 features tienen RFC. Las 19 `Must` quedan completas al terminar el RFC-005, y lo
obligatorio de la consigna funciona desde el RFC-004.

## Antes de empezar cada RFC

| RFC | Hace falta |
| --- | --- |
| 001 | Las claves de los proveedores, saber si hay un teléfono físico (Q7 del PRD) y confirmar los minutos por etapa (Q8) |
| 003 | `VISUAL.md` |
| 005 | Una cuenta de Railway para publicar el server, y el repositorio en GitHub |

## Cómo se implementa

`/build-rfc <id>` divide el RFC en pasos y espera tu aprobación del plan. Después, por cada
paso: el subagente `dev` implementa, `qa` prueba, y el flujo se detiene para que revises el
código. Recién con tu aprobación hace el commit y sigue. Al terminar el RFC, `/review-rfc <id>`
en una sesión nueva.
