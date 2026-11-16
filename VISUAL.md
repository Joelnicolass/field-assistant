# VISUAL · Field Assistant

Cómo se ve la app. De acá salen los valores del tema (R24) y la forma de cada pieza del design
system. Manda por debajo de `RULES.md` y por encima de los RFCs.

## 1. Pilares

1. **Se lee al sol, de un vistazo.** Números grandes y gruesos, contraste de 4,5 a 1 o más en los
   dos temas, nada de texto chico que haga falta leer para usar la app.
2. **Un solo protagonista por momento.** En reposo manda el orbe. Cuando hay una tarjeta, manda
   el número de la tarjeta, y el orbe se achica.
3. **Los colores de la marca FieldData.** El verde de la web para lo que se toca y los números
   que importan. Los verdes, el azul, el amarillo y el naranja del logo para el orbe y los
   degradés.
4. **Una sola familia tipográfica,** Plus Jakarta Sans, en pesos altos (700 y 800) para todo lo
   que hay que leer rápido.
5. **El movimiento informa, no decora.** El orbe dice en qué estado está la app, las tarjetas
   entran en orden de lectura y todo corre en el hilo de la interfaz. Solo se animan posición,
   tamaño, giro y opacidad.
6. **Toda animación sigue los 12 principios de la animación** (sección 4.8). Una animación nueva
   dice qué principios usa; si no usa ninguno, sobra.

## 2. Referencias

Las capturas están en `docs/visual-refs/fielddata/`, sacadas de fielddata.ag.

| Archivo | Qué se toma | Qué no |
| --- | --- | --- |
| `apple-touch-icon.png`, `logo-white.svg`, `favicon-32.png` | Los colores del logo (verdes, azul, amarillo y naranja), que son la paleta del orbe y de los degradés. El círculo como forma madre del orbe | El wordmark con letra serif: la app no lo usa |
| `resumen.png`, `panel-inicio.png`, `dashboard-en.png` | Los cuadros de números: etiqueta chica arriba, número grande y grueso abajo. Las superficies blancas con radio generoso. El ícono redondo de color por tipo de registro | El layout de escritorio con menú lateral, los gráficos de línea y el mapa satelital |
| `bot-audio-whatsapp.png` | El comprobante después de hablar: lo que se guardó, campo por campo, con una acción para corregir abajo | La burbuja de chat y el fondo de WhatsApp: la app no es un chat (D14) |
| `opengraph.png` | El verde de la web en el botón principal, los botones en píldora y Plus Jakarta Sans | La foto de fondo y el titular de marketing |
| `mapa-lotes.png` | Que el campo se piensa por lotes con nombre y cabezas | El mapa en sí: la app no muestra mapas |

Además, capturas de la app tal como tiene que verse, tomadas en un emulador de Android 11 a
420 dpi (1 dp = 2,625 px). Son la referencia de cómo queda cada pieza armada:

| Archivo | Qué muestra |
| --- | --- |
| `docs/visual-refs/orbe/orbe-estados.png` | Los cuatro estados del orbe en una hoja: claro arriba, oscuro abajo; de izquierda a derecha, reposo, escuchando, pensando y hablando |
| `docs/visual-refs/orbe/orbe-<estado>-<tema>.png` | Cada estado por separado. Hablando está achicado (unos 94 dp), porque solo aparece con una tarjeta en pantalla |
| `docs/visual-refs/app/01` a `11` | Pantalla completa en tema claro: inicio, escuchando, pensando, y las tarjetas de propuesta, cuenta, comprobante, consulta de lote, rechazo, no entendió y movimiento |
| `docs/visual-refs/app/12` a `16` | Lo mismo en tema oscuro: inicio, escuchando, pensando, propuesta y comprobante |
| `docs/visual-refs/app/17` y `18` | El resumen de inicio como queda: dos paneles en reposo y tres cuadros sueltos con una tarjeta. **Para el resumen mandan estas dos;** en las demás capturas el resumen tiene la forma vieja |

La barra gris de abajo en las capturas es la navegación del sistema, no de la app.

## 3. Jerarquía en pantalla

