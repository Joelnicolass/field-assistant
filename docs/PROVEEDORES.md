# Proveedores y precios

Qué opciones se compararon para la voz, cuánto cuesta cada pieza y con qué números se
estimó. El porqué de cada elección está en `DECISIONS.md`.

- Los precios son de lista, sin descuentos ni nivel gratis, con la fecha en que se miraron.
- Los costos por turno y las demoras son estimaciones. Lo que se mida en el teléfono va en
  `docs/RESEARCH.md`.

## Qué se eligió

| Pieza | Proveedor | Decisión |
| --- | --- | --- |
| Entender el audio | Gemini Flash-Lite, que recibe el audio directo | D6 |
| Hablar | ElevenLabs Flash v2.5; de respaldo, la voz del teléfono | D11 |
| Frase de manos libres | Vosk, dentro del teléfono | D12 |
| Server | Railway | D19 |

## Cuadro comparativo

Un turno es un pedido dicho en voz alta y su respuesta hablada.

| Opción | Sin red | Fin de habla → voz | Costo / 1.000 turnos | Español rioplatense | Integración en Expo | Gratis para el challenge |
| --- | --- | --- | --- | --- | --- | --- |
| **Elegida. Audio directo al modelo** (grabar → Gemini Flash-Lite → voz de ElevenLabs) | No entiende en el momento: el audio se guarda y se manda al volver la señal | 2 a 3,5 s | ~US$ 5 (0,49 de entender + 4,50 de voz) | El modelo oye la frase entera: voseo, números con palabras y palabras del campo. A comprobar con la batería | Fácil: `expo-audio` graba y un pedido sube el archivo | Sí: nivel gratis de Flash-Lite y créditos mensuales de ElevenLabs |
| **A. Todo en el teléfono, modelo de apoyo** (reconocedor de Android + reglas + Flash-Lite si las reglas no alcanzan + voz del teléfono) | Sí, por reglas. En Android 11 y 12 el reconocedor no anda sin red | ~0,3 s por reglas; 1 a 2 s si llama al modelo | ~US$ 0,33 | Reconocedor de español genérico; voseo y ruido a probar | Fácil: `expo-speech-recognition` + `expo-speech` | Sí |
| **B. A + voz de ElevenLabs** | Igual que A; la voz cae a la del teléfono | A + ~75 ms de modelo + red | ~US$ 4,80 | Voces con acento argentino | Media: la voz pasa por el server | 10.000 créditos por mes, sin uso comercial y con atribución |
| **C. Transcripción en la nube** (Scribe v2 Realtime → Flash-Lite → ElevenLabs) | No: sin red no hay transcripción | ~150 ms + modelo + ~75 ms + red | ~US$ 5,40 | El mejor reconocimiento: 8,9 % de error en español con acento | Media: audio en streaming desde la app | Créditos limitados |
| **D. Gemini 3.8 Live** (voz a voz) | No | Menos de 1 s | ~US$ 1,30 | 97 idiomas; acento a probar | Media: WebSocket con audio PCM; `react-native-audio-api` | Nivel gratis de la Live API |
| **E. OpenAI gpt-realtime-2.1-mini / 2.1** | No | ~0,3 s | ~US$ 2,10 / ~US$ 6,70 | Bueno, multilingüe | Media: WebRTC con una clave temporal que entrega el server | No |
| **F. ElevenLabs Agents** (plataforma completa) | No | No publicado | ~US$ 10,70 + modelo | Voces argentinas y Scribe | Fácil: SDK oficial de React Native | 15 minutos por mes |
| **G. Todo en el teléfono, sin nube** (whisper.cpp + modelo local) | Sí, todo | Lento en gama media | US$ 0 | Los modelos chicos de Whisper fallan más con ruido | Difícil: modelos de 60 a 500 MB | Sí |

El costo no decide: la opción más cara ronda un centavo por turno. Decide qué pasa en
Android 11 y qué pasa sin señal.

### Por qué no las otras

- **A y B:** en Android 11 el reconocedor nativo no permite grabación continua y da falsos
  positivos. Recién desde Android 13 el resultado es bueno.
- **C:** suma un paso y un proveedor. Sin señal habría que encolar dos procesos en lugar de uno.
- **D y E:** sin red no hay nada, así que obligan a construir otro camino de respaldo. Además
  invitan a dejar el micrófono siempre abierto.
