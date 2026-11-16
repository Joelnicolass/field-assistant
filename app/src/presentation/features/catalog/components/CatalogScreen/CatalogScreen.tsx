import { RootScreen, type RootScreenProps } from '@/core/configs/RootScreen';
import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { useCatalogTheme } from '../../hooks/useCatalogTheme';
import { CatalogContent } from '../CatalogContent';

export function CatalogScreen({ onNavigate }: RootScreenProps) {
  const { mode, toggleMode } = useCatalogTheme();
  return (
    <ThemeProvider mode={mode}>
      <CatalogContent
        mode={mode}
        onToggleMode={toggleMode}
        onBack={() => onNavigate(RootScreen.Home)}
      />
    </ThemeProvider>
  );
}
