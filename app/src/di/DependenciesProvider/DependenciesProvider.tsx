import type { ReactNode } from 'react';

import type { Dependencies } from '@/di/Dependencies';
import { DependenciesContext } from './DependenciesContext';

type DependenciesProviderProps = {
  dependencies: Dependencies;
  children: ReactNode;
};

export function DependenciesProvider({ dependencies, children }: DependenciesProviderProps) {
  return <DependenciesContext value={dependencies}>{children}</DependenciesContext>;
}
