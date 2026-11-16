import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootScreen } from '@/core/configs/RootScreen';
import type { RootStackParamList } from '@/presentation/navigation/RootStackParamList';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { useCatalogTheme } from '../../hooks/useCatalogTheme';
import { CatalogContent } from '../CatalogContent';

type CatalogScreenProps = NativeStackScreenProps<RootStackParamList, RootScreen.Catalog>;

export function CatalogScreen({ navigation }: CatalogScreenProps) {
  const { mode, toggleMode } = useCatalogTheme();
  return (
    <ThemeProvider mode={mode}>
      {/* navigate vuelve al inicio si está debajo, y lo abre si el catálogo fue la primera pantalla. */}
      <CatalogContent
        mode={mode}
        onToggleMode={toggleMode}
        onBack={() => navigation.navigate(RootScreen.Home)}
      />
    </ThemeProvider>
  );
}
