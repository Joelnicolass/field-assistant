# Consigna del challenge

Es la fuente de mayor autoridad del proyecto: si otro documento la contradice, gana este.
Está copiada tal cual; no se edita.

---

**Challenge · Mobile Engineer** — FieldData · Take-home · Asistente de campo por voz para Android

Un productor en la Cuenca del Salado: sol del mediodía, guantes puestos, poca señal y ruido
de fondo. Acaba de pasar 40 vaquillonas de lote y anoche llovieron 18 mm. No va a llenar un
formulario. Se lo va a decir al teléfono, un Android de gama media.

Construí esa app: el usuario habla en español rioplatense, la app responde en voz alta,
registra lo que pasó en el campo y contesta preguntas. La pantalla muestra el comprobante:
una tarjeta con los números, no un chat. Nos importan tus **decisiones de UX y técnicas**
tanto como el código. ¿No te da el tiempo? Recortá alcance y contanos qué y por qué.

## Obligatorio

1. **Turno de voz**: hablás → respuesta hablada corta + subtítulo. Push-to-talk o manos
   libres (justificalo). El estado del micrófono siempre es obvio.
2. **Escrituras** desde lenguaje natural a registros estructurados, al menos: lluvia
   "Llovieron 18 mm anoche" · movimiento de animales "Pasé 40 vaquillonas del lote 3 al 5".
3. **Lecturas**: "¿Cuánto llovió este mes?", "¿Cuántos animales hay en el lote 5?" El
   detalle va en una tarjeta.
4. **Pantalla de inicio** con un resumen útil de "hoy".

Y que nunca se trabe: micrófono denegado, sin red, no entendió o faltan datos ("¿De qué lote?").

## No construyas

Login, backend real, reportes, mapas, iOS.

## Datos: todo mock

Un JSON local o el storage del teléfono. Sin base de datos ni integraciones. Semilla mínima:
"La Tranquera", cría, Castelli (BA) · 8 lotes · ~450 cabezas por categoría (vacas,
vaquillonas, terneros, novillos, toros) y lote · lluvias de los últimos 60 días.

## Stack

Elegís vos (RN/Expo, Flutter, Kotlin…), cualquier STT/LLM/TTS o API realtime. ¿Necesitás una
key para desarrollar? Pedila.

## Qué vamos a evaluar

- **Escalabilidad**: no hace falta construirla, sí pensarla. ¿Qué pasa si esto va de un
  productor a miles?
- **UX y diseño**: cómo se ve, cómo se siente y cómo se usa, de punta a punta. Queremos ver
  tu criterio de producto, no solo que funcione.
- **Decisión de stack**: ¿por qué elegiste lo que elegiste y qué resignaste?

## Entregables

- **Repo en GitHub** con historial de commits real.
- **APK** en un GitHub Release (firmado en debug está bien, Android 11+ arm64).
- **README**: cómo compilar desde cero y levantar el server.
- **DECISIONS.md**: tus decisiones clave y por qué.

Instalamos el APK en un teléfono real y lo usamos como un productor.

## Reglas generales

Podés usar IA; contanos cuáles y cómo, y tenés que poder explicar cualquier línea. Cualquier
librería open source. Las preguntas son bienvenidas. Tu código sigue siendo tuyo.

## Condiciones

4 horas para el MVP. Uso libre de IA.
