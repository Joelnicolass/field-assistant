# Decisiones

Qué se usa, qué se hace y por qué. Una entrada por decisión.

## D1 · La app y el server, en el mismo repositorio

- **Decisión:** un solo repositorio, con `app/` y `server/`. Cada uno tiene su `package.json`. Sin herramienta de monorepo.
- **Por qué:** un solo historial y un solo lugar para revisar. El README levanta los dos.
- **Resigno:** la app y el server comparten historial: no se versionan ni se publican por separado.

## D2 · React Native con Expo

- **Decisión:** React Native con Expo, con prebuild y build local.
- **Por qué:**
  - Expo trae un ecosistema armado que simplifica el desarrollo.
  - Audio, voz, sensores, archivos y brillo ya existen como módulos.
  - El APK sale con dos comandos, sin cuenta ni servicio en la nube.
- **Resigno:** el control fino de una app nativa en Kotlin, y quedar atado a las versiones de Expo.

## D3 · Arquitectura limpia

- **Decisión:** `domain` con contratos, `data` con implementaciones y `di` que los conecta.
- **Por qué:**
  - Cambiar de proveedor (modelo, voz, guardado) es escribir otra implementación.
  - Las reglas del campo se prueban sin teléfono.
  - Sumar un registro nuevo es sumar un caso de uso, sin tocar lo que ya anda.
- **Resigno:** es más estructura de la que pide una app de una pantalla. Se paga pensando en que crezca.

## D4 · Los datos, en un archivo JSON del teléfono

- **Decisión:** un archivo JSON local, detrás de un repositorio. Sin base de datos.
- **Por qué:**
  - Lo pide la consigna: todo mock.
  - Es simple de explicar: un archivo y un mapper que valida al leerlo.
- **Resigno:** los datos no se comparten entre teléfonos ni tienen respaldo, y el archivo no aguanta años de registros.

## D5 · Se toca para hablar; manos libres es opcional

- **Decisión:** un toque abre el micrófono. Manos libres existe, con un interruptor, y arranca apagado.
- **Por qué:** manos libres es la opción más cómoda, pero también la que más batería consume.
- **Resigno:** con manos libres apagado, cada pedido necesita un toque.

## D6 · El audio va directo al modelo, sin transcribir aparte

- **Decisión:** la app graba y el server manda el audio a un modelo de lenguaje, que lo entiende y devuelve el pedido en una sola llamada.
- **Por qué:**
  - Tiene que andar en Android 11: ahí la transcripción nativa no permite grabación continua y da falsos positivos. A partir de Android 13 el resultado es óptimo.
  - Un servicio de transcripción aparte suma un paso, y sin señal habría que encolar dos procesos.
  - Un pedido en lugar de dos: menos demora y menos piezas.
  - El modelo oye la frase entera y entiende mejor.
  - Cuesta menos: se paga un pedido por turno, no dos.
- **Resigno:** sin señal no se entiende nada en el momento: el audio espera.

## D7 · Mostrar antes de anotar, con 4 segundos para frenar

- **Decisión:** la app muestra lo que va a anotar y lo guarda sola a los 4 segundos. Se puede anotar o cancelar con un toque.
- **Por qué:**
  - La voz se equivoca: un número mal entendido no se anota sin que la persona lo vea.
  - Si está bien, no hay que tocar nada.
  - El error se frena antes de guardarse, no se corrige después.
  - Da confianza: se ve el comprobante antes y después.
- **Resigno:** cada registro tarda 4 segundos más.
- **A rever:** falta buscar la experiencia deseada. Depende del caso de uso y de las condiciones en que se use la app.

## D8 · El modelo entiende; los números los calcula la app

- **Decisión:** el modelo devuelve qué pidió la persona. Las reglas y los totales los calcula el código.
- **Por qué:**
  - Un modelo puede inventar: los totales salen de los datos guardados.
  - Las reglas se prueban con tests y dan siempre lo mismo.
  - Se puede cambiar de modelo sin que cambien los números.
- **Resigno:** hoy las reglas viven en el teléfono.
- **A rever:** así no escalan. Lo ideal es que vivan en un server.

## D9 · Sin señal, el audio se guarda y se manda después

- **Decisión:** sin red, el audio queda guardado en el teléfono. Cuando vuelve la señal se envía, y la app muestra lo que entendió.
- **Por qué:**
  - En el campo no hay señal: es lo normal, no la excepción.
  - No se pierde lo dicho: la persona habla una sola vez.
  - Una sola cola: se guarda un archivo y se reintenta un solo pedido.
  - Entender sin red pediría un modelo en el teléfono: más peso y más batería.
- **Resigno:** sin señal no hay respuesta en el momento: ni consultas ni comprobante.

## D10 · La conversación la lleva el modelo

