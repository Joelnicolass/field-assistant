import { use } from 'react';

import type { Dependencies } from '@/di/Dependencies';
import { DependenciesContext } from '@/di/DependenciesProvider/DependenciesContext';

export function useDependencies(): Dependencies {
  const dependencies = use(DependenciesContext);
  if (dependencies === null) {
    throw new Error('useDependencies must be used inside DependenciesProvider');
  }
  return dependencies;
}
