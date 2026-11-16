/** El encabezado con la clave que el server pide a la app; sin clave configurada, ninguno. */
export function appKeyHeader(appKey: string): Record<string, string> {
  return appKey === '' ? {} : { 'X-App-Key': appKey };
}