- **Hero en reposo:** el orbe, de 168 de diámetro, centrado en el espacio libre debajo del
  resumen.
- **Hero con tarjeta:** el número grande de la tarjeta (68). El orbe baja y se achica a 0,56.
  El resumen esconde el detalle por lote.
- **Siempre a la vista, pero secundario:** el subtítulo (lo que dice la app) arriba del orbe y
  el texto de estado debajo.
- **Chrome:** el resumen de hoy, arriba. Mientras la app escucha, piensa o habla, baja al 35 %
  de opacidad para que la atención vaya a la voz.
- **Lo que se toca** es verde de marca (`brand`) o el orbe. Nada más pide un toque.

## 4. Tema

### 4.1 Colores

Las dos columnas son el tema claro (el del sol) y el oscuro. El sensor de luz elige el tema
(D15). El cambio de tema funde el fondo en 400 ms.

| Token | Claro | Oscuro | Uso |
| --- | --- | --- | --- |
| `background` | `#FFFFFF` | `#000000` | Fondo de la pantalla |
| `surface` | `#FFFFFF` | `#0F1722` | Tarjetas |
| `surfaceSoft` | `#EDF6F0` | `#1A2533` | Cuadros del resumen, botón secundario, chips, fondo de las barras |
| `hairline` | `rgba(17, 28, 43, 0.10)` | `rgba(226, 238, 245, 0.14)` | Líneas de separación |
| `text` | `#111C2B` | `#F3F8F5` | Texto principal |
| `textMuted` | `#4A5871` | `#A7B4C4` | Etiquetas, lugar, texto de estado |
| `brand` | `#00751F` | `#4ADE80` | Lo que se toca y los números que importan |
| `onBrand` | `#FFFFFF` | `#04140A` | Texto sobre `brand` |
| `warning` | `#8A6914` | `#FCCC54` | Avisos: no entendió, sin señal, sin micrófono |
| `danger` | `#B3141F` | `#FF7A7A` | Rechazos de una regla; estado de error bajo el orbe |

Contraste medido, en la peor combinación de cada color: `text` 14,4; `textMuted` 6,5; `brand`
5,3; `warning` 4,6; `danger` 6,1; `onBrand` sobre `brand` 5,9. Todos pasan 4,5 a 1.

**Degradé de cada tono.** El borde y el distintivo de la tarjeta usan
`linear-gradient(135deg, c0 0%, c1 50%, c2 100%)`, igual en los dos temas:

| Tono | c0 | c1 | c2 |
| --- | --- | --- | --- |
| `brand` | `#3CCC6C` | `#3C9C54` | `#6C9CE4` |
| `warning` | `#FCCC54` | `#E4B454` | `#FC8454` |
| `danger` | `#FC8454` | `#F0284A` | `#C21DA0` |
| `neutral` | Sin definir: ver la sección 10 | | |

**Colores fijos,** fuera del tema: blanco `#FFFFFF` para el dibujo del centro del orbe y el ícono
del distintivo de la tarjeta.

### 4.2 Tipografía

- **Familia:** Plus Jakarta Sans, del paquete `@expo-google-fonts/plus-jakarta-sans`. Se incrusta
  con el plugin de `expo-font` en `app.json`, con el nombre de familia `PlusJakartaSans`.
- **Pesos:** 500, 600, 700 y 800. Cursiva en 500 y 600.
- **Números:** siempre con `fontVariant: ['tabular-nums']`, para que no salten al cambiar.

Variantes de texto (tamaño / alto de renglón en sp, peso, espaciado entre letras):

