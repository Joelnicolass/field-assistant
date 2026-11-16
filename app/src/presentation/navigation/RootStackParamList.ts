import type { RootScreen } from '@/core/configs/RootScreen';

/** Las pantallas de la app y lo que recibe cada una: ninguna recibe parámetros. */
export type RootStackParamList = {
  [RootScreen.Home]: undefined;
  [RootScreen.Catalog]: undefined;
};
