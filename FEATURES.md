# FEATURES · Field Assistant

Features extraídas de `PRD.md`. Los identificadores (`F1`, `F2`…) son permanentes: no se
renumeran, y una feature que se quita se marca `[QUITADA]`.

Los tiempos y umbrales que aparecen en los criterios (segundos, lux) son valores iniciales:
viven en un solo archivo de ajustes y el research del RFC-001 los puede corregir.

## Resumen

| Prioridad | Cantidad | Features |
| --- | --- | --- |
| Must | 19 | F1 a F7, F9 a F17, F24, F25, F26 |
| Should | 8 | F8, F18 a F23, F27 |
| **Total** | **27** | |

| Categoría | Features |
| --- | --- |
| Turno de voz | F1, F2, F3, F4 |
| Escrituras | F5, F6, F7, F8 |
| Lecturas | F9, F10 |
| Inicio | F11 |
| Que nunca se trabe | F12, F13, F14, F15, F16 |
| Datos | F17 |
| Voz de la app | F18, F27 |
| Extras | F19, F20, F21, F22, F23 |
| Entrega | F24, F25 |
| Base | F26 |

---

## Turno de voz

### F1 · Escuchar con un toque

**Must · Complejidad media · PRD: RF-01, RF-20**

Tocar el botón principal abre el micrófono, y la escucha termina sola.

Criterios de aceptación:

- En reposo, tocar el botón principal inicia la escucha y la pantalla lo muestra en menos de 100 ms.
- Después de que la persona habló, 2,5 segundos de silencio terminan la escucha.
- Tocar el botón mientras escucha la termina en el momento.
- Si nadie habla en 8 segundos, la escucha se cancela y la app dice que no escuchó nada.
- Ninguna escucha dura más de 20 segundos.

Consideraciones: qué volumen cuenta como voz es un ajuste; se calibra en el research.
Caso límite: con ruido de fondo constante por encima del umbral, corta a los 20 segundos.

### F2 · El estado del micrófono siempre a la vista

**Must · Complejidad media · PRD: RF-02, RNF-03**

El botón principal muestra en qué está la app.

Criterios de aceptación:

- Hay cuatro estados: en reposo, escuchando, pensando y hablando.
- Cada estado tiene un color, un movimiento, un ícono y un texto distintos. Se distinguen también sin el color.
- Mientras escucha, el botón reacciona al volumen de la voz.
- El botón mide 64 dp o más y su área táctil es mayor que el dibujo.

### F3 · Respuesta hablada con subtítulo

**Must · Complejidad media · PRD: RF-03, RF-05, RF-24, RNF-11**

Cada turno termina con una oración en voz alta y el mismo texto en pantalla.

Criterios de aceptación:

- La respuesta hablada es una sola oración, y el subtítulo dice exactamente lo mismo.
- La pantalla muestra tarjetas con números; no hay lista de mensajes ni burbujas.
- Habla la voz de servicio. Si falla o no empieza a sonar en 1,5 segundos, habla la voz del teléfono con el mismo texto.
- La voz del teléfono que se elige es una voz en español.
- (Should, RF-05) Tocar el botón mientras la app habla corta la voz.

### F4 · Entender el pedido

**Must · Complejidad alta · PRD: RF-04, RF-13, RNF-02, RNF-05, RNF-06, RNF-07, RNF-12**

El audio del turno se convierte en un pedido con sus datos.

Criterios de aceptación:

- El audio se envía al server, que devuelve: qué se pidió, sus datos, el texto de lo que se escuchó y, si falta un dato, la pregunta para pedirlo.
- Pedidos que reconoce: registrar lluvia, mover animales, consultar lluvia y consultar un lote; con F8 entregada, también corregir. Cualquier otra cosa vuelve como "no entendido".
- Entiende español rioplatense hablado: el voseo ("Mové", "Pasá"), los números dichos con palabras, "milímetros" y "anoche".
- El server devuelve solo lo que dijo la persona. Ningún número del campo sale de ahí.
- La clave del proveedor no está en la app.
- Si el server no contesta en 8 segundos, da un error o devuelve algo que no se puede leer, el turno sigue por F13.
- Con buena señal, desde que termina la escucha hasta que aparece la tarjeta pasan 5 segundos como máximo.
- El server rechaza un audio de más de 2 MB.

Consideraciones: un solo pedido al proveedor por turno, con el audio como entrada y una
respuesta con forma fija.

