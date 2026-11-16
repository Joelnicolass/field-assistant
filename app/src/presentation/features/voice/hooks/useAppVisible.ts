import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Si la app está a la vista: deja de estarlo al pasar a segundo plano. */
export function useAppVisible(): boolean {
  const [visible, setVisible] = useState(AppState.currentState === 'active');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status) => {
      setVisible(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  return visible;
}