| Variante | Medidas | Dónde |
| --- | --- | --- |
| `display` | 68 / 74, 800, −2, tabular | El número grande de la tarjeta |
| `displayUnit` | 26, 700 | La unidad al lado del número grande |
| `message` | 25 / 31, 800, −0,3 | El texto grande de una tarjeta sin número |
| `farm` | 28 / 33, 800, −0,5 | El nombre del establecimiento |
| `tileValue` | 25, 800, −0,4, tabular | El número de un cuadro del resumen |
| `lotNumber` | 26 / 30, 800, tabular | El número de lote en la ruta de un movimiento |
| `subtitle` | 20 / 26, 700, centrado | Lo que dice la app, arriba del orbe |
| `button` | 20, 800 | El texto de los botones |
| `rowValue` | 20, 800, tabular | El valor de un renglón de la tarjeta |
| `caption` | 19 / 24, 600 | El texto que acompaña al número grande |
| `noted` | 17 / 22, 700 | "Lo anotado hoy" en el resumen |
| `rowLabel` | 16, 600 | La etiqueta de un renglón |
| `hint` | 16 / 22, 500 | La aclaración de una tarjeta (el día, el valor anterior) |
| `status` | 15, 700 | El estado debajo del orbe |
| `example` | 15 / 20, 600 cursiva | Una frase de ejemplo |
| `heard` | 15 / 20, 500 cursiva | "Lo que se entendió", al pie de la tarjeta |
| `lotHead` | 15, 800, tabular | Las cabezas de un lote en el resumen |
| `place` | 14, 500 | Actividad y ubicación del establecimiento |
| `overline` | 13, 800, +1,3, mayúsculas | El título chico de una tarjeta |
| `pill` | 13, 800 | El texto de una píldora |
| `tileLabel` | 12,5 / 16, 600 | La etiqueta de un cuadro del resumen |
| `lotTag` | 11, 800, +1,2, mayúsculas | "LOTE" en la ruta de un movimiento |
| `lotName` | 11, 700 | El nombre corto del lote ("L3") en el resumen |

Cumple RNF-03: el subtítulo, los números de las tarjetas (`display`, `rowValue`, `lotNumber`) y
los botones miden 20 o más.

### 4.3 Espaciados

| Paso | Valor | Uso principal |
| --- | --- | --- |
| `hair` | 2 | Entre el valor y la etiqueta de un cuadro |
| `xs` | 4 | Entre las partes de una tarjeta |
| `sm` | 8 | Entre renglones; entre lotes |
| `md` | 10 | Entre botones; entre cuadros; encabezado de la tarjeta |
| `base` | 12 | Entre los bloques del resumen; arriba de los renglones |
| `lg` | 14 | Entre tarjetas |
| `xl` | 16 | Arriba de la tarjeta y de los botones |
| `gutter` | 18 | Margen lateral de la pantalla; padding lateral de los botones |
| `xxl` | 20 | Padding lateral de la tarjeta y del subtítulo |
| `xxxl` | 26 | Debajo de la lista de tarjetas, para la sombra |

### 4.4 Radios

| Paso | Valor | Uso |
| --- | --- | --- |
| `bar` | 4 | Barra de proporción de un renglón |
| `lotBar` | 6 | Barra de un lote en el resumen |
| `example` | 14 | Chip de frase de ejemplo |
| `chip` | 18 | Chip de lote en la ruta |
| `tile` | 22 | Cuadro del resumen |
| `button` | 28 | Botón (píldora de 56 de alto) |
| `cardInner` | 28,5 | La cara de la tarjeta, adentro del borde |
| `card` | 30 | El borde de la tarjeta |
| `pill` | 999 | Píldoras del resumen |

### 4.5 Sombras

Solo la tarjeta lleva sombra.

| Tema | `card` |
| --- | --- |
| Claro | `0 12px 32px rgba(17, 60, 40, 0.16)` |
| Oscuro | `0 0 36px rgba(60, 204, 108, 0.18)`: en oscuro es un resplandor verde, no una sombra |

### 4.6 Movimiento

| Token | Valor |
| --- | --- |
| Curva de entrada | `cubic-bezier(0.23, 1, 0.32, 1)` |
| Curva de un lugar a otro | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| Resorte `soft` | 280 ms, amortiguación 0,90 |
| Resorte `gentle` | 380 ms, amortiguación 0,96 |
| Resorte `snappy` | 170 ms, amortiguación 0,92 |
| Resorte `loose` | 420 ms, amortiguación 0,85 |
| `press` | 120 ms |
| `text` | 250 ms |
| `orbColor` | 300 ms |
| `themeFade` | 400 ms |
| `bars` | 450 ms |