- **F:** la lógica queda en una plataforma ajena y los minutos gratis no alcanzan para una
  evaluación.
- **G:** un modelo local que entienda no corre en un teléfono de gama media, y el APK pesaría
  cientos de MB.

## Precios de lista

| Pieza | Precio | Mirado el |
| --- | --- | --- |
| Gemini 3.5 Flash-Lite | US$ 0,30 de entrada y US$ 2,50 de salida por millón de tokens. El audio de entrada cuesta lo mismo que el texto | 14-nov-2026 |
| Gemini 3.1 Flash-Lite | US$ 0,25 de texto, US$ 0,50 de audio y US$ 1,50 de salida por millón de tokens | 14-nov-2026 |
| ElevenLabs Flash v2.5 (voz) | US$ 0,05 cada 1.000 caracteres. Medio crédito por carácter | 14-nov-2026 |
| ElevenLabs Scribe v2 Realtime (transcripción) | US$ 0,39 por hora | 14-nov-2026 |
| Gemini 3.8 Live | US$ 0,005 por minuto de audio de entrada y US$ 0,018 de salida | 14-nov-2026 |
| OpenAI gpt-realtime-2.1-mini / 2.1 | Por millón de tokens de audio, entrada y salida: US$ 10 y US$ 20 el mini; US$ 32 y US$ 64 el 2.1. Unos US$ 0,016 y US$ 0,05 por minuto, según terceros | 14-nov-2026 |
| ElevenLabs Agents | US$ 0,08 por minuto, más el modelo | 14-nov-2026 |
| Vosk | Sin costo y sin cuenta | 15-nov-2026 |
| Railway | Prueba con US$ 5 de crédito por única vez. Plan gratis con US$ 1 de crédito por mes. Hobby: US$ 5 por mes, con US$ 5 de uso incluidos | 16-nov-2026 |

### Niveles gratis y límites

- **Gemini:** el nivel gratis no cobra, pero Google puede usar los pedidos para mejorar sus
  productos. Tiene un tope por día (500 pedidos en 3.5 Flash-Lite, según un tercero: Google ya
  no publica la cifra) y otro por minuto (unos 15, a confirmar en el panel). Pasado el tope
  responde 429.
- **ElevenLabs:** el plan gratis da 10.000 créditos por mes, sin licencia comercial y con
  atribución obligatoria. Con Flash v2.5 son unas 220 respuestas de 90 caracteres.
- **Railway:** si el crédito llega a cero, frena los servicios. El dominio que genera trae
  https.

## Costo por turno

Supuestos de un turno: 5 segundos de voz y una respuesta de unos 90 caracteres.

| Concepto | Supuesto | Costo cada 1.000 turnos |
| --- | --- | --- |
| Entender con Gemini 3.5 Flash-Lite, con los últimos turnos de la conversación | ~750 tokens de entrada y ~105 de salida | US$ 0,49 |
| Entender con Gemini 3.5 Flash-Lite, sin conversación | ~400 tokens de entrada y ~100 de salida | US$ 0,36 |
| Entender con Gemini 3.1 Flash-Lite, con conversación | ~750 tokens de entrada y ~105 de salida | US$ 0,36 |
| Voz de ElevenLabs | 90 caracteres | US$ 4,50 |
| Voz del teléfono | — | US$ 0 |

- La entrada son las instrucciones, la forma de la respuesta, los últimos turnos y el audio
  (unos 25 tokens por segundo).
- Más de la mitad del costo de entender es la salida.
- La voz cuesta unas nueve veces más que entender.
- El PRD pide que entender mil pedidos cueste 1 dólar o menos (RNF-07): la estimación entra.

### A escala

Con 20 turnos por día, un productor hace 600 por mes.

| | Entender | Voz de ElevenLabs |
| --- | --- | --- |
| 1 productor | ~US$ 0,29 por mes | ~US$ 2,70 por mes |
| 1.000 productores | ~US$ 290 por mes | ~US$ 2.700 por mes |

- Si el costo importa, la palanca es la voz y no el modelo: la voz del teléfono no cuesta nada.
- Para bajar el costo de entender: no devolver los campos vacíos acorta la salida, y Gemini
  3.1 Flash-Lite cuesta un 26 % menos por turno.
- Guardar las instrucciones en caché no conviene: son pocos tokens.
- Lo que no es plata: cada turno sube unos 20 KB de audio (AAC mono a 16 kHz, unos 4 KB por
  segundo) y depende de la red y del modelo.

