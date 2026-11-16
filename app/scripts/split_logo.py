"""Separa el logo de FieldData en sus parcelas, para animarlas una por una.

El logo es un círculo con parcelas de colores separadas por caminos blancos. Este script
junta los píxeles de color que se tocan entre sí: cada grupo es una parcela. Guarda cada
una como imagen aparte y escribe src/shared/presentation/components/LogoIntro/pieces.ts con su posición y su color.

De cada parcela guarda tres versiones: nítida, blanda y muy blanda (desenfocadas). La app
pasa de una a otra mientras la parcela se mueve, y así parece que se derrite. El
desenfoque se prepara acá porque Android 11 no sabe desenfocar una vista en vivo.

Uso, desde app/:  python3 scripts/split_logo.py
"""
from PIL import Image, ImageDraw, ImageFilter
import math

SOURCE = 'assets/brand/logo.png'
OUT_DIR = 'assets/brand/pieces'
MODULE = 'src/shared/presentation/components/LogoIntro/pieces.ts'
MIN_AREA = 400  # grupos más chicos que esto son restos del borde, no parcelas
# Cuánto se desenfoca cada versión, en píxeles del logo original (512 de lado).
SOFT_BLUR = 9
MELT_BLUR = 26


def blurred(piece, box, radius):
    """La parcela desenfocada. Devuelve la imagen y el margen que hubo que agregarle."""
    margin = radius * 3  # el desenfoque se desparrama hacia afuera: necesita lugar
    canvas = Image.new('RGBA', (piece.size[0] + 2 * margin, piece.size[1] + 2 * margin), (0, 0, 0, 0))
    canvas.paste(piece, (margin, margin))
    # Se desenfoca con el color ya multiplicado por la transparencia ("RGBa"); si no, lo
    # transparente cuenta como negro y el borde queda con un halo oscuro.
    soft = canvas.convert('RGBa').filter(ImageFilter.GaussianBlur(radius)).convert('RGBA')
    # Desenfocada no tiene detalle: a mitad de tamaño pesa la cuarta parte y se ve igual.
    return soft.resize((soft.size[0] // 2, soft.size[1] // 2), Image.LANCZOS), margin

logo = Image.open(SOURCE).convert('RGBA')
size = logo.size[0]
pixels = logo.load()

# 1. Qué píxeles son "de color": opacos y que no sean el blanco de los caminos.
is_color = Image.new('L', logo.size, 0)
mask = is_color.load()
for y in range(size):
    for x in range(size):
        r, g, b, a = pixels[x, y]
        if a > 128 and min(r, g, b) < 205:
            mask[x, y] = 255

# 2. Cada grupo de píxeles de color que se tocan es una parcela. Se pinta cada grupo
#    con un número distinto (1, 2, 3...) para poder separarlos.
label = 0
groups = []
for y in range(size):
    for x in range(size):
        if mask[x, y] == 255:
            label += 1
            ImageDraw.floodfill(is_color, (x, y), label)
            area = sum(1 for value in is_color.getdata() if value == label)
            if area >= MIN_AREA:
                groups.append(label)

pieces = []
for label in groups:
    # 3. La forma de la parcela, agrandada dos píxeles para incluir su borde suavizado.
    shape = is_color.point(lambda value: 255 if value == label else 0).filter(ImageFilter.MaxFilter(5))
    box = shape.getbbox()

    # El color promedio de la parcela, para la mancha difusa en la que se convierte.
    inside = [pixels[x, y] for y in range(box[1], box[3]) for x in range(box[0], box[2]) if is_color.getpixel((x, y)) == label]
    mean = tuple(round(sum(color[i] for color in inside) / len(inside)) for i in range(3))

    # 4. La imagen de la parcela. En el borde, el archivo original mezcla el color con el
    #    blanco del camino; acá esa mezcla se convierte en transparencia, para que la
    #    parcela no arrastre un filo blanco cuando se mueve.
    piece = Image.new('RGBA', logo.size, (0, 0, 0, 0))
    out = piece.load()
    shape_pixels = shape.load()
    for y in range(box[1], box[3]):
        for x in range(box[0], box[2]):
            if shape_pixels[x, y] == 0:
                continue
            r, g, b, a = pixels[x, y]
            if is_color.getpixel((x, y)) == label:
                out[x, y] = (r, g, b, a)
            else:
                # Cuánto le falta a este píxel para ser blanco, comparado con el color de la parcela.
                toward_white = sum(255 - channel for channel in (r, g, b))
                full = sum(255 - channel for channel in mean)
                opacity = max(0.0, min(1.0, toward_white / full)) * (a / 255)
                out[x, y] = (*mean, round(opacity * 255))
    piece = piece.crop(box)

    center = ((box[0] + box[2]) / 2 - size / 2, (box[1] + box[3]) / 2 - size / 2)
    pieces.append({'image': piece, 'box': box, 'mean': mean, 'distance': math.hypot(*center)})

# 5. En orden de cercanía al centro: las de adentro son las primeras que se lleva el remolino.
pieces.sort(key=lambda item: item['distance'])

lines = [
    '// Las parcelas del logo de FieldData, una por una. Archivo generado por',
    '// scripts/split_logo.py: no se edita a mano. Las medidas son fracciones del tamaño',
    '// del logo (0 a 1), contadas desde su esquina de arriba a la izquierda.',
    'export type LogoPiece = {',
    '  /** La parcela nítida, blanda y muy blanda (cada vez más desenfocada). */',
    '  sharp: number;',
    '  soft: number;',
    '  melted: number;',
    '  x: number;',
    '  y: number;',
    '  width: number;',
    '  height: number;',
    '  /** Cuánto más grandes son, de cada lado, las versiones desenfocadas. */',
    '  softMargin: number;',
    '  meltedMargin: number;',
    '  /** El color promedio de la parcela: es el color de su resplandor. */',
    '  color: string;',
    '};',
    '',
    'export const LOGO_PIECES: LogoPiece[] = [',
]
folder = "../../../../../assets/brand/pieces"
for index, item in enumerate(pieces):
    name = f'parcela-{index + 1}'
    item['image'].save(f'{OUT_DIR}/{name}.png')
    soft, soft_margin = blurred(item['image'], item['box'], SOFT_BLUR)
    melted, melted_margin = blurred(item['image'], item['box'], MELT_BLUR)
    soft.save(f'{OUT_DIR}/{name}-blanda.png')
    melted.save(f'{OUT_DIR}/{name}-derretida.png')
    x0, y0, x1, y1 = item['box']
    lines += [
        '  {',
        f"    sharp: require('{folder}/{name}.png'),",
        f"    soft: require('{folder}/{name}-blanda.png'),",
        f"    melted: require('{folder}/{name}-derretida.png'),",
        f'    x: {x0 / size:.4f},',
        f'    y: {y0 / size:.4f},',
        f'    width: {(x1 - x0) / size:.4f},',
        f'    height: {(y1 - y0) / size:.4f},',
        f'    softMargin: {soft_margin / size:.4f},',
        f'    meltedMargin: {melted_margin / size:.4f},',
        f"    color: '#%02X%02X%02X'," % item['mean'],
        '  },',
    ]
    print(name, item['box'])
lines += ['];', '']
open(MODULE, 'w').write('\n'.join(lines))
print(len(pieces), 'parcelas')