- **Botón bajo el dedo:** se achica a 0,965 en `press` y vuelve con `soft`.
- **Tarjeta al entrar:** espera 80 ms, sube 18 y crece de 0,98 a 1 con `soft`; la opacidad, en
  250 ms. **Al salir:** 180 ms, se achica a 0,98.
- **Partes de la tarjeta:** entran de arriba hacia abajo, la primera a los 110 ms y cada una 40 ms
  después de la anterior, subiendo 8 en 300 ms.
- **Número grande y tilde de "anotado":** crecen de 0,92 a 1 a los 150 ms.
- **Barras de los renglones:** crecen en `bars`, la primera a los 300 ms y cada una 50 ms después.
- **Texto que cambia** (estado): sube 5 en `text`.
- **Subtítulo:** aparece palabra por palabra y cada palabra se enfoca (es `RevealText`). Una
  palabra cada 70 ms; cada una tarda 620 ms. El desenfoque se hace con la sombra del texto, en
  tres capas (nítida, borrosa y muy borrosa), porque Android 11 no desenfoca una vista.

### 4.8 Los 12 principios de la animación

Toda animación de la app los tiene en cuenta. Esta tabla dice cómo se aplica cada uno con los
valores de la sección 4.6 y del orbe (sección 5). Una animación nueva se diseña con esta tabla y
se revisa contra ella.

| # | Principio | Cómo se aplica en la app |
| --- | --- | --- |
| 1 | **Estirar y encoger** | El orbe respira: crece y vuelve sin perder volumen. El botón se achica a 0,965 bajo el dedo y rebota al soltar. Siempre sutil: nada se deforma lo bastante para dejar de leerse |
| 2 | **Anticipación** | El botón se hunde antes de que pase lo que dispara. La tarjeta espera 80 ms y arranca 18 más abajo antes de subir. El dibujo del centro del orbe entra desde 0,82 |
| 3 | **Puesta en escena** | Un solo protagonista por momento (pilar 2): con una tarjeta, el orbe se achica y el resumen se apaga al 35 %. Mientras la app escucha, piensa o habla, se mueve el orbe y nada más compite con él |
| 4 | **Acción directa y pose a pose** | Pose a pose: cada estado del orbe es una ficha con valores fijos y la transición interpola entre fichas. Acción directa: las manchas giran y la respiración corre en bucle, sin poses intermedias |
| 5 | **Acción continuada y superpuesta** | Las partes de la tarjeta entran escalonadas, cada una 40 ms después de la anterior; las barras de los renglones, 50 ms. Los resortes se pasan un poco y se asientan. Los dos grupos de manchas giran en sentidos opuestos |
| 6 | **Entradas y salidas suaves** | Nada arranca ni frena de golpe: curva de entrada `cubic-bezier(0.23, 1, 0.32, 1)`, curva de un lugar a otro `cubic-bezier(0.645, 0.045, 0.355, 1)` y resortes. Lineal, solo la cuenta de 4 segundos, porque mide tiempo |
| 7 | **Arcos** | El punto de la ruta de un movimiento viaja de un lote al otro por un arco, no en línea recta. El orbe baja a su casillero en una curva de escala y traslación juntas |
| 8 | **Acción secundaria** | Detrás de la acción principal del orbe (el estado), el resplandor late y las ondas se abren. En la tarjeta, después del número, crecen las barras. La secundaria nunca tapa a la principal |
| 9 | **Timing** | El ritmo dice el estado: reposo lento (respira cada 4.200 ms), pensando rápido (vuelta de 1.800 ms), hablando vivo (1.100 ms). La interfaz responde en 120 ms al toque y nada que la persona espera dura más de 450 ms |
| 10 | **Exageración** | Medida: el número grande y el tilde de "anotado" crecen de 0,92 a 1 para que se note que se guardó. El color del orbe cambia entero por estado, para leerse sin mirar de cerca. Nada más se exagera |
| 11 | **Dibujo sólido** | El orbe es una esfera con volumen: luz arriba a la izquierda, sombra en el borde, brillo y filo de luz. Al girar, las manchas pasan por adentro de la esfera, no por encima |
| 12 | **Atractivo** | Curvas, resortes suaves y los colores del logo. Cada movimiento tiene que dar ganas de usar la app y confianza en lo que anota, sin distraer del trabajo en el campo |

