import { StatusBar } from 'expo-status-bar';
import { useState, type ComponentType } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootScreen, type RootScreenProps } from '@/core/configs/RootScreen';
import { settings } from '@/core/configs/settings';
import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { CatalogScreen } from '@/presentation/features/catalog/components/CatalogScreen';
import { HomeScreen } from '@/presentation/features/home/components/HomeScreen';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

const SCREENS: Record<RootScreen, ComponentType<RootScreenProps>> = {
  [RootScreen.Home]: HomeScreen,
  [RootScreen.Catalog]: CatalogScreen,
};

export function App() {
  const [screen, setScreen] = useState(settings.rootScreen);
  const Screen = SCREENS[screen];
  return (
    <SafeAreaProvider>
      <ThemeProvider mode={ThemeMode.Light}>
        <DependenciesProvider dependencies={container}>
          <StatusBar style="dark" />
          <Screen onNavigate={setScreen} />
        </DependenciesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