## Detector de la frase de manos libres

Mirados el 15-nov-2026.

| Opción | A favor | En contra |
| --- | --- | --- |
| **Vosk** (`react-native-vosk`, licencia MIT). Elegido | Sin red y sin cuenta. Se le pasa una lista de palabras y funciona como detector. Trae plugin de Expo | Suma un modelo de español al APK (40 MB comprimido, 58 MB sin comprimir). Solo reconoce las palabras que ese modelo trae |
| Porcupine (Picovoice) | El mejor documentado para React Native. Palabras en español | Pide cuenta y clave. Según un foro, las claves del plan gratis dejaron de funcionar el 30-jun-2026 |
| sherpa-onnx | Detección de palabras clave abierta | No apareció un modelo en español ni un paquete estable de React Native |
| `react-native-wakeword` (Davoice) | Hecho para esto | Los modelos a medida los genera el proveedor |

## Server

- **Elegido: Railway.** El server corre tal cual, sin adaptarlo.
- **Vercel y Cloudflare Workers:** no se miraron a fondo. Se prefirió un hosting donde el
  server corre sin cambios.

## Avisos con fecha

- Los modelos Live viejos de Gemini se apagan desde el 17-nov-2026.
- `whisper-1` y `gpt-4o-transcribe` salen de la API de OpenAI el 26-feb-2027.
- Gemini Nano, el modelo que corre dentro del teléfono, solo está en gama alta.

## Fuentes

Modelo de lenguaje:

- [Gemini 3.5 Flash-Lite: precios](https://www.developersdigest.tech/models/gemini-3-5-flash-lite)
- [Gemini API: nivel gratis](https://www.scriptbyai.com/gemini-api-free-tier-limits/)
- [Gemini Live API: precios](https://www.cekura.ai/blogs/gemini-live-api-pricing)
- [Gemini 3.8 Live: idiomas y costo](https://pasqualepillitteri.it/en/news/16547/gemini-3-8-live-audio-model)
- [Gemini Live con Expo: el audio PCM](https://discuss.ai.google.dev/t/best-practices-for-playing-gemini-live-apis-24khz-pcm-audio-stream-in-expo-react-native/95569)
- [OpenAI Realtime: precios](https://www.layer3labs.io/guides/openai-realtime-api-pricing)
- [OpenAI Realtime con WebRTC](https://developers.openai.com/api/docs/guides/realtime-webrtc)
- [ML Kit GenAI: teléfonos compatibles](https://developers.google.com/ml-kit/genai)

Voz y transcripción:

- [ElevenLabs: precios de la API](https://elevenlabs.io/pricing/api)
- [ElevenLabs Flash: precio por carácter](https://techjacksolutions.com/ai-tools/elevenlabs/elevenlabs-pricing/)
- [ElevenLabs: plan gratis](https://www.stork.ai/blog/is-elevenlabs-free-2026)
- [ElevenLabs: voces con acento argentino](https://elevenlabs.io/text-to-speech/argentine-accent)
- [ElevenLabs Agents: precio por minuto](https://elevenlabs.io/blog/weve-lowered-api-agents-pricing-and-introduced-pay-as-you-go)
- [ElevenLabs Agents: SDK de React Native](https://elevenlabs.io/docs/eleven-agents/libraries/react-native)
- [Transcripción con acento: benchmarks de AssemblyAI](https://assemblyai.com/benchmarks)
- [Transcripción dentro del teléfono: benchmark](https://voiceping-landingpage-prod.pages.dev/en/blog/research-offline-speech-transcription-benchmark/)
- [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)
- [Android SpeechRecognizer](https://developer.android.com/reference/android/speech/SpeechRecognizer)

Frase de manos libres:

- [react-native-vosk](https://app.unpkg.com/react-native-vosk@2.1.6/files/README.md)
- [Porcupine en React Native](https://picovoice.ai/docs/quick-start/porcupine-react-native/)
- [Porcupine: aviso sobre el plan gratis](https://community.home-assistant.io/t/fyi-picovoice-confirmed-free-tier-accesskeys-will-stop-working-after-june-30-2026/1012744)
- [sherpa-onnx: palabras clave](https://k2-fsa.github.io/sherpa/onnx/kws)

Server:

- [Railway: planes y precios](https://docs.railway.com/reference/pricing/plans)
- [Railway: red pública](https://docs.railway.com/guides/public-networking)