### 4.9 Tamaños táctiles

| Token | Valor |
| --- | --- |
| `touch.minimum` | 48 |
| `touch.button` | 56 (alto mínimo de un botón de tarjeta) |
| `touch.primary` | 168 (el orbe), con 20 de área táctil extra alrededor |

## 5. El orbe

Es el botón principal. Tiene cuatro estados, cada uno con su color, su movimiento, su dibujo
del centro y su texto de estado. Los colores son iguales en los dos temas.

### 5.1 Capas

De atrás hacia adelante. Las medidas son fracciones del diámetro.

1. **Resplandor:** el doble del diámetro. Mancha radial del color `glow` al 85 % en el centro,
   47 % a mitad de camino y 0 en el borde.
2. **Dos ondas:** borde de 2,5, con el segundo y el tercer color de `ring`. Solo en los estados
   con ondas.
3. **Aro:** radio 0,565, trazo 0,036, con un degradé en diagonal de los cuatro colores de `ring`.
   Debajo, el mismo trazo 2,8 veces más ancho al 25 %, como brillo. Es la única capa en SVG.
4. **Esfera:** `radial-gradient(circle farthest-corner at 34% 28%, core0 0%, core1 46%, core2 100%)`.
   La luz viene de arriba a la izquierda.
5. **Manchas,** en dos grupos que giran en sentidos opuestos:
   - grupo a: en (0,15; −0,12), radio 0,30, al 95 %; y en (−0,16; 0,13), radio 0,29, al 85 %;
   - grupo b: en (−0,13; −0,15), radio 0,30, al 90 %; y una blanca en (0,16; 0,15), radio 0,26,
     al 45 %.
6. **Volumen:** sombra `#00000026` en el centro y `#00000038` en el borde; brillo `#FFFFFFB8` en
   una elipse de 0,46 × 0,27 en (0,13; 0,07), girada −28°; filo de luz `#FFFFFF38` de 1,5.
7. **Dibujo del centro,** blanco:
   - micrófono de 0,36;
   - cinco barras de 0,055 de ancho y 0,40 de alto, separadas 0,045, con alturas 0,5 / 0,8 / 1 /
     0,8 / 0,5;
   - tres puntos de 0,085, separados 0,06.

### 5.2 Colores por estado

| Estado | `core` (luz, color, sombra) | Manchas | `ring` | `glow` |
| --- | --- | --- | --- | --- |
| Reposo | `#62DE88` `#3C9C54` `#1F4D4A` | `#6C9CE4` `#FCCC54` `#FC8454` | `#FCCC54` `#3CCC6C` `#6C9CE4` `#FC8454` | `#3CB46C` |
| Escuchando | `#FFD36B` `#FC8454` `#B3263F` | `#FF4D7A` `#FCCC54` `#FF6A2B` | `#FCCC54` `#FC8454` `#FF4D7A` `#B13DFF` | `#FC7A4A` |
| Pensando | `#A5CBF7` `#5B8FE6` `#27336E` | `#8E6CF0` `#4FC3F0` `#F06CC8` | `#6C9CE4` `#4F6FE8` `#8E6CF0` `#F06CC8` | `#6C9CE4` |
| Hablando | `#9BEFA9` `#2FB877` `#1F5E5A` | `#6C9CE4` `#D8F06A` `#3CCC6C` | `#D8F06A` `#3CCC6C` `#4FC3F0` `#6C9CE4` | `#3CCC6C` |

El reposo usa todos los colores del logo. Escuchando es naranja, pensando es azul y hablando es
verde: se distinguen sin leer.

### 5.3 Movimiento por estado

| Estado | Vuelta de colores | Respiración | Crece | Resplandor | Ondas | Sigue la voz | Dibujo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Reposo | 16.000 ms | 4.200 ms | 2,5 % | 0,60 | No | No | Micrófono |
| Escuchando | 5.000 ms | 1.400 ms | 1,2 % | 0,85 | Sí | Sí: la esfera crece hasta un 20 % y las barras siguen el volumen | Barras |
| Pensando | 1.800 ms | 1.400 ms | 0,8 % | 0,70 | No | No | Puntos |
| Hablando | 4.500 ms | 1.100 ms | 3 % | 0,90 | Sí | No: las barras se mueven solas a 0,6 | Barras |

