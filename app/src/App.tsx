import { SafeAreaProvider } from 'react-native-safe-area-context';

import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { RootNavigator } from '@/presentation/navigation/RootNavigator';
import { AmbientShell } from '@/presentation/features/home/components/AmbientShell';

export function App() {
  return (
    <SafeAreaProvider>
      <DependenciesProvider dependencies={container}>
        <AmbientShell>
          <RootNavigator />
        </AmbientShell>
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
