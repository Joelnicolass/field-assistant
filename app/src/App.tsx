import type { ComponentType } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootScreen } from '@/core/configs/RootScreen';
import { settings } from '@/core/configs/settings';
import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { CatalogScreen } from '@/presentation/features/catalog/components/CatalogScreen';
import { ResearchScreen } from '@/presentation/features/research/components/ResearchScreen';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { ThemeMode } from '@/shared/presentation/theme/ThemeMode';

const SCREENS: Record<RootScreen, ComponentType> = {
  [RootScreen.Home]: ResearchScreen,
  [RootScreen.Catalog]: CatalogScreen,
};

export function App() {
  const Screen = SCREENS[settings.rootScreen];
  return (
    <SafeAreaProvider>
      <ThemeProvider mode={ThemeMode.Light}>
        <DependenciesProvider dependencies={container}>
          <Screen />
        </DependenciesProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