- Los puntos de pensando saltan uno detrás del otro.
- **Texto de estado,** debajo del orbe, en `status`: en `textMuted`, salvo escuchando, que va en
  `danger` para que se note que el micrófono está abierto. Los textos los escribe la feature de
  voz; en las capturas son "Tocá para hablar" (reposo), "Te escucho · tocá para terminar"
  (escuchando), "Pensando…", "Tocá para interrumpir" (hablando) y "Tocá para decir otra cosa"
  (reposo con una propuesta en pantalla).
- Al cambiar de estado, los colores se funden en `orbColor` (300 ms). El dibujo del centro cambia
  en 250 ms y el que entra crece desde 0,82.
- En reposo el orbe sigue animado (D17).
- Escuchando y hablando usan el mismo dibujo; se distinguen por color, por las ondas y porque al
  escuchar las barras siguen la voz. **Para corregir en RFC-003:** su criterio 11 pide que no
  haya dos estados con el mismo dibujo (ver la sección 9).

## 6. La tarjeta

- **Borde:** degradé del tono, de 1,5. La vista de afuera tiene radio `card` y padding 1,5; la
  de adentro, la cara, tiene radio `cardInner` y fondo `surface`. Lleva la sombra `card`.
- **Padding de la cara:** 20 a los lados, 16 arriba y 18 abajo. Entre partes, `xs`.
- **Encabezado:** distintivo redondo de 34 con el degradé del tono y el ícono blanco de 19; al
  lado, el título en `overline` y color `textMuted`. A la derecha, si hay `onClose`, la cruz:
  32 de diámetro, ícono de 16 y 14 de área táctil extra. Separación `md`.
- **Número grande:** `display` en `text`, con la unidad en `displayUnit` al lado. Debajo, la
  aclaración en `hint` y `textMuted`.
- **Mensaje:** para las tarjetas sin número, el texto en `message`.
- **Ruta de un movimiento:** dos chips de lote (radio `chip`, padding 7 vertical y 18
  horizontal, fondo `surfaceSoft`), cada uno con "LOTE" en `lotTag` y el número en `lotNumber`.
  Entre los dos, un arco punteado (trazo 2,5, raya "1 7", 15 de alto en una franja de 30) con un
  punto de 10 que viaja de origen a destino.
- **Renglones:** arriba, una línea `hairline` de dos veces el ancho mínimo, con 12 de margen y 10
  de padding. Cada renglón: la etiqueta en `rowLabel` a la izquierda y el valor en `rowValue` a
  la derecha, separados `sm`. Si tiene `share`, una barra debajo: 8 de alto, radio `bar`, fondo
  `surfaceSoft` y relleno `brand`.
- **Frases de ejemplo:** chips de radio `example`, padding 7 vertical y 12 horizontal, fondo
  `surfaceSoft`, texto en `example`.
- **Botones:** alto mínimo 56, radio `button`, separación `md`, 16 arriba, padding lateral
  `gutter`. El principal ocupa 1,5 partes del ancho, con fondo `brand` y texto `onBrand`. El
  secundario ocupa 1 parte, con fondo `surfaceSoft` y texto `text`.
- **Cuenta de 4 segundos:** sobre el botón principal, una capa de `onBrand` al 26 % que crece de
  izquierda a derecha durante la cuenta. Con la cuenta en pausa, se queda donde está.
- **Lo que se entendió:** al pie, con una línea arriba, 14 de margen y 12 de padding. Un
  micrófono de 15 y el texto en `heard` y `textMuted`.

## 7. La pantalla

Vertical, con los márgenes seguros del teléfono y 12 más arriba. Todo se acomoda al ancho con
flex; no hay un ancho de diseño fijo.

