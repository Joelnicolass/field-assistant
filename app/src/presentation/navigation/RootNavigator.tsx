import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootScreen } from '@/core/configs/RootScreen';
import { settings } from '@/core/configs/settings';
import { CatalogScreen } from '@/presentation/features/catalog/components/CatalogScreen';
import { HomeScreen } from '@/presentation/features/home/components/HomeScreen';
import type { RootStackParamList } from './RootStackParamList';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Cada pantalla dibuja su propio encabezado: el del stack no se muestra. El fondo del stack es
// transparente para que se vea el de AmbientShell, que se funde al cambiar de tema.
const SCREEN_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
} as const;

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={settings.rootScreen} screenOptions={SCREEN_OPTIONS}>
        <Stack.Screen name={RootScreen.Home} component={HomeScreen} />
        <Stack.Screen name={RootScreen.Catalog} component={CatalogScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
