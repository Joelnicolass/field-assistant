import { SafeAreaProvider } from 'react-native-safe-area-context';

import { container } from '@/di/container';
import { DependenciesProvider } from '@/di/DependenciesProvider';
import { ResearchScreen } from '@/presentation/features/research/components/ResearchScreen';

export function App() {
  return (
    <SafeAreaProvider>
      <DependenciesProvider dependencies={container}>
        <ResearchScreen />
      </DependenciesProvider>
    </SafeAreaProvider>
  );
}