```
┌──────────────────────────────────┐
│ La Tranquera     [Manos libres]  │  resumen de hoy
│ Cría · Castelli  [2 guardados]   │
│ Hoy anotaste 2 cosas             │
│ ┌──────────────────────────────┐ │  panel de datos
│ │ 450   │ 56 mm  │ ayer        │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │  panel de lotes:
│ │ ▮  ▮  ▮  ▮  ▮  ▮  ▮  ▮       │ │  se esconde con una tarjeta
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│  tarjetas (se desplazan)         │  solo si hay
│                                  │
│      subtítulo, hasta 3 renglones│  zona de voz
│              ( orbe )            │
│             Tocá para hablar     │
└──────────────────────────────────┘
```

- **Resumen,** arriba, con margen lateral `gutter` y separación `base`.
- **Escenario,** todo lo que queda debajo. Adentro, la zona de voz va abajo y las tarjetas
  ocupan el espacio entre el resumen y la zona de voz.
- **Zona de voz:** 246 de alto, apoyada abajo con 12 de margen sobre el margen seguro. De arriba
  hacia abajo:
  - el subtítulo, en una caja de 84 (hasta tres renglones) con 20 de margen lateral, alineado
    abajo;
  - el casillero del orbe, de 136;
  - el texto de estado, en una caja de 26, en `status` (el color, en la sección 5.3).
- **El subtítulo en reposo** es una invitación ("Contame qué pasó hoy en el campo") en
  `textMuted`. Lo que dice la app va en `text`.
- **Sin tarjetas,** el orbe va con su diámetro completo, 168, en el centro del escenario. El
  subtítulo y el estado se corren 52 para que el orbe no los tape.
- **Con tarjetas,** el orbe baja a su casillero y se achica a 0,56 (unos 94). El cambio es una
  escala y una traslación, sin recalcular la pantalla. El resumen esconde los lotes.
- **Más de una tarjeta:** van en columna, separadas `lg`, con 16 arriba y 26 abajo. Si no entran,
  su zona se desplaza con el dedo, sin barra de desplazamiento. En qué orden van: ver la
  sección 10.
- **Contador de audios guardados:** una píldora en el encabezado del resumen, debajo de la de
  manos libres. Fondo `warning` al 14 %, ícono de sin señal de 15 y texto en `pill`, los dos en
  `warning`. Con 0 guardados no se muestra. Entra con un fundido de 220 ms y sale en 160 ms.
- **Píldora de manos libres** (RFC-005): radio `pill`, padding 7 y 12, micrófono de 15 y texto en
  `pill`. Apagada: fondo `surfaceSoft` y texto `textMuted`. Encendida: fondo `brand` y texto
  `onBrand`.

### 7.1 El resumen de hoy

| Dato | Forma |
| --- | --- |
| Establecimiento | El nombre en `farm`; debajo, actividad y ubicación en `place` y `textMuted` |
| Lo anotado hoy | Una frase en `noted` ("Hoy anotaste 2 cosas" o "Todavía no anotaste nada hoy") |
| Cabezas totales, lluvia del mes y última lluvia | **Panel de datos:** un panel con fondo `surfaceSoft`, radio `tile` y padding 13 vertical y 14 horizontal. Adentro, tres columnas iguales separadas por líneas verticales `hairline`. Cada columna: el valor arriba en `tileValue` (si no entra, pasa a dos renglones) y la etiqueta abajo en `tileLabel` y `textMuted`, hasta dos renglones. Las etiquetas de las tres columnas quedan alineadas abajo |
| Animales por lote | **Panel de lotes,** aparte, `base` debajo del panel de datos, con el mismo fondo, radio y padding. Ocho columnas iguales, separadas `sm`. Cada una: una barra de 12 × 38 con radio `lotBar`, fondo `surface` y relleno con el degradé vertical de `brand` (c1 abajo, c0 arriba), tan alto como la proporción respecto del lote con más cabezas; debajo, las cabezas en `lotHead` (`textMuted` si es 0) y el nombre corto en `lotName` |

**Con una tarjeta en pantalla,** el resumen se achica: el panel de lotes se esconde y el panel de
datos se abre en tres cuadros sueltos, iguales, separados `md`, cada uno con fondo
`surfaceSoft`, radio `tile` y el mismo padding. El valor y la etiqueta no cambian. El cambio es
un fundido: el panel sale en 180 ms y los cuadros entran en 280 ms, sin animar el layout
(R46). Todo el resumen sigue apagado al 35 % mientras hay un turno.

