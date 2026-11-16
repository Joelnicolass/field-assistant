import type { SharedValue } from 'react-native-reanimated';

/** Lo que recibe cada parte de la entrada: el diámetro del orbe y el reloj, en milisegundos. */
export type IntroLayerProps = { size: number; clock: SharedValue<number> };