---

## Escrituras

### F5 · Registrar lluvia

**Must · Complejidad media · PRD: RF-06, RF-09, RF-37**

Criterios de aceptación:

- "Llovieron 18 milímetros anoche" propone anotar 18 mm con la fecha de ayer.
- Entiende "hoy", "ayer", "anoche" (es ayer) y una fecha. Si no se dice el día, es hoy. Una fecha futura no se anota, y la app lo explica.
- Los milímetros son un número mayor que cero. Si faltan, la app los pregunta (F15).
- Al anotar, la respuesta dice el total de lluvia del mes.

### F6 · Mover animales

**Must · Complejidad media · PRD: RF-07, RF-09**

Criterios de aceptación:

- "Pasé 40 vaquillonas del lote 3 al 5" propone mover 40 vaquillonas del lote 3 al lote 5.
- No se anota, y la app lo explica con los números, si: un lote no existe, el origen y el destino son el mismo, la cantidad no es un entero positivo, o en el origen no hay tantos animales de esa categoría.
- Si falta la cantidad, la categoría, el origen o el destino, la app lo pregunta (F15).
- Al anotar, la respuesta dice cuántos animales de esa categoría quedan en el lote de origen. Los totales de los dos lotes cambian y el total de cabezas no.

### F7 · Proponer antes de anotar

**Must · Complejidad media · PRD: RF-08**

Criterios de aceptación:

- Toda escritura muestra antes una tarjeta con lo que se va a anotar y una cuenta de 4 segundos a la vista.
- "Anotar" anota en el momento. "Cancelar" descarta sin anotar. Si la cuenta termina, se anota sola.
- Al anotar, la tarjeta pasa a ser el comprobante, con los números ya actualizados.
- Tocar el botón principal durante la cuenta descarta la propuesta y empieza una escucha nueva.
- Si la app pasa a segundo plano durante la cuenta, no se anota sola: la propuesta queda esperando "Anotar" o "Cancelar".
- Ninguna escritura llega a los datos sin pasar por una propuesta. Se comprueba con un test.

### F8 · Corregir lo último anotado

**Should · Complejidad media · PRD: RF-10**

Criterios de aceptación:

- "No, eran veinte" después de anotar propone cambiar la cantidad (milímetros o cabezas) del último registro. La corrección pasa por F7, y el registro corregido reemplaza al anterior.
- Solo se corrige lo último anotado desde que se abrió la app. Si no hay nada anotado, la app lo dice.

---

## Lecturas

### F9 · Consultar lluvia

**Must · Complejidad baja · PRD: RF-11, RF-13, RF-37**

Criterios de aceptación:

- Períodos: hoy, ayer, esta semana (los últimos 7 días, contando hoy) y este mes (el mes en curso, hasta hoy).
- La respuesta dice el total en una oración. La tarjeta muestra el total y un renglón por cada día con lluvia.
- Si no llovió en el período, la app lo dice.
- Si no se dice el período, la app lo pregunta (F15).

### F10 · Consultar un lote

**Must · Complejidad baja · PRD: RF-12, RF-13**

Criterios de aceptación:

- La respuesta dice el total de animales del lote en una oración. La tarjeta muestra el detalle por categoría.
- Si el lote no existe, la app lo dice. Si no se dice el lote, lo pregunta (F15).

---

## Inicio

### F11 · Resumen de hoy

**Must · Complejidad media · PRD: RF-14, RF-15, RNF-04**

Criterios de aceptación:

- Muestra el nombre del establecimiento, las cabezas totales, la lluvia del mes, la última lluvia (cuánto y cuándo), los animales de cada uno de los 8 lotes y lo anotado hoy.
- Cambia en el momento en que se anota algo, sin recargar la pantalla.
- Se ve completo sin red.

---

## Que nunca se trabe

### F12 · Micrófono denegado

**Must · Complejidad baja · PRD: RF-16**

Criterios de aceptación:

- Con el permiso denegado, tocar el botón principal muestra una tarjeta que lo explica, con el botón "Abrir ajustes".
- Después de dar el permiso y volver a la app, tocar el botón inicia la escucha.

### F13 · Cola de audios sin señal

**Must · Complejidad alta · PRD: RF-17, RNF-04, RNF-11**

Criterios de aceptación:

