import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { AmbientShell } from '@/presentation/features/home/components/AmbientShell';
import { UserSettingsProvider } from '@/presentation/features/settings/states/UserSettingsProvider';

// El splash queda hasta que la pantalla de inicio dibuja el primer cuadro de la entrada, que es
// la misma imagen: se quita sin fundido, así no se nota el cambio.
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0 });

export function App() {
  useEffect(() => container.interpreter.wakeUp(), []);

  return (
    <SafeAreaProvider>
      <DependenciesProvider dependencies={container}>
        <UserSettingsProvider>
          <AmbientShell>
            <RootNavigator />
          </AmbientShell>
        </UserSettingsProvider>
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
