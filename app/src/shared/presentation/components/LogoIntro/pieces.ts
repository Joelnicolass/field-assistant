// Las parcelas del logo de FieldData, una por una. Archivo generado por
// scripts/split_logo.py: no se edita a mano. Las medidas son fracciones del tamaño
// del logo (0 a 1), contadas desde su esquina de arriba a la izquierda.
export type LogoPiece = {
  /** La parcela nítida, blanda y muy blanda (cada vez más desenfocada). */
  sharp: number;
  soft: number;
  melted: number;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Cuánto más grandes son, de cada lado, las versiones desenfocadas. */
  softMargin: number;
  meltedMargin: number;
  /** El color promedio de la parcela: es el color de su resplandor. */
  color: string;
};

export const LOGO_PIECES: LogoPiece[] = [
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-1.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-1-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-1-derretida.png'),
    x: 0.4512,
    y: 0.2188,
    width: 0.1445,
    height: 0.1445,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#FF8F61',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-2.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-2-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-2-derretida.png'),
    x: 0.0,
    y: 0.3496,
    width: 0.543,
    height: 0.457,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#43B566',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-3.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-3-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-3-derretida.png'),
    x: 0.5059,
    y: 0.4102,
    width: 0.4941,
    height: 0.4785,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#399C58',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-4.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-4-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-4-derretida.png'),
    x: 0.6113,
    y: 0.2031,
    width: 0.3887,
    height: 0.2363,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#66A7E4',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-5.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-5-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-5-derretida.png'),
    x: 0.4355,
    y: 0.7324,
    width: 0.3418,
    height: 0.2676,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#EBBA5C',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-6.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-6-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-6-derretida.png'),
    x: 0.0078,
    y: 0.0059,
    width: 0.3984,
    height: 0.3926,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#42B466',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-7.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-7-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-7-derretida.png'),
    x: 0.0176,
    y: 0.6406,
    width: 0.3906,
    height: 0.3535,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#30614F',
  },
  {
    sharp: require('../../../../../assets/brand/pieces/parcela-8.png'),
    soft: require('../../../../../assets/brand/pieces/parcela-8-blanda.png'),
    melted: require('../../../../../assets/brand/pieces/parcela-8-derretida.png'),
    x: 0.4492,
    y: 0.0,
    width: 0.4297,
    height: 0.1855,
    softMargin: 0.0527,
    meltedMargin: 0.1523,
    color: '#2F614F',
  },
];
