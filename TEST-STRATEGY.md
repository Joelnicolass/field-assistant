# Plan de tests · Field Assistant

**Tipo de producto:** app móvil para Android con un server mínimo. No aplican y se omiten:
tests de base de datos, de autenticación, de navegadores, de carga y de inyección. Sí aplican:
tests unitarios de las reglas, pruebas manuales en el teléfono y medición de latencia.

## Línea base

Todavía no hay código ni tests: todo lo que sigue es lo **propuesto**. Cuando un RFC se
implementa, el subagente `qa` corre la suite y pega la salida real.

## Qué se prueba y cómo

| Qué | Cómo | Regla |
| --- | --- | --- |
| Casos de uso (las reglas del campo) | Jest, con dobles de sus contratos | R48 |
| Mappers (lo que llega de afuera) | Jest, con documentos buenos y malos | R48 |
| Mapas de estados y transiciones | Jest, recorriendo el objeto | R48 |
| Funciones puras de presentación (textos, vistas) | Jest | R48 |
| Componentes presentacionales | Sin test: se revisan en el catálogo | R51 |
| Voz, micrófono, sensores y builds | A mano, en el teléfono, y se anota | R51 |

Un test por regla, con el nombre de la regla (R49), al lado del archivo que prueba (R50).

## Datos de prueba

- **Fecha fija:** los tests pasan `today` como dato. Nunca leen el reloj.
- **Datos iniciales:** `farmSeed(today)`, que es una tabla fija sin azar.
- **Dobles:** un repositorio en memoria que arranca con los datos iniciales, y dobles de los
  services que devuelven lo que el test les indica. Viven junto a los tests que los usan.
- **Audios:** tres audios cortos para los scripts del research, y los de la batería automática
  y del audio de prueba, hechos con la voz de la computadora (`scripts/make-audio.sh`).

## Por RFC

La prioridad de cada caso es la de su feature en `FEATURES.md`.

### RFC-001 · Base

| Caso | Tipo | Se espera |
| --- | --- | --- |
| `settings`: el valor por defecto de `serverUrl` | Unitario | `http://localhost:8787` |
| Un import prohibido entre capas | Comando (`npm run lint`) | El lint falla |
| `GET /health` | Comando | `200 { "ok": true }` |
| Build de debug y de release | Comando | Los dos compilan |
| La app abre en el teléfono | Manual | Se ve `ResearchScreen` |
| Las trece comprobaciones del research | Manual y scripts | Quedan anotadas en `docs/RESEARCH.md` |

### RFC-002 · Datos y reglas

Todos unitarios. Cubren los criterios 4 a 28 del RFC.

| Grupo | Casos |
| --- | --- |
| Datos iniciales | 8 lotes, 450 cabezas, lote 3 con 40 vaquillonas o más, lluvias dentro de los 60 días |
| Guardado | Lo guardado es lo que se lee; un documento mal formado vuelve a los datos iniciales |
| Lluvia | Propuesta válida, registro y total del mes, milímetros inválidos, fecha futura |
| Movimiento | Válido, lote que no existe, mismo lote, cantidad inválida, animales que no alcanzan, datos que cambiaron entre la propuesta y el registro |
| Consultas | Hoy, ayer, semana, mes, período sin lluvias, lote, lote que no existe |
| Resumen | Totales, última lluvia, lo anotado hoy |
| Fechas | Sumar y restar días cruzando un mes y un año |
| Corrección (Should) | Lluvia, movimiento, nada para corregir |

### RFC-003 · Design system y pantalla

| Caso | Tipo | Se espera |
| --- | --- | --- |
| Cada `OrbState` tiene ficha y colores en los dos temas | Unitario | Ninguno falta |
| `todaySummaryView`: última lluvia de hoy, de ayer, de hace días y sin lluvias | Unitario | El texto correcto en cada caso |
| Contraste y tamaños del tema | Comprobación sobre los valores | 4,5 a 1 o más; 20 sp o más |
| Cada pieza del catálogo, en todas sus variantes | Manual | Se ve como en `VISUAL.md` |
| Los cuatro estados del orbe se distinguen sin el color | Manual | Dibujo, movimiento y texto distintos |
| La pantalla sin red | Manual | El resumen se ve completo |
| Textos largos y números de cuatro cifras | Manual | No se cortan ni se pisan |

### RFC-004 · Server y turno de voz

