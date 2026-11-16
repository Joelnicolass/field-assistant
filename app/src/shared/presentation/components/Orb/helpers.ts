import { alpha } from '@/shared/presentation/theme/alpha';

/** Una mancha redonda que se apaga hacia el borde. */
export function softSpot(color: string, opacity: number): string {
  return `radial-gradient(circle closest-side at 50% 50%, ${alpha(color, opacity)} 0%, ${alpha(color, opacity * 0.55)} 48%, ${alpha(color, 0)} 100%)`;
}

/** Una capa cuadrada de lado `layer`, centrada sobre una esfera de diámetro `orb`. */
export function centered(orb: number, layer: number) {
  const offset = (orb - layer) / 2;
  return { position: 'absolute', left: offset, top: offset, width: layer, height: layer } as const;
}

/**
 * Estirar y encoger: bajo el dedo se achata y cuando la voz sube de golpe se estira. Lo que
 * gana de alto lo pierde de ancho, así el volumen parece el mismo. La usan la esfera y el aro.
 */
export function squash(voice: number, voiceLag: number, pressed: number) {
  'worklet';
  const stretch = (voice - voiceLag) * 0.16 - pressed * 0.05;
  return { x: 1 - stretch * 0.6, y: 1 + stretch };
}
