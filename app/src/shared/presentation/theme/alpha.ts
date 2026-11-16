/** El mismo color con transparencia: "#RRGGBB" más la opacidad de 0 a 1. */
export function alpha(hex: string, opacity: number): string {
  return `${hex}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`;
}