- Si no hay red, el server no contesta en 8 segundos o devuelve un error, el audio se guarda en el teléfono, con la fecha en que se grabó, y la app dice que lo guardó.
- La pantalla muestra cuántos audios hay guardados.
- La app reintenta cada 20 segundos y cuando vuelve a estar a la vista.
- Cuando se entiende un audio guardado, aparece una tarjeta "Grabado sin señal" con lo que se entendió y los botones "Anotar" y "Descartar". Nunca se anota solo.
- Cada audio se entiende con su fecha de grabación ("ayer" es el día anterior a esa fecha), y las reglas de F5 y F6 se aplican con los datos del momento en que se procesa.
- Un audio guardado que resulta ser una consulta se contesta en una tarjeta. Uno que no se entiende se muestra como tal, con el botón "Descartar".
- Los audios guardados siguen ahí al cerrar y volver a abrir la app.

### F14 · No entendió

**Must · Complejidad baja · PRD: RF-18**

Criterios de aceptación:

- La app dice que no entendió y muestra tres frases de ejemplo.
- No se anota nada.

### F15 · Preguntar lo que falta

**Must · Complejidad media · PRD: RF-19**

Criterios de aceptación:

- Si falta un dato obligatorio, la app hace una pregunta corta, hablada y en el subtítulo, y vuelve a escuchar sola.
- La respuesta ("Del tres al cinco") completa el pedido anterior. Para eso, con cada audio viajan los últimos 4 turnos: lo que se dijo y lo que la app contestó.
- Si la respuesta habla de otra cosa, se trata como un pedido nuevo.
- Si después de dos preguntas seguidas el pedido sigue incompleto, o si nadie contesta, la app lo descarta, lo dice y muestra frases de ejemplo.
- Nunca se anota un pedido incompleto.
- El historial de turnos vive en memoria y se pierde al cerrar la app.

### F16 · Siempre hay una salida

**Must · Complejidad baja · PRD: RF-21**

Criterios de aceptación:

- En cada estado y en cada tarjeta hay al menos una acción a la vista para seguir.
- Ningún estado dura más de 20 segundos sin cambiar solo o sin que se pueda salir.
- Mientras la app piensa, tocar el botón principal cancela el turno.
- Un error inesperado termina en reposo con un mensaje, nunca en una pantalla vacía.

---

## Datos

### F17 · Datos iniciales y guardado local

**Must · Complejidad baja · PRD: RF-22, RF-23, RF-37**

Criterios de aceptación:

- En la primera apertura hay un establecimiento "La Tranquera" (cría, Castelli, Buenos Aires), 8 lotes, 450 cabezas en total repartidas en cinco categorías, y lluvias en los 60 días anteriores a esa apertura.
- El lote 3 arranca con 40 vaquillonas o más: las cuatro frases de la consigna se pueden ejecutar en orden.
- Las fechas usan el reloj y la zona horaria del teléfono.
- Lo anotado se guarda en un archivo JSON en el teléfono y sigue ahí al cerrar y volver a abrir la app.
- Si el archivo guardado no se puede leer, la app arranca con los datos iniciales.

---

## Voz de la app

### F18 · Aviso de voz en español faltante

**Should · Complejidad baja · PRD: RF-25**

Criterios de aceptación:

- Si el teléfono no tiene ninguna voz en español, aparece una tarjeta que lo dice, con el botón "Instalar voz", que abre la pantalla del teléfono donde se instalan.
- La tarjeta se puede cerrar, y deja de aparecer cuando la voz ya está instalada.

### F27 · Frases grabadas

**Should · Complejidad baja · PRD: RF-39**

Criterios de aceptación:

- Al empezar a pensar, la app dice una muletilla corta, tomada de cinco que se van turnando. La respuesta empieza cuando la muletilla terminó.
- Cuando un audio va a la cola, el aviso suena con una de dos frases grabadas, y el subtítulo muestra ese mismo texto.
- Los audios están dentro de la app: suenan sin red y sin esperar al server.
- Si una frase grabada no se puede reproducir, la app sigue: lo dice la voz del teléfono.

---

## Extras

### F19 · Manos libres

**Should · Complejidad alta · PRD: RF-26, RNF-06, RNF-08**

Criterios de aceptación:

