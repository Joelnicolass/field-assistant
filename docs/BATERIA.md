# Batería de 20 frases

Es la prueba con voz real de la sección 8 del PRD. Se dice con el APK instalado en un
teléfono, en español rioplatense. Pasa si 18 o más dan el resultado esperado.

- Se arranca con los datos iniciales (app recién instalada), y las frases se dicen **en este
  orden**: los números esperados dependen de lo anotado antes.
- Cada propuesta se anota, tocando "Anotar" o dejando correr la cuenta.
- Las cinco últimas se dicen con ruido de fondo: una radio o un motor cerca.
- El resultado de cada una se anota en `docs/RESEARCH.md`, con el teléfono y la fecha: si dio
  bien y, si no, qué entendió.

## Las cuatro de la consigna

| # | Se dice | Tiene que pasar |
| --- | --- | --- |
| 1 | Llovieron 18 milímetros anoche | Propone 18 mm con la fecha de ayer. Al anotar dice el total del mes |
| 2 | Pasé 40 vaquillonas del lote 3 al 5 | Propone el movimiento. Al anotar dice que quedan 5 vaquillonas en el lote 3 |
| 3 | ¿Cuánto llovió este mes? | Dice el total del mes. La tarjeta muestra un renglón por día con lluvia |
| 4 | ¿Cuántos animales hay en el lote 5? | Dice 105. La tarjeta muestra 40 vacas, 40 vaquillonas y 25 terneros |

## Con un dato que falta

| # | Se dice | Tiene que pasar |
| --- | --- | --- |
| 5 | Mové quince terneros. Después: Del dos al siete | Pregunta de qué lote a qué lote y vuelve a escuchar. Con la respuesta propone 15 terneros del lote 2 al 7. Al anotar dice que quedan 30 terneros en el lote 2 |
| 6 | Llovió hoy. Después: Siete | Pregunta cuántos milímetros. Con la respuesta propone 7 mm de hoy |
| 7 | ¿Cuántos animales hay? Después: En el cuatro | Pregunta de qué lote. Con la respuesta dice 74 |

## Que una regla rechaza

| # | Se dice | Tiene que pasar |
| --- | --- | --- |
| 8 | Pasé quinientos novillos del tres al cinco | No anota. Dice que en el lote 3 hay 12 novillos, no 500 |
| 9 | Pasé diez vacas del uno al doce | No anota. Dice que el lote 12 no existe |
| 10 | Pasé veinte vacas del uno al uno | No anota. Dice que el origen y el destino son el mismo lote |

## Otras

| # | Se dice | Tiene que pasar |
| --- | --- | --- |
| 11 | ¿Cuánto llovió esta semana? | Dice el total de los últimos 7 días, que incluye los 18 de ayer y los 7 de hoy |
| 12 | ¿Cuánto llovió ayer? | Dice 18 |
| 13 | ¿Cuánto llovió hoy? | Dice 7 |
| 14 | ¿Cuántos animales hay en el lote dos? | Dice 80. La tarjeta muestra 50 vacas y 30 terneros |
| 15 | Pasá dos toros del cuatro al uno | Propone el movimiento. Al anotar dice que quedan 2 toros en el lote 4 |

## Con ruido de fondo

| # | Se dice | Tiene que pasar |
| --- | --- | --- |
| 16 | Llovieron cinco milímetros hoy | Propone 5 mm de hoy |
| 17 | Pasé diez vacas del lote dos al seis | Propone el movimiento. Al anotar dice que quedan 40 vacas en el lote 2 |
| 18 | ¿Cuánto llovió este mes? | Dice el total del mes |
| 19 | ¿Cuántos animales hay en el lote siete? | Dice 65 |
| 20 | ¿Qué onda el clima mañana? | Dice que eso no lo sabe y muestra tres frases de ejemplo |
