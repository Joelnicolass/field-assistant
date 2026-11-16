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

- **Decisión:** entre la app y los proveedores (modelo y voz) hay un server que no guarda nada,
  hecho con Express.
- **Por qué:**
  - Las claves de los proveedores quedan en el server, no dentro del APK.
  - Simple de publicar: sirve cualquier hosting y no hay base de datos que cuidar.
  - El modelo o la voz se cambian en el server, sin sacar un APK nuevo.
  - No guarda audio ni datos: el audio pasa y no queda en ningún lado.
  - Express es lo más usado para APIs chicas en Node: cualquiera que lea el código lo conoce, y
    resuelve rutas, JSON y errores sin escribirlos a mano.
- **Resigno:** una pieza más que publicar y mantener prendida; cada pedido da un salto más; y
  una dependencia más en el server, en lugar de usar solo `node:http`.

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

## D20 · Sin React Compiler

- **Decisión:** React Compiler queda apagado.
- **Por qué:**
  - En esta versión de Expo es experimental.
  - La app no lo necesita: tiene una sola pantalla y pocos componentes.
  - Al probarlo en el teléfono, la app andaba bien, pero Metro no le aplicaba el compilador al código: tenerlo encendido daba una garantía que no se cumplía.
- **Resigno:** la memoización automática. Si una pantalla se vuelve lenta, se memoiza a mano, con una medición que lo justifique (R41).

## D21 · "Lo anotado hoy" cuenta por el día en que se anotó

- **Decisión:** cada lluvia y cada movimiento guardan dos fechas: el día del hecho y el día en que se anotó. "Lo anotado hoy" cuenta lo que se anotó hoy; los totales de lluvia usan el día en que llovió.
- **Por qué:**
  - "Llovieron 18 mm anoche" se dice hoy: tiene que aparecer en lo anotado hoy, aunque la lluvia sea de ayer.
  - Los totales siguen siendo correctos: esa lluvia suma en ayer, no en hoy.
- **Resigno:** un campo más en cada registro y en el archivo guardado.

## D22 · Reanimated aplica las animaciones directo a la vista

- **Decisión:** se enciende `ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS` en `app/package.json`. Reanimated aplica `transform` y `opacity` directo a la vista nativa, sin pasar por el árbol de React Native en cada cuadro.
- **Por qué:**
  - El orbe anima unas quince vistas a la vez, y por defecto cada cuadro recalculaba la pantalla: tardaba 20 ms en modo desarrollo.
  - Con la opción tarda 10 ms en desarrollo y de 8 a 9 ms en producción, medido con `dumpsys gfxinfo` en el teléfono.
  - La app solo anima posición, tamaño, giro y opacidad (R46), justo lo que la opción acelera.
- **Resigno:** cambiarla obliga a un build nativo, y es una opción que Reanimated trae apagada.

## D23 · El catálogo del design system queda en la app

- **Decisión:** el catálogo no se borra. Es una pantalla aparte que se abre con "Ver el DS"
  desde la pantalla de inicio y vuelve con "Volver". Con `EXPO_PUBLIC_SHOW_CATALOG=1` la app
  abre directo en él.
- **Por qué:**
  - Muestra cada pieza del design system en todos sus estados, sin depender del turno de voz.
  - Sirve para revisar lo visual en el teléfono y para mostrar cómo está armada la interfaz.
- **Resigno:** un botón más en la pantalla de inicio y una pantalla que el productor no usa.

## D24 · La navegación entre pantallas, con React Navigation

- **Decisión:** las pantallas van en un stack nativo de React Navigation
  (`@react-navigation/native-stack`, con `react-native-screens`), con las rutas tipadas en
  `presentation/navigation`. Es una excepción a lo que decía `RULES.md`: no usar navegación
  porque había una sola pantalla.
- **Por qué:**
  - Con el catálogo (D23) la app tiene dos pantallas, y elegir cuál se ve con un `useState` es
    una navegación hecha a mano: no es una buena práctica.
  - El stack trae el botón "atrás" de Android, el historial y las rutas tipadas, y suma pantallas
    sin tocar `App.tsx`.
- **Resigno:** tres dependencias más, una de ellas nativa, y un build para incluirla.

## D25 · La voz de la app es rioplatense: "Cande", de ElevenLabs

- **Decisión:** la voz del server es "Cande" (`yFykvY9iSJewrANOC0cU`), una voz de la biblioteca de
  ElevenLabs con acento porteño, informal y sin tono de locutor. Cierra la pregunta Q4 del research.
- **Por qué:**
  - Con el plan pago de ElevenLabs la API deja usar las voces de la biblioteca; con el gratis
    solo había voces de acento neutro, como "Sarah".
  - El productor habla en rioplatense: una voz que le contesta igual se siente del lugar.
  - Ya en uso, tarda lo mismo que Sarah (0,64 s una frase corta). La primera frase con la voz
    puede tardar varios segundos: si pasa de 1,5 s, esa frase la dice la voz del teléfono.