- Hay un interruptor "Manos libres", apagado por defecto.
- Encendido, con la app en reposo y a la vista, decir la frase de activación inicia la escucha (F1). El teléfono vibra al detectarla.
- Mientras espera la frase, el botón principal sigue en reposo. El interruptor se ve encendido y el texto de estado dice que está esperando la frase.
- La frase se detecta dentro del teléfono, sin red. Mientras espera, nada se graba ni se envía.
- No espera la frase durante un turno, con una propuesta en cuenta ni con la app en segundo plano.
- Si el detector no puede iniciar, el interruptor se apaga y la app lo dice.
- La frase tiene dos palabras y las dos están en el vocabulario del detector.

### F20 · Entrada con el logo

**Should · Complejidad media · PRD: RF-27**

Criterios de aceptación:

- Al abrir la app, el logo de la marca se anima y termina convertido en el botón principal. El resto de la pantalla aparece cuando la entrada termina.
- Dura 3,5 segundos o menos.
- Se apaga con un ajuste de configuración. Apagada, la pantalla aparece directamente.
- No se repite al volver del segundo plano.

### F21 · Tema según la luz

**Should · Complejidad baja · PRD: RF-28, RNF-03**

Criterios de aceptación:

- Con más de 600 lux, tema claro. Con menos de 150, tema oscuro. Entre los dos valores no cambia.
- Si el teléfono no tiene sensor de luz, se usa el tema del sistema.

### F22 · Brillo al sol

**Should · Complejidad baja · PRD: RF-29**

Criterios de aceptación:

- Con más de 10.000 lux, el brillo de la pantalla va al máximo, solo dentro de la app. Con menos de 3.000 vuelve al brillo del teléfono. Entre los dos valores no cambia.
- No pide ningún permiso.

### F23 · Splash e ícono

**Should · Complejidad baja · PRD: RF-30**

Criterios de aceptación:

- La app tiene un ícono propio con la marca, en el formato adaptable de Android.
- Al abrir se ve un splash con el color y el logo de la marca, sin un salto visible hacia la entrada o la pantalla.

---

## Entrega

### F24 · APK de release

**Must · Complejidad media · PRD: RF-31, RF-35, RF-36, RNF-01, RNF-05, RNF-09**

Criterios de aceptación:

- El build de release genera un APK para arm64 que se instala y abre en Android 11 o superior, sin ningún servidor de desarrollo.
- Pesa 100 MB o menos y no contiene ninguna clave de un proveedor.
- El server está publicado con https, y su dirección es un ajuste del build.
- Las cuatro frases de la consigna funcionan desde el APK instalado en un teléfono físico contra el server publicado, y el resultado queda anotado.
- Está publicado como archivo de un Release de GitHub.

### F25 · Documentos de entrega

**Must · Complejidad baja · PRD: RF-32, RF-33, RF-34, RF-38**

Criterios de aceptación:

- `README.md` explica cómo compilar desde cero, cómo levantar el server, cómo configurar sus claves y cómo apuntar la app a un server local. Alguien que no conoce el proyecto lo logra siguiéndolo.
- `DECISIONS.md` cuenta las decisiones de UX y de stack y qué se resignó en cada una: por qué se toca para hablar y qué lugar tiene manos libres, qué quedó afuera y por qué (si algo quedó afuera), la lectura de la semilla (S1) y cómo escalaría de un productor a miles.
- `AI-USAGE.md` dice qué herramientas de IA se usaron y para qué.
- El repositorio está en GitHub con un commit por paso.

---

## Base

### F26 · Base técnica y research

**Must · Complejidad media · PRD: RNF-10, Q2, Q4, Q5**

Criterios de aceptación:

- El proyecto está armado con la estructura y las librerías de `RULES.md`, y los chequeos de tipos, lint y tests pasan.
- La app abre en un teléfono o emulador con Android 11 o superior.
- `docs/RESEARCH.md` deja anotado, con fecha y dispositivo, lo que se comprobó de cada librería y proveedor, y las respuestas a Q2, Q4 y Q5.

---

## Autochequeo

Recuento hecho sobre las secciones: 27 features, de F1 a F27, sin saltos. Must: 19 (F1, F2,
F3, F4, F5, F6, F7, F9, F10, F11, F12, F13, F14, F15, F16, F17, F24, F25, F26). Should: 8
(F8, F18, F19, F20, F21, F22, F23, F27). Cada requisito funcional del PRD, de RF-01 a RF-39, está
citado por al menos una feature, y también cada requisito no funcional, de RNF-01 a RNF-12.
