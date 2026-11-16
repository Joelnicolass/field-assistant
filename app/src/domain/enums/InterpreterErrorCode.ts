export enum InterpreterErrorCode {
  // Pasajeras: se reintenta.
  Offline = 'offline',
  Timeout = 'timeout',
  Server = 'server',
  // Definitivas: no se reintenta.
  Refused = 'refused',
  Unreadable = 'unreadable',
}