| Caso | Tipo | Se espera |
| --- | --- | --- |
| `interpretationMapper` y `pendingAudioMapper`: documentos buenos y mal formados | Unitario | Aceptan uno, rechazan los otros |
| `readNumber`: un número, sin valor, vacío y un texto | Unitario | El número o el valor por defecto |
| `FallbackSpeakerService` y `spanishVoice` | Unitario | Usa la segunda voz cuando corresponde; elige una voz en español |
| `ResolveRequestUseCase`: cada pedido, cada falla, dato que falta, `unknown` | Unitario | La resolución correcta |
| La fecha de un pedido con "ayer" y un día de referencia | Unitario | El día anterior al de referencia |
| `RetryPendingAudiosUseCase`: orden, corte con una falla pasajera, falla definitiva, fecha de grabación y los ya entendidos | Unitario | Reintenta en orden, conserva lo que no pudo y no reenvía lo ya entendido |
| `listeningVerdict`: silencio, sin voz, tope | Unitario | Corta o cancela cuando corresponde |
| `voiceTransitions`: de toda fase se vuelve a reposo | Unitario | Ninguna fase queda sin salida |
| Un único lugar llama a `Register`, con una tarjeta de propuesta | Unitario y búsqueda en el código | No hay otra llamada |
| `spokenReply`: cada resolución y cada falla | Unitario | La oración esperada |
| `soundQueue`: dos sonidos seguidos, pedir silencio y un sonido que no termina | Unitario | Suenan de a uno y la cola no se traba |
| `cardView`: cada tarjeta | Unitario | Los datos de la tarjeta |
| Rutas del server: `400`, `413`, `502` y `200` | Comando (`curl`) | El código correcto |
| Un turno completo con audio de prueba | En el emulador, sin voz (`qa` lo puede correr) | Tarjeta y respuesta correctas |
| La batería automática, `npm run eval` | Comando, contra el modelo real | Nueve de cada diez casos o más |
| Las cuatro frases de la consigna, con voz real | Manual | Tarjeta y respuesta correctas |
| Dato que falta, y su respuesta | Manual | Pregunta, vuelve a escuchar y completa |
| Micrófono denegado | Manual | Tarjeta con el botón a los ajustes |
| Sin red, y la vuelta de la señal | Manual | Guarda, avisa y después pide confirmar |
| Segundo plano durante la cuenta | Manual | No se anota sola |
| Latencia de diez turnos | Medición | 5 segundos o menos; se anota |

### RFC-005 · Extras y entrega

| Caso | Tipo | Se espera |
| --- | --- | --- |
| La función del tema: 600 y 150 lux | Unitario | Cambia solo fuera de la franja |
| La función del brillo: 10.000 y 3.000 lux | Unitario | Cambia solo fuera de la franja |
| La transición de `PhraseDetected` | Unitario | En reposo lleva a escuchando, y de toda fase se vuelve a reposo |
| `BundledCuePlayerService`: las frases se turnan | Unitario | Suenan en orden, sin repetir hasta dar la vuelta |
| Manos libres con audio de prueba | En el emulador, sin voz | Empieza un turno sin tocar nada |
| Sin señal, con las frases grabadas | Manual, en modo avión, en un teléfono | El aviso suena después de la muletilla, sin pisarse, y el subtítulo muestra su texto |
| Manos libres: detecta la frase, y no se dispara con otra conversación | Manual, con voz real | Se cuentan aciertos y falsos disparos |
| La entrada, encendida y apagada | Manual | Corre o no corre, y dura 3,5 segundos o menos |
| Cambiar la luz en el teléfono o el emulador | Manual | Cambian el tema y el brillo |
| Las cuatro frases desde el APK de release, en un teléfono físico | Manual | Dan bien; queda anotado |
| La batería de `docs/BATERIA.md` | Manual, con voz real | 18 de 20 o más dan bien |
| Compilar desde cero con el README | Manual | Se logra sin ayuda |

## Orden de ejecución

El de los RFC. En cada paso de `/build-rfc`, `qa` corre los tests del paso y los chequeos
(tipos y lint). Al cerrar un RFC se corre la suite completa.

## Lo que queda a mano

- Todo lo que depende de la voz real: entender, la frase de manos libres y el ruido de fondo.
- Lo visual: el orbe, las tarjetas y la entrada.
- La latencia, la memoria y el brillo en un teléfono de gama media.
- La instalación del APK desde el Release.

Cada prueba manual se anota en `docs/RESEARCH.md` con la fecha, el teléfono y el resultado,
salga bien o mal.

## Autochequeo

Las features citadas existen en `FEATURES.md` y las reglas en `RULES.md` (R48 a R51). Cada
tabla corresponde a un RFC de `RFCS.md`, de 001 a 005.