Referencias: `app/17-inicio-dos-paneles-claro.png` (reposo) y
`app/18-tarjeta-resumen-compacto-claro.png` (con tarjeta).

### 7.2 Íconos

Nueve, dibujados en SVG con trazo: micrófono, micrófono tachado, lluvia, movimiento, tilde,
pregunta, alerta, sin señal y cruz.

### 7.3 Pantallas y estados cubiertos

| Qué | Cubierto en | Captura |
| --- | --- | --- |
| Inicio, en los dos temas | Secciones 7 y 7.1 | `app/17` y `app/18` para el resumen; `app/01` y `app/12` para el resto |
| El orbe en sus cuatro estados, en los dos temas | Sección 5 | `orbe/` |
| Propuesta con la cuenta de 4 segundos | Sección 6 | `app/04`, `app/05`, `app/15` |
| Comprobante de lluvia y de movimiento | Sección 6 | `app/06`, `app/11`, `app/16` |
| Consulta de un lote, con barras | Sección 6 | `app/07` |
| Rechazo y no entendió | Sección 6 | `app/08`, `app/09` |
| Movimiento con la ruta entre lotes | Sección 6 | `app/10`, `app/11` |
| Sin micrófono, audio guardado sin señal, pregunta por un dato que falta, falta la voz en español | Sección 6 (con las piezas de las demás tarjetas) | Sin captura |
| Contador de audios guardados y manos libres encendido | Sección 7 | Sin captura |
| Manos libres esperando la frase | El orbe queda en reposo; solo cambia la píldora | Sin captura |

## 8. No-goals

- **No es un chat.** No hay burbujas, ni lista de mensajes, ni historial a la vista (D14).
- **Nada de texto de menos de 11** ni números de tarjeta de menos de 20.
- **Una sola familia tipográfica.** Ni la serif del wordmark ni una segunda familia para el
  texto corrido.
- **Sin desenfoque en vivo,** que Android 11 no tiene: lo borroso se hace con degradés y sombras
  de texto.
- **Sin mapas, gráficos de línea ni fotos.** La app muestra números y barras simples.
- **Sin animaciones de color, de fondo o de layout en el hilo de JavaScript:** solo posición,
  tamaño, giro y opacidad (R46). La excepción es el fundido del fondo al cambiar de tema.
- **Sin sombras salvo en la tarjeta.**

## 9. Para corregir en RFC-003

`VISUAL.md` tiene más autoridad que los RFCs. Estos puntos del RFC-003 quedan desactualizados y
hay que corregirlos antes de implementarlo:

1. **`TextVariant`** tiene seis valores (`Title`, `Subtitle`, `Body`, `Number`, `Label` y
   `Caption`). Las variantes son las de la sección 4.2, y el criterio 4 tiene que comprobar
   `subtitle`, `button`, `display`, `rowValue` y `lotNumber`.
2. **`theme.tones`** es `{ accent, soft }`. Cada tono es el degradé de tres colores de la
   sección 4.1.
3. **`OrbPalette`** es `{ core, ring, glow }`. Le faltan las manchas (`blobs`).
4. **Criterio 11:** pide que no haya dos estados con el mismo dibujo. Escuchando y hablando usan
   las dos las barras (sección 5.3).
5. **`touch`** es `{ minimum, primary }`. Suma `button` (56).
6. **`RevealText`** se construye: el subtítulo aparece palabra por palabra (sección 4.6).

## 10. Preguntas abiertas

| ID | Pregunta | Para cuándo |
| --- | --- | --- |
| V1 | ¿Cómo se ve el tono `neutral` (el degradé del borde y del distintivo)? Ninguna tarjeta de la tabla del RFC-003 lo usa hoy: si nadie lo usa, se saca del enum | Antes del RFC-003 |
| V2 | Con más de una tarjeta, ¿la más nueva va arriba o abajo, junto al orbe? | Antes del RFC-003 |
