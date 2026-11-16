import { RootScreen } from '@/core/configs/RootScreen';

export const settings: { serverUrl: string; rootScreen: RootScreen } = {
  serverUrl: process.env.EXPO_PUBLIC_SERVER_URL ?? 'http://localhost:8787',
  rootScreen: process.env.EXPO_PUBLIC_SHOW_CATALOG === '1' ? RootScreen.Catalog : RootScreen.Home,
};
