export enum RootScreen {
  Home = 'home',
  Catalog = 'catalog',
}

/** Lo que recibe cada pantalla raíz: cómo pasar a otra. */
export type RootScreenProps = { onNavigate: (screen: RootScreen) => void };
