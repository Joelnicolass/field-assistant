export function diagonal([start, middle, end]: readonly [string, string, string]): string {
  return `linear-gradient(135deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
}
