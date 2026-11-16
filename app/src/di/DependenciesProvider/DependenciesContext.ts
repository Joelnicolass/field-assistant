import { createContext } from 'react';

import type { Dependencies } from '@/di/Dependencies';

export const DependenciesContext = createContext<Dependencies | null>(null);