- **Resigno:** depender de un plan pago de ElevenLabs. Sin él, la voz vuelve a fallar y la app
  habla con la del teléfono.

## D26 · Detrás de las tarjetas, el resumen desenfocado

- **Decisión:** con tarjetas en pantalla, la lista ocupa todo el alto, de la barra de estado a
  la zona de voz, y lo de atrás se desenfoca en vivo con `expo-blur` (`dimezisBlurView`, que
  anda en Android 11). Los bordes de la lista se funden cuando quedan tarjetas por recorrer.
  `VISUAL.md` decía "sin desenfoque en vivo": se corrigió para admitir este único caso.
- **Por qué:**
  - A veces no entraba ni una tarjeta en la mitad de abajo de la pantalla.
  - El desenfoque deja claro que las tarjetas van por delante y el resumen queda de fondo.
  - El fundido avisa que la lista se puede recorrer.
- **Resigno:** una dependencia nativa más, y un desenfoque que en Android 11 cuesta más que
  en los teléfonos nuevos.

## D27 · El splash es el primer cuadro de la entrada del logo

- **Decisión:** al abrir, el splash muestra el orbe con el logo adentro, al 55 % y en el centro
  de la ventana, que es el primer cuadro de la entrada. La app lo quita sin fundido cuando dibuja
  ese mismo cuadro, y sigue con la entrada: el logo se derrite en el orbe, aparece el micrófono,
  el orbe baja a su lugar y recién ahí aparece el resto.
- **Por qué:** la carga y la entrada se ven como una sola animación, sin un salto entre el
  splash y la app.
- **Resigno:** unos 3 s de entrada en cada apertura (se apaga con `EXPO_PUBLIC_LOGO_INTRO=false`),
  y una imagen de splash que hay que volver a sacar si cambia el orbe.

## D28 · Escalabilidad: de un productor a miles

- **Decisión:** la versión de hoy está pensada para un productor y un teléfono. No se construyó
  la escala, pero sí se pensó qué pasa con miles de productores y qué cambiaría primero.
- **Costo por pedido:**
  - Entender un audio con Gemini cuesta entre US$ 0,21 y US$ 0,30 cada mil pedidos (175 a 231
    tokens de entrada y 40 a 97 de salida, medido en el research).
  - La voz cuesta US$ 0,05 cada mil caracteres: una respuesta de 90 caracteres, unos US$ 4,50
    cada mil. **La voz es más del 90 % del costo de un turno.**
  - Con mil productores y 20 turnos por día cada uno, son 20.000 turnos diarios: unos US$ 6 de
    modelo y unos US$ 90 de voz por día.
  - Lo que ya lo baja: las frases cortas (la muletilla y el aviso sin señal) están grabadas en
    la app y no cuestan nada, y la voz del teléfono es el respaldo gratis.
- **Límites del server:**
  - No guarda estado, así que crece poniendo más copias detrás de un balanceador, sin cambiar
    el código.
  - Cada turno tiene ocupada una conexión hasta 7 s, mientras espera al modelo. Node aguanta
    muchas conexiones así porque solo espera, pero el techo real es el de los proveedores: el
    límite de pedidos por minuto de Gemini, que en el plan gratis es de unos 15. Con miles de
    productores hace falta el plan pago y que el server reparta los pedidos y avise con un
    `429` claro.
  - Ya rechaza audios de más de 2 MB, y la cola del teléfono reintenta con pausas, así que un
    corte del proveedor no se convierte en una avalancha de reintentos.
- **Los datos, en el teléfono o en un servicio:**
  - Hoy viven en un JSON del teléfono. Alcanza para uno, pero se pierden si se pierde el
    teléfono, y no los comparten el dueño, el encargado y el peón.
  - Con miles hace falta una base por establecimiento en un servicio, con sincronización. La
    app sigue funcionando sin señal: anota en el teléfono y sincroniza cuando vuelve, como ya
    hace con los audios guardados. Hay que resolver conflictos, por ejemplo dos personas que
    mueven animales del mismo lote.
- **Identificar a quien llama:**
  - Hoy hay una sola clave de la app (`X-App-Key`), adentro del APK. Frena a quien encuentre la
    dirección del server, pero se puede sacar del APK.
  - Con miles hace falta una cuenta por persona: un token por usuario, con límites de pedidos y
    de gasto por cuenta, para que nadie pueda gastar el presupuesto de todos.
- **Qué cambiaría primero:**
  1. Cuentas por usuario con límite de pedidos: es lo que protege el costo.
  2. Bajar el costo de la voz: guardar las respuestas que se repiten, o una voz más barata para
     las frases largas.
  3. Llevar los datos a un servicio, con la sincronización sin señal.
- **Resigno:** hoy no hay cuentas ni base compartida. Es lo que la consigna pidió no construir,
  y es lo primero que haría falta para salir del piloto.
