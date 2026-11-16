/** Las gotas de la salpicadura, repartidas en toda la vuelta. */
export const DROPS = 16;

/** Las dos ondas del golpe: cuándo salen, cuánto se abren y qué grosor tienen. */
export const WAVES = [
  { key: 'first', delay: 0, reach: 1.25, thickness: 5 },
  { key: 'second', delay: 130, reach: 0.85, thickness: 3 },
] as const;
