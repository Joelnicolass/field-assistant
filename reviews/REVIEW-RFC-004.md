# Review · RFC-004 · Server y turno de voz

- **Fecha:** 16-nov-2026.
- **Quién:** el orquestador, en la misma sesión de la implementación, por pedido del autor. No es
  una lectura independiente.

## Veredicto

**Aprobado.** `typecheck`, `lint` y los 151 tests pasan en `app/`, y `typecheck` en `server/`. El
turno de voz anda de punta a punta en el teléfono contra el server local, y el server publicado en
Railway entiende y habla con la clave de la app.

## Lo que se demostró

- **Server:** las rutas, los errores (400, 413, 502 y 401 sin clave) y el registro, con `curl`
  (criterios 1 a 7).
- **Batería:** el modelo entendió los 16 casos que contestó; 10 fueron fallas del proveedor
  (criterios 52 a 54, `docs/RESEARCH.md`).
- **En el teléfono, con audio de prueba:** las cuatro frases de la consigna, el voseo, la pregunta
  y su respuesta, "no entendí", nadie habló, cancelar, la cuenta, los toques, la cola sin red y con
  red, el segundo plano y la corrección.
- **Latencia:** mediana de 2,7 s en diez turnos (criterio 49).
- **Android 16:** la app instala y abre en el emulador.

## Cambios respecto del RFC, decididos por el autor

- Navegación con React Navigation (D24) y voz "Cande" (D25).
- `/speak` es `GET` con streaming; la voz del teléfono entra solo si la del server falla o no
  empieza en 4 s, y sigue hasta el próximo turno.
- El resumen se actualiza con un callback desde `HomeScreen`, sin `RefreshSignal`.
- La cola manda los audios de a uno, se reintenta cada 20 s, al volver a la app y después de un
  turno que salió bien, y muestra una tarjeta a la vez.
- Con el servicio saturado la app dice "Enviaré tu audio enseguida…".
- La tarjeta de un lote muestra las cinco categorías.

## Observaciones

- **Sin probar en el teléfono:** el permiso denegado con el botón a los ajustes (36), tocar
  mientras escucha (15), un pedido nuevo en lugar de la respuesta (33), la tercera pregunta
  seguida (34; el test del reducer pasa) y `Register` que falla (28).
- **Las dos fallas que encontró la prueba con el micrófono real:** `setAudioModeAsync` dejaba sin
  sonido a la voz del server en Android, y el grabador leía el archivo después de liberarlo. Las
  dos están corregidas; la causa queda en el registro con `[falla]`.
- **R28:** `useVoiceTurn` y `useVoiceStage` tienen 26 líneas.
- **Para el RFC-005:** que la app use la dirección de Railway en el build de entrega, la pantalla
  de ajustes con el calibrador del umbral de voz (pedida por el autor) y crear un reproductor al
  abrir la app para que la primera frase no tarde.
