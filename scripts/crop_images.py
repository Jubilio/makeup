"""Recorta as fotos dos produtos a partir das páginas da revista INUKA (PDF).

Uso:
    python3 scripts/crop_images.py caminho/para/catalogo.pdf

Cada entrada em CROPS indica a página do PDF e a caixa (x0, y0, x1, y1) em
frações da página (0 a 1). O recorte é alargado até ficar quadrado e gravado
em public/produtos/<id>.webp. Para trocar uma foto por uma foto real, basta
substituir o ficheiro .webp com o mesmo nome.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "produtos"
SIZE = 640

CROPS = {
    "modern-me-perfume-35ml": (2, 0.34, 0.12, 1.0, 0.97),
    "modern-me-lotion-50ml": (3, 0.12, 0.45, 0.48, 0.97),
    "modern-me-hair-body-mist-100ml": (3, 0.0, 0.45, 0.22, 0.97),
    "modern-me-bath-salt-220g": (3, 0.38, 0.6, 0.78, 0.97),
    "modern-me-body-wash-50ml": (3, 0.12, 0.45, 0.48, 0.97),
    "exclusive-range-perfume-30ml": (4, 0.0, 0.3, 0.62, 1.0),
    "exclusive-range-lotion-100ml": (4, 0.0, 0.3, 0.62, 1.0),
    "exclusive-range-body-wash-100ml": (4, 0.0, 0.3, 0.62, 1.0),
    "exclusive-range-roll-on-50ml": (4, 0.0, 0.3, 0.62, 1.0),
    "exclusive-range-after-shave-balm-100ml": (4, 0.0, 0.3, 0.62, 1.0),
    "signature-range-perfume-50ml": (5, 0.28, 0.4, 0.97, 1.0),
    "classic-range-perfume-30ml": (6, 0.02, 0.62, 0.4, 1.0),
    "classic-range-lotion-200ml": (7, 0.02, 0.4, 0.45, 0.95),
    "classic-range-body-wash-200ml": (7, 0.17, 0.4, 0.62, 0.95),
    "luxury-travel-fragrance-set-5x10ml": (9, 0.45, 0.1, 1.0, 1.0),
    "message-in-a-bottle-perfume-30ml": (10, 0.22, 0.22, 0.57, 0.78),
    "message-in-a-bottle-lotion-200ml": (10, 0.6, 0.22, 0.95, 0.78),
    "message-in-a-bottle-body-wash-200ml": (11, 0.2, 0.22, 0.57, 0.78),
    "message-in-a-bottle-tissue-oil-100ml": (11, 0.6, 0.22, 0.97, 0.78),
    "reed-room-diffuser-120ml": (12, 0.1, 0.2, 0.55, 0.98),
    "scented-fragranced-envelope-10g": (13, 0.02, 0.0, 0.4, 0.45),
    "car-wardrobe-diffuser-7ml": (13, 0.4, 0.55, 0.68, 0.88),
    "room-mist-100ml": (13, 0.72, 0.58, 0.98, 0.94),
    "bloom-the-room-mist-125ml": (29, 0.83, 0.3, 0.98, 0.9),
    "lime-basil-mandarin-hand-sanitizer-45ml": (29, 0.06, 0.47, 0.25, 0.88),
    "waterless-hand-sanitizing-gel-300ml": (29, 0.33, 0.05, 0.53, 0.6),
    "little-miss-edt-perfume-mist-30ml": (14, 0.47, 0.18, 1.0, 0.88),
    "little-miss-lotion-200ml": (14, 0.47, 0.18, 1.0, 0.88),
    "youth-collection-perfume-45ml": (15, 0.02, 0.3, 0.4, 0.62),
    "epsom-soak-for-kiddies-900g": (16, 0.0, 0.38, 0.48, 0.98),
    "mohlolo-shampoo-body-wash-300ml": (16, 0.6, 0.38, 0.8, 0.98),
    "mohlolo-bubble-bath-300ml": (16, 0.8, 0.38, 0.99, 0.98),
    "insect-repellent-serum-50ml": (17, 0.09, 0.28, 0.27, 0.98),
    "intense-therapy-lip-balm-15ml": (17, 0.69, 0.38, 1.0, 0.88),
    "mohlolo-hair-rinse-off-250ml": (19, 0.51, 0.17, 0.98, 0.6),
    "mohlolo-hair-braid-spray-250ml": (19, 0.51, 0.17, 0.98, 0.6),
    "mohlolo-hair-food-styling-pomade-150ml": (19, 0.51, 0.17, 0.98, 0.6),
    "mohlolo-coffee-infused-hair-growth-oil-50ml": (20, 0.3, 0.18, 0.48, 0.98),
    "mohlolo-hair-serum-50ml": (20, 0.5, 0.35, 0.7, 0.98),
    "mohlolo-revitalizing-shampoo-200ml": (21, 0.55, 0.32, 0.7, 0.95),
    "mohlolo-nourishing-conditioner-200ml": (21, 0.69, 0.32, 0.84, 0.95),
    "mohlolo-skin-clearing-30ml": (22, 0.37, 0.33, 0.52, 0.98),
    "mohlolo-miracle-oil-30ml": (22, 0.83, 0.25, 0.97, 0.95),
    "essential-oil-blend-10ml": (23, 0.08, 0.55, 0.5, 1.0),
    "essential-oil-set-6x10ml": (23, 0.08, 0.55, 0.73, 1.0),
    "sports-massage-oil-30ml": (24, 0.12, 0.17, 0.3, 0.85),
    "relief-remedy-rub-50ml": (24, 0.64, 0.6, 0.9, 0.92),
    "epsom-soak-soothing-900g": (25, 0.35, 0.18, 0.58, 0.75),
    "epsom-soak-relaxing-900g": (25, 0.62, 0.45, 0.88, 0.98),
    "lala-pillow-spray-100ml": (26, 0.06, 0.05, 0.32, 0.52),
    "natural-skin-repair-oil-125ml": (27, 0.15, 0.1, 0.31, 0.93),
    "linen-pillow-pyjama-mist-125ml": (27, 0.29, 0.1, 0.44, 0.93),
    "good-night-massage-oil-30ml": (27, 0.42, 0.35, 0.56, 0.93),
    "tissue-oil-150ml": (28, 0.22, 0.25, 0.5, 0.8),
    "hand-body-lotion-300ml": (30, 0.28, 0.25, 0.98, 0.92),
    "hand-body-wash-300ml": (30, 0.28, 0.25, 0.98, 0.92),
    "bath-salts-390g": (31, 0.7, 0.28, 0.93, 0.92),
    "heel-repair-balm-60ml": (32, 0.69, 0.5, 0.88, 0.95),
    "cooling-foot-mist-100ml": (32, 0.86, 0.2, 0.97, 0.92),
    "mineral-foot-soak-200ml": (33, 0.08, 0.12, 0.3, 0.42),
    "mineral-foot-scrub-200ml": (33, 0.38, 0.12, 0.62, 0.42),
    "mineral-foot-moisturizer-200ml": (33, 0.69, 0.12, 0.92, 0.42),
    "daily-facial-foaming-cleanser-150ml": (34, 0.08, 0.06, 0.27, 0.95),
    "natural-gentle-makeup-removing-oil-50ml": (34, 0.79, 0.05, 0.97, 0.7),
    "multi-effect-moisturizer-45ml": (35, 0.6, 0.1, 0.9, 0.95),
    "hydrating-facial-essence-50ml": (36, 0.05, 0.3, 0.22, 0.85),
    "age-defying-squalane-serum-50ml": (36, 0.82, 0.32, 0.98, 0.85),
    "solar-shield-sunscreen-spf50-50ml": (48, 0.65, 0.1, 0.95, 0.6),
    "flawless-skin-perfecting-foundation-35ml": (37, 0.16, 0.06, 0.35, 0.6),
    "mattifying-loose-powder-5g": (37, 0.66, 0.52, 1.0, 0.88),
    "3-in-1-eyebrow-pencil": (38, 0.35, 0.05, 0.68, 0.92),
    "long-wear-liquid-eyeliner": (39, 0.04, 0.05, 0.4, 0.78),
    "gel-pencil-eyeliner": (39, 0.4, 0.35, 0.95, 1.0),
    "fibre-volumizing-mascara": (40, 0.25, 0.4, 0.44, 0.98),
    "extreme-impact-fibre-mascara": (40, 0.74, 0.2, 0.97, 0.75),
    "eyeshadow-palette-9-shades": (41, 0.02, 0.05, 0.3, 0.78),
    "mineral-blusher-9g": (41, 0.58, 0.13, 0.96, 0.85),
    "matt-liquid-lipstick": (42, 0.0, 0.03, 0.45, 0.42),
    "satin-liquid-lipstick": (42, 0.03, 0.45, 0.43, 0.82),
    "lipstick-removing-oil-30ml": (43, 0.06, 0.08, 0.24, 0.62),
    "lip-gloss-2-3g": (43, 0.33, 0.25, 0.6, 0.88),
    "lipliner": (43, 0.7, 0.3, 1.0, 0.75),
    "lip-scrub-12g": (45, 0.02, 0.17, 0.4, 0.45),
    "flavoured-lip-balm-5-5g": (45, 0.02, 0.38, 0.4, 0.6),
    "hand-cuticle-cream-30ml": (44, 0.35, 0.22, 0.75, 0.62),
    "nail-cuticle-conditioner-11ml": (46, 0.03, 0.6, 0.13, 0.97),
    "colour-stay-nail-polish-11ml": (47, 0.26, 0.04, 0.62, 0.37),
    "top-coat-11ml": (46, 0.43, 0.45, 0.9, 0.8),
    "french-manicure-set-3x11ml": (47, 0.06, 0.03, 0.22, 0.47),
}


def square_box(box, w, h):
    x0, y0, x1, y1 = box[0] * w, box[1] * h, box[2] * w, box[3] * h
    bw, bh = x1 - x0, y1 - y0
    side = min(max(bw, bh), w, h)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    left = min(max(cx - side / 2, 0), w - side)
    top = min(max(cy - side / 2, 0), h - side)
    return int(left), int(top), int(left + side), int(top + side)


def main(pdf):
    OUT.mkdir(parents=True, exist_ok=True)
    pages = sorted({c[0] for c in CROPS.values()})
    with tempfile.TemporaryDirectory() as tmp:
        for p in pages:
            subprocess.run(["pdftoppm", "-r", "220", "-png", "-f", str(p), "-l", str(p), "-singlefile",
                            pdf, f"{tmp}/p{p}"], check=True)
        for pid, (page, *box) in CROPS.items():
            img = Image.open(f"{tmp}/p{page}.png").convert("RGB")
            crop = img.crop(square_box(box, *img.size)).resize((SIZE, SIZE), Image.LANCZOS)
            crop.save(OUT / f"{pid}.webp", "WEBP", quality=82)
    print(f"{len(CROPS)} imagens em {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
