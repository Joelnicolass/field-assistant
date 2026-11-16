# Research de Field Assistant

Comprobaciones del RFC-001 hechas en el teléfono y en la máquina de desarrollo. Cada una anota
fecha, dispositivo, qué se esperaba y qué dio.

## Dispositivo y herramientas

| Dato | Valor |
| --- | --- |
| Teléfono | Motorola moto e40 |
| Android | 11 (API 30) |
| ABI | arm64-v8a |
| RAM | 3,4 GB (`MemTotal` 3.561.108 kB) |
| Conexión | USB, `adb reverse tcp:8081 tcp:8081` |
| Node | 24.14.1 |
| JDK | 17.0.14 |
| Gradle | 9.4.1 |
| Expo | SDK 58 (`expo` ~58.0.25) |
| React Native | 0.88.1 |

## I7 · El build de release

- **Fecha:** 16-nov-2026.
- **Dispositivo:** moto e40, Android 11 (API 30), arm64-v8a. El APK se compiló solo para
  arm64-v8a.
- **Se espera:** sin las reglas de R8 falla; con ellas compila. El APK pesa menos de 100 MB.

**Qué dio:**

| Build | Resultado | Tiempo | APK |
| --- | --- | --- | --- |
| `assembleRelease` sin `extraProguardRules` | `BUILD FAILED` en `:app:minifyReleaseWithR8` | 1 min 36 s | no se genera |
| `assembleRelease` con las cuatro reglas | `BUILD SUCCESSFUL` | 2 min 8 s | 76.917.577 bytes (76,9 MB; 73,4 MiB) |
| `assembleDebug` | `BUILD SUCCESSFUL` | 1 min 9 s (56 s el primero) | 122.881.425 bytes (122,9 MB; 117,2 MiB) |

El error sin las reglas:

```
> Task :app:minifyReleaseWithR8 FAILED
ERROR: Missing classes detected while running R8. Please add the missing classes or apply additional keep rules that are generated in .../app/android/app/build/outputs/mapping/release/missing_rules.txt.
ERROR: R8: Missing class java.awt.Component (referenced from: long com.sun.jna.Native.getWindowHandle0(java.awt.Component))
Execution failed for task ':app:minifyReleaseWithR8'.
> A failure occurred while executing com.android.build.gradle.internal.tasks.R8Task$R8Runnable
BUILD FAILED in 1m 36s
```

JNA (que usa Vosk) referencia `java.awt`, que Android no tiene. Las reglas de `app.json`
(`extraProguardRules` en `expo-build-properties`) lo resuelven:

```
-dontwarn java.awt.**
-keep class com.sun.jna.** { *; }
-keepclassmembers class * extends com.sun.jna.** { public *; }
-keep class org.vosk.** { *; }
```

**Receta:** `npx expo prebuild --platform android --clean`, y después, en `app/android`,
`./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a`. Tras un `prebuild --clean`
o un release hay que volver a correr `assembleDebug` para tener el APK de debug.

**Veredicto:** se cumple. Falla sin las reglas, compila con ellas y el APK pesa 76,9 MB, menos
de los 100 MB esperados.

## I8 · Variables `EXPO_PUBLIC_*` en release

- **Fecha:** 16-nov-2026.
- **Dispositivo:** moto e40, Android 11 (API 30), arm64-v8a. Los builds son de release; el
  valor se busca dentro del APK, sin instalarlo.
- **Se espera:** el valor queda fijo al armar el paquete. Si no se vacía la caché de Metro, el
  segundo build conserva el valor viejo. Se anota la receta que funciona.

`ResearchScreen` muestra `settings.serverUrl` (que lee `EXPO_PUBLIC_SERVER_URL`), así que el
valor llega al bundle. La búsqueda:

```
unzip -p app/android/app/build/outputs/apk/release/app-release.apk assets/index.android.bundle | grep -a -c '<texto>'
```

(`strings` no sirve en macOS.) La variable se exporta al correr Gradle; no hay ningún `.env`.

**Qué dio** (coincidencias dentro del APK):

| # | Comando | Valor buscado | Coincidencias |
| --- | --- | --- | --- |
| 1 | Receta (ver abajo) con `http://valor-uno.test` | `valor-uno` | 1 |
| 2 | `assembleRelease`, con `http://valor-dos.test`, sin vaciar la caché | `valor-uno` / `valor-dos` | 1 / 0 (queda el valor viejo) |
| 3 | `assembleRelease --rerun-tasks`, con `valor-dos`, sin borrar `metro-cache` | `valor-uno` / `valor-dos` | 0 / 1 |
| 4 | `createBundleReleaseJsAndAssets --rerun-tasks` (sin borrar `metro-cache`), con `valor-tres` | `valor-dos` / `valor-tres` | 0 / 1 |
| 5 | Receta completa, con `valor-cuatro` | `valor-tres` / `valor-cuatro` | 0 / 1 |

**Lo que se vio distinto de lo esperado:** el valor viejo no lo guarda la caché de Metro, sino
Gradle. Cambiar una variable de entorno no invalida la tarea
`createBundleReleaseJsAndAssets`, así que `assembleRelease` la da por al día y reusa el bundle
anterior (fila 2). Con `--rerun-tasks` el bundle se rearma con el valor nuevo aunque la caché
de Metro siga ahí (filas 3 y 4). Borrar la caché no hizo falta en esta prueba; se deja en la
receta porque no cuesta nada.

**Receta que funciona:**

```
export EXPO_PUBLIC_SERVER_URL=<url>
rm -rf "$TMPDIR/metro-cache"
./gradlew app:createBundleReleaseJsAndAssets --rerun-tasks -PreactNativeArchitectures=arm64-v8a
./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a
```

Tiempos: el bundle tarda entre 12 y 23 s y el `assembleRelease` que sigue, unos 10 s.
`assembleRelease --rerun-tasks` también sirve, pero rehace todo (1 min 57 s).

**Veredicto:** el valor queda fijo en el paquete. Cambiarlo exige forzar la tarea del bundle;
no alcanza con volver a correr `assembleRelease`.

## Faltan

Todavía sin hacer: I1, I2, I3, I4, I5, I6, I9, I10, I11 e I13. I12 se quitó.
