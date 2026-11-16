import { ThemeProvider } from '@/shared/presentation/states/ThemeProvider';
import { useCatalogTheme } from '../../hooks/useCatalogTheme';
import { CatalogContent } from '../CatalogContent';

export function CatalogScreen() {
  const { mode, toggleMode } = useCatalogTheme();
  return (
    <ThemeProvider mode={mode}>
      <CatalogContent mode={mode} onToggleMode={toggleMode} />
    </ThemeProvider>
  );
}