- **Decisión:** el modelo recibe los últimos turnos y escribe la pregunta cuando falta un dato. No hay preguntas fijas en el código.
- **Por qué:**
  - Suena natural: la pregunta sale de lo que se dijo.
  - Menos código: no hay una pregunta escrita por cada dato que puede faltar.
  - Entiende respuestas cortas: "al dos" o "veinte" se leen como respuesta a la pregunta.
  - Crece solo: un registro nuevo no obliga a escribir su diálogo.
- **Resigno:** se controla menos lo que dice la app, y el diálogo se prueba con una batería de frases contra el modelo, no con tests comunes.

## D11 · Voz de servicio, con la del teléfono de respaldo

- **Decisión:** la app habla con una voz de servicio. Si falla, habla la voz del teléfono. Las frases de siempre van grabadas dentro de la app.
- **Por qué:**
  - Suena a persona: se entiende mejor y da más confianza.
  - Nunca queda muda: sin servicio o sin red, habla el teléfono.
  - Las frases grabadas suenan al instante: tapan la espera y avisan sin señal.
  - La voz del teléfono varía: cada uno trae voces distintas, y a veces ninguna en español.
- **Resigno:** cada respuesta hablada espera a la red y se paga; el respaldo suena distinto.

## D12 · La frase de manos libres se detecta en el teléfono

- **Decisión:** un detector dentro del teléfono reconoce una frase de dos palabras. Recién ahí la app graba.
- **Por qué:**
  - Mientras espera la frase, nada se graba ni sale del teléfono.
  - Anda sin señal.
  - Dos palabras fallan menos que una: una sola se dispara con cualquier conversación.
- **Resigno:** el modelo del detector pesa en el APK, y la frase solo puede usar palabras que ese modelo conoce.

## D13 · Un server mínimo y sin estado

- **Decisión:** entre la app y los proveedores (modelo y voz) hay un server que no guarda nada.
- **Por qué:**
  - Las claves de los proveedores quedan en el server, no dentro del APK.
  - Simple de publicar: sirve cualquier hosting y no hay base de datos que cuidar.
  - El modelo o la voz se cambian en el server, sin sacar un APK nuevo.
  - No guarda audio ni datos: el audio pasa y no queda en ningún lado.
- **Resigno:** una pieza más que publicar y mantener prendida; cada pedido da un salto más.

## D14 · Un orbe y tarjetas con números, no un chat

- **Decisión:** la pantalla tiene un botón principal, el orbe, y tarjetas con números. No hay lista de mensajes.
- **Por qué:**
  - Se lee de un vistazo: al sol, números grandes, sin desplazar mensajes.
  - Un solo botón grande: con guantes y sin buscar.
  - El orbe muestra el estado: escuchando, pensando o hablando se ve sin leer.
- **Resigno:** no queda a la vista el historial de lo conversado.

## D15 · El tema y el brillo siguen la luz del ambiente

- **Decisión:** el sensor de luz elige tema claro u oscuro, y bajo el sol la pantalla va al brillo máximo.
- **Por qué:**
  - Al sol no se ve: con brillo bajo o tema oscuro, la pantalla es ilegible afuera.
  - Sin tocar ajustes: con las manos ocupadas, nadie sube el brillo a mano.
  - Solo en esta app: sin permisos y sin cambiar el brillo del teléfono.
  - Con poca luz, el tema oscuro no encandila.
- **Resigno:** el brillo al máximo gasta más batería.

## D16 · La semilla tiene 450 cabezas en total

- **Decisión:** "~450 cabezas por categoría y lote" se lee como 450 en todo el campo, repartidas entre categorías y lotes.
- **Por qué:** es la lectura más simple: un total y su reparto.
- **A rever:** es una lectura propia. Falta confirmarla con quien evalúa.

## D17 · El orbe sigue animado en reposo

- **Decisión:** en esta etapa el orbe se anima siempre, también cuando nadie usa la app.
- **Por qué:** un orbe que se mueve muestra que la app está lista para escuchar.
- **Resigno:** batería.
- **A rever:** si la app pasa a usarse en sesiones largas, lo correcto es dejarlo en reposo.

## D18 · Por manos libres también se anota solo

- **Decisión:** un pedido que entró por manos libres se anota a los 4 segundos, igual que con el toque.
- **Por qué:**
  - Manos libres es para manos ocupadas: pedir un toque le quita el sentido.
  - La app dice en voz alta lo que va a anotar.
- **Resigno:** si el detector se dispara por error, el pedido puede quedar anotado.
- **A rever:** cancelar por voz. Hoy cancelar pide un toque.

## D19 · El server se publica en Railway

- **Decisión:** el server corre tal cual en Railway, un hosting de Node, con https.
- **Por qué:**
  - No hay que adaptarlo: es lo que menos tiempo lleva.
  - El APK funciona en el teléfono de quien evalúa, sin levantar nada.
- **Resigno:** depender de un servicio más y de que siga prendido.
