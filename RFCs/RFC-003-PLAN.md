# Plan · RFC-003 · Design system y pantalla de inicio

Cuatro pasos. Los implementa y prueba el orquestador directamente y se detiene después de cada
uno para la revisión del autor. Cada paso se mira en el teléfono por Metro y en el catálogo.

| Paso | Objetivo | Estado |
| --- | --- | --- |
| A | Tema, tipografía y piezas básicas (`AppText`, `Icon`, `Surface`) | aprobado |
| B | Botón con cuenta y tarjeta (`AppButton`, `InfoCard`) | aprobado |
| C | El orbe y el subtítulo (`Orb`, `RevealText`) | aprobado |
| D | Pantalla de inicio, zona de voz, catálogo y limpieza | aprobado |

Rama por paso, con su PR a `feature/rfc-003`: `feature/rfc-003-A` a `-D`.

**Único build del RFC:** en el paso A, porque la tipografía se incrusta con el plugin de
`expo-font` y suma un paquete. El resto llega por Metro.

---

## Paso A · Tema, tipografía y piezas básicas

```
app/
  [~] package.json  app.json   @expo-google-fonts/plus-jakarta-sans y el plugin de expo-font
src/shared/presentation/
  [+] theme/        Theme, ThemeMode, los temas claro y oscuro, TextVariant, Tone; theme.test.ts
  [+] states/       ThemeProvider (recibe mode)
  [+] hooks/        useTheme, useStyles
  [+] components/   AppText, Icon (los nueve íconos), Surface
src/presentation/features/catalog/
  [+] CatalogScreen con los textos, los íconos y las superficies, y el selector de tema
src/core/configs/settings.ts   [~] rootScreen (EXPO_PUBLIC_SHOW_CATALOG)
src/App.tsx                    [~] elige la pantalla con Record<RootScreen, ComponentType>
```

**Criterios:** 1 a 5, 7, 15, y el arranque del catálogo (26).

**Cómo se comprueba:** `theme.test.ts` (contraste, tamaños y `touch.primary`), typecheck, lint,
un build de debug con la fuente y el catálogo en el teléfono, en los dos temas.

---

## Paso B · Botón con cuenta y tarjeta

```
src/shared/presentation/components/
  [+] AppButton/    con countdown (barra animada en el hilo de la interfaz, se frena con paused)
  [+] InfoCard/     un componente chico por bloque: encabezado, número, mensaje, ruta, renglones,
                    ejemplos, botones y "lo que se entendió"
src/presentation/features/catalog/   [~] las catorce tarjetas con datos de ejemplo
```

**Criterios:** 8, 9, 10, 16 y 21 (en el catálogo).

**Cómo se comprueba:** typecheck, lint y las catorce tarjetas en el catálogo, con capturas.

---

## Paso C · El orbe y el subtítulo

```
src/shared/presentation/components/
  [+] Orb/          estados, fichas, capas, dibujos del centro y useOrbMotion; orbStates.test.ts
  [+] RevealText/   el texto que aparece palabra por palabra
src/presentation/features/catalog/   [~] el orbe con selector de estado y tres niveles de voz
```

**Criterios:** 6, 11 a 14 y 16.

**Cómo se comprueba:** el test de las fichas, typecheck, lint, el orbe en el catálogo en los
cuatro estados y el área táctil con `adb shell uiautomator dump`.

---

## Paso D · Pantalla de inicio, zona de voz, catálogo y limpieza

```
src/presentation/features/home/
  [+] HomeScreen, TodaySummaryPanel, useTodaySummary, todaySummaryView (con test)
src/presentation/features/voice/
  [+] VoiceStage, useVoiceStage (reposo, sin tarjetas)
src/presentation/features/catalog/   [~] VoiceStage con y sin tarjeta, y un botón "Volver"
src/di/                              (sin cambios: los casos de uso ya están)
src/App.tsx                          [~] guarda qué pantalla se ve; arranca en settings.rootScreen
[-] src/presentation/features/research/
```

**El catálogo se queda** como una pantalla aparte (pedido del autor): la pantalla de inicio
tiene un botón chico "Ver el DS" que lo abre, y el catálogo vuelve con "Volver". Sin librería
de navegación: `App.tsx` guarda la pantalla actual. `EXPO_PUBLIC_SHOW_CATALOG=1` sigue
abriéndolo directo.

**Cambios del autor al revisar:** el resumen sigue el orden de su captura: el logo con "Field
Data" ⇄ "Field Assistant" (cada 10 segundos, sin movimiento) y el campo debajo, alineado con la F;
lo anotado hoy como un aviso con un punto de color; los datos con la unidad al lado del número; y
el panel de lotes con su título y los lotes activos. El título de la app es más chico (`title`,
22/28). VISUAL 7.1 quedó con estos valores.

**Pendiente, para iterar:** mientras el subtítulo aparece, su animación se superpone con el
panel de lotes.

**Criterios:** 17 a 28.

**Cómo se comprueba:** el test de `todaySummaryView`, typecheck, lint, la app abriendo en la
pantalla real con los datos de `farm.json`, y en modo avión.

---

## Referencia

Para el tema, la tarjeta, el orbe y la zona de voz hay una implementación de referencia con los
valores de `VISUAL.md`. Se toma como guía y se adapta a la arquitectura y a las reglas del
proyecto (`RULES.md`): componentes en su carpeta, estilos con `createStyles(theme)` y la lógica
en hooks.
