import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

export function App() {
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
