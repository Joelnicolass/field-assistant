import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

// El splash queda hasta que la pantalla de inicio dibuja el primer cuadro de la entrada, que es
// la misma imagen: se quita sin fundido, así no se nota el cambio.
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0 });

export function App() {
  useEffect(() => container.interpreter.wakeUp(), []);

  return (
    <SafeAreaProvider>
      <ThemeProvider mode={ThemeMode.Light}>
        <DependenciesProvider dependencies={container}>
          <StatusBar style="dark" />
          <RootNavigator />
        </DependenciesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
