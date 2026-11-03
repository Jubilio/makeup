"""Gera data/catalogo.json e data/catalogo.csv a partir do catálogo INUKA 2026 V1.

Os dados foram transcritos à mão da revista (PDF). Para corrigir um preço ou
variante, edite a lista PRODUCTS abaixo e volte a correr:

    python3 scripts/build_catalog.py

Cada produto tem variantes (fragrância, cor, tom). O stock é controlado por
variante (SKU).
"""
import csv
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MODERN_ME = ["Mod Blue", "Mod Green", "Mod Lime", "Mod Orange", "Mod Pink", "Mod Purple", "Mod Yellow"]
EXCL_FEM = ["Creed Aventus for HER", "Empire for HER", "Gold for HER", "Imagine for HER", "Ke Nako for HER", "SuperHero for HER"]
EXCL_MASC = ["Creed Aventus for HIM", "Empire for HIM", "Gold for HIM", "SuperHero for HIM"]
EXCL_GN = ["Ke Nako (GN)"]
SIG = ["Eternal Bliss for HER", "Imperial Grace for HER", "Pure Obsession for HER",
       "Majestic Dawn for HIM", "Rising King for HIM", "Royal Legacy for HIM"]
CLASSIC_FEM = [
    # Grey
    "212 VIP", "Alien", "Be You for HER", "Billion for HER", "Black Opium", "Black Orchid", "Capella",
    "Coco Mademoiselle", "Crown", "Crystal for HER", "Diamond for HER", "Dolce & Gabbana", "Fabulous",
    "Famous", "Fierce for HER", "Forever Creed for HER", "Fortune", "Giorgio", "Gucci Bloom",
    "Gucci Rush for HER", "Heavenly", "Issey Miyake (HER)", "Midnight Million for HER", "Paradise for HER",
    "Pulse", "Queen", "Radiant Gold", "Red Door", "Roberto Cavalli", "Si-Si", "Timeless for HER",
    "Unstoppable for HER", "Yes I Am",
    # Blue / Red / Pink
    "Dylan Blue for HER", "La Vie Est Belle", "Hypnotic Poison", "Jimmy Choo", "Olympea", "Vision for HER",
    "Angel", "Inala for HER", "Lady Million", "Lady Deluxe", "Narciso Rodriguez", "Opulent",
]
CLASSIC_GN = ["Accent", "Be Bold, Brave, Brilliant", "Dare To Be Rare", "Ignite"]
CLASSIC_MASC = [
    "212 (HIM)", "Acqua Absolu", "Antonio Banderas", "Be You for HIM", "Billion for HIM", "Champion",
    "Desire Blue", "Diesel", "Dunhill Icon", "Eternal Gold", "Fearless", "Forever Creed for HIM", "Invictus",
    "Invincible for HIM", "Issey Miyake (HIM)", "M7", "Midnight Million for HIM", "Only You for HIM", "Power",
    "Storm for HIM", "Victory", "VIP Night",
    "Dylan Blue for HIM", "Inala for HIM", "King", "Magnificent", "Royal",
    "1 Million", "Million Deluxe", "Icon Racing", "Lacoste Red", "Vision for HIM",
]
CLASSIC_ALL = CLASSIC_FEM + CLASSIC_GN + CLASSIC_MASC
MIAB = ["Peace", "Hope", "Faith", "Dream"]
LUX_BATH = ["Kendi", "Lumi", "Komo", "Alila", "Amari"]
FOUNDATION = ["Porcelain", "Nude", "Sand", "Latte", "Caramel", "Fudge", "Almond", "Cocoa", "Espresso"]
NAIL_SHADES = [f"{n:03d}" for n in list(range(4, 20)) + [21, 22] + list(range(25, 33))]

# (categoria, linha, nome, tamanho, preço MT ou None, variantes, página, notas)
P = []
def add(cat, line, name, size, price, variants=None, page=None, note=""):
    P.append(dict(category=cat, line=line, name=name, size=size, price_mzn=price,
                  variants=variants or [], page=page, note=note))

# Perfumes e corpo
add("Perfumes", "Modern Me", "Modern Me Perfume", "35ml", 1200, MODERN_ME, 3)
add("Corpo", "Modern Me", "Modern Me Lotion", "50ml", 350, MODERN_ME, 3)
add("Corpo", "Modern Me", "Modern Me Hair & Body Mist", "100ml", 600, MODERN_ME, 3)
add("Corpo", "Modern Me", "Modern Me Bath Salt", "220g", 350, MODERN_ME, 3)
add("Corpo", "Modern Me", "Modern Me Body Wash", "50ml", 350, MODERN_ME, 3)
add("Perfumes", "Exclusive", "Exclusive Range Perfume", "30ml", 1500, EXCL_FEM + EXCL_MASC + EXCL_GN, 4)
add("Corpo", "Exclusive", "Exclusive Range Lotion", "100ml", 500, EXCL_FEM + EXCL_MASC + EXCL_GN, 4)
add("Corpo", "Exclusive", "Exclusive Range Body Wash", "100ml", 450, EXCL_FEM + EXCL_MASC + EXCL_GN, 4)
add("Corpo", "Exclusive", "Exclusive Range Roll-On", "50ml", 550, EXCL_FEM + EXCL_MASC + EXCL_GN, 4)
add("Corpo", "Exclusive", "Exclusive Range After Shave Balm", "100ml", 700, EXCL_MASC, 4,
    "Só nas fragrâncias masculinas")
add("Perfumes", "Signature", "Signature Range Perfume", "50ml", 2500, SIG, 5, "Em caixa de oferta")
add("Perfumes", "Classic", "Classic Range Perfume", "30ml", 1200, CLASSIC_ALL, 6)
add("Corpo", "Classic", "Classic Range Lotion", "200ml", 700, CLASSIC_ALL, 7,
    "CONFIRMAR: revista remete a 'lista da pág. 8' que não existe; assumi as fragrâncias Classic")
add("Corpo", "Classic", "Classic Range Body Wash", "200ml", 600, CLASSIC_ALL, 7,
    "CONFIRMAR: mesmas fragrâncias da loção")
add("Perfumes", "Luxury Travel", "Luxury Travel Fragrance Set", "5x10ml", 2500, ["Pour Femme", "Pour Homme"], 9,
    "Edição limitada")
add("Perfumes", "Message in a Bottle", "Message in a Bottle Perfume", "30ml", 1200, MIAB, 10)
add("Corpo", "Message in a Bottle", "Message in a Bottle Lotion", "200ml", 700, MIAB, 10)
add("Corpo", "Message in a Bottle", "Message in a Bottle Body Wash", "200ml", 600, MIAB, 10)
add("Corpo", "Message in a Bottle", "Message in a Bottle Tissue Oil", "100ml", 700, MIAB, 10)
# Casa
add("Casa", "Home", "Reed Room Diffuser", "120ml", 1500, ["Amber Aura", "Midnight Calm"], 12)
add("Casa", "Home", "Scented Fragranced Envelope", "10g", 350, ["Amber Aura", "Midnight Calm"], 13)
add("Casa", "Home", "Car & Wardrobe Diffuser", "7ml", 350,
    ["Be Bold, Brave, Brilliant", "Creed Aventus for HER", "Creed Aventus for HIM", "Dare to be Rare", "Ke Nako"], 13)
add("Casa", "Home", "Room Mist", "100ml", 600, ["Rain", "Rose"], 13)
add("Casa", "Home", "Bloom The Room Mist", "125ml", 700, None, 29)
add("Casa", "Home", "Lime, Basil & Mandarin Hand Sanitizer", "45ml", 350, None, 29)
add("Casa", "Home", "Waterless Hand Sanitizing Gel", "300ml", 600, None, 29)
# Criança
add("Criança", "Little Miss", "Little Miss EDT Perfume Mist", "30ml", 1200, ["Adorable", "Charming"], 14)
add("Criança", "Little Miss", "Little Miss Lotion", "200ml", 700, ["Adorable", "Charming"], 14)
add("Criança", "Youth Collection", "Youth Collection Perfume", "45ml", 900,
    ["Sparkle Rush", "Sweet Crush", "Sugar Pop", "Jet Blaze", "Game On"], 15, "Revista diz 'Coming soon'")
add("Criança", "Mohlolo Kids", "Epsom Soak for Kiddies", "900g", 700, None, 16)
add("Criança", "Mohlolo Kids", "Mohlolo Shampoo + Body Wash", "300ml", 600, None, 16)
add("Criança", "Mohlolo Kids", "Mohlolo Bubble Bath", "300ml", 600, None, 16)
# Mohlolo natural
add("Bem-estar", "Mohlolo", "Insect Repellent Serum", "50ml", 600, None, 17)
add("Lábios", "Mohlolo", "Intense Therapy Lip Balm", "15ml", 350, None, 17)
add("Cabelo", "Mohlolo", "Mohlolo Hair Rinse Off", "250ml", 700, None, 19)
add("Cabelo", "Mohlolo", "Mohlolo Hair & Braid Spray", "250ml", 700, None, 19)
add("Cabelo", "Mohlolo", "Mohlolo Hair Food & Styling Pomade", "150ml", 700, None, 19)
add("Cabelo", "Mohlolo", "Mohlolo Coffee Infused Hair Growth Oil", "50ml", 700, None, 20)
add("Cabelo", "Mohlolo", "Mohlolo Hair Serum", "50ml", 1500, None, 20)
add("Cabelo", "Mohlolo", "Mohlolo Revitalizing Shampoo", "200ml", 700, None, 21)
add("Cabelo", "Mohlolo", "Mohlolo Nourishing Conditioner", "200ml", 700, None, 21)
add("Pele", "Mohlolo", "Mohlolo Skin Clearing", "30ml", 700, None, 22)
add("Pele", "Mohlolo", "Mohlolo Miracle Oil", "30ml", 700, None, 22)
add("Bem-estar", "Mohlolo", "Essential Oil Blend", "10ml", 350,
    ["Soothing", "Protective", "Calming", "Skin Clearing", "Uplifting", "Health Shield"], 23)
add("Bem-estar", "Mohlolo", "Essential Oil Set", "6x10ml", 2000, None, 23)
add("Bem-estar", "Mohlolo", "Sports Massage Oil", "30ml", 700, None, 24)
add("Bem-estar", "Mohlolo", "Relief Remedy Rub", "50ml", 900, None, 24)
add("Bem-estar", "Epsom", "Epsom Soak Soothing", "900g", 700, None, 25)
add("Bem-estar", "Epsom", "Epsom Soak Relaxing", "900g", 700, None, 25)
add("Bem-estar", "Sleep Well", "Lala Pillow Spray", "100ml", 600, None, 26)
add("Bem-estar", "Sleep Well", "Natural Skin Repair Oil", "125ml", 1200, None, 27)
add("Bem-estar", "Sleep Well", "Linen, Pillow & Pyjama Mist", "125ml", 1200, None, 27)
add("Bem-estar", "Sleep Well", "Good Night Massage Oil", "30ml", 700, None, 27)
add("Pele", "Tissue Oil", "Tissue Oil", "150ml", 1200, ["Lavender", "Orange Jasmine"], 28)
# Banho de luxo
add("Corpo", "Luxury Bath", "Hand & Body Lotion", "300ml", 900, LUX_BATH, 30)
add("Corpo", "Luxury Bath", "Hand & Body Wash", "300ml", 700, LUX_BATH, 30)
add("Corpo", "Luxury Bath", "Bath Salts", "390g", 600, LUX_BATH, 30)
# Pés
add("Pés", "Foot Range", "Heel Repair Balm", "60ml", 800, None, 32)
add("Pés", "Foot Range", "Cooling Foot Mist", "100ml", 600, None, 32)
add("Pés", "Foot Range", "Mineral Foot Soak", "200ml", 800, None, 33)
add("Pés", "Foot Range", "Mineral Foot Scrub", "200ml", 800, None, 33)
add("Pés", "Foot Range", "Mineral Foot Moisturizer", "200ml", 900, None, 33)
# Pele (skincare)
add("Pele", "Skincare", "Daily Facial Foaming Cleanser", "150ml", 1500, None, 34)
add("Pele", "Skincare", "Natural & Gentle Makeup Removing Oil", "50ml", 600, None, 34)
add("Pele", "Skincare", "Multi Effect Moisturizer", "45ml", 1500, None, 35)
add("Pele", "Skincare", "Hydrating Facial Essence", "50ml", 500, None, 36)
add("Pele", "Skincare", "Age-Defying Squalane Serum", "50ml", 1300, None, 36)
add("Pele", "Skincare", "Solar Shield Sunscreen SPF50", "50ml", 1200, None, 48, "Disponível a partir de jan. 2026")
# Maquilhagem
add("Maquilhagem", "Makeup", "Flawless Skin Perfecting Foundation", "35ml", 1300, FOUNDATION, 37)
add("Maquilhagem", "Makeup", "Mattifying Loose Powder", "5g", 1200, ["MLP70", "MLP71", "MLP72", "MLP73"], 37)
add("Maquilhagem", "Makeup", "3 in 1 Eyebrow Pencil", "", 1000, ["Black (EB10)", "Brown (EB20)"], 38)
add("Maquilhagem", "Makeup", "Long-Wear Liquid Eyeliner", "", 600, ["Black (LE40)", "Brown (LE41)"], 39,
    "CONFIRMAR qual código é preto e qual é castanho")
add("Maquilhagem", "Makeup", "Gel Pencil Eyeliner", "", 950, ["White", "Dark Blue", "Dark Green", "Brown"], 39,
    "CONFIRMAR cores (lidas da imagem)")
add("Maquilhagem", "Makeup", "Fibre Volumizing Mascara", "", 600, None, 40)
add("Maquilhagem", "Makeup", "Extreme Impact Fibre Mascara", "", 1000, None, 40)
add("Maquilhagem", "Makeup", "Eyeshadow Palette 9 Shades", "", 1500, ["ES71 Shimmer", "ES72 Matte"], 41)
add("Maquilhagem", "Makeup", "Mineral Blusher", "9g", 1400, ["MB24", "MB25"], 41)
# Lábios
add("Lábios", "Makeup", "Matt Liquid Lipstick", "", 700, [f"ML{n}" for n in range(10, 17)], 42)
add("Lábios", "Makeup", "Satin Liquid Lipstick", "", 700, [f"SL{n}" for n in range(20, 25)], 42)
add("Lábios", "Makeup", "Lipstick Removing Oil", "30ml", None, None, 43, "SEM PREÇO na revista")
add("Lábios", "Makeup", "Lip Gloss", "2,3g", 600,
    ["LG50 Clear Shine", "LG51 Silver Shimmer", "LG52 Holographic Shimmer", "LG53 Gold Shimmer"], 43)
add("Lábios", "Makeup", "Lipliner", "", 700, ["LL80 Purple Plum", "LL82 Dusty Pink"], 43)
add("Lábios", "Makeup", "Lip Scrub", "12g", 450, ["Lemon", "Vanilla"], 45,
    "CONFIRMAR sabores: revista diz '5 sabores' mas só mostra 2")
add("Lábios", "Makeup", "Flavoured Lip Balm", "5,5g", 350, ["Lemon", "Vanilla"], 45,
    "CONFIRMAR sabores: revista diz '5 sabores' mas só mostra 2")
# Mãos e unhas
add("Unhas", "Nails", "Hand & Cuticle Cream", "30ml", 250, None, 44,
    "CONFIRMAR sabores: revista diz '5 sabores' sem os nomear")
add("Unhas", "Nails", "Nail & Cuticle Conditioner", "11ml", 550, None, 46)
add("Unhas", "Nails", "Colour Stay Nail Polish", "11ml", 450, NAIL_SHADES + ["MN301", "MN302", "MN303", "MN304"], 47,
    "CONFIRMAR: assumi que a gama Metallic (MN301-304) tem o mesmo preço")
add("Unhas", "Nails", "Top Coat", "11ml", 1150,
    ["001 Natural Light Gel Effect", "MN300 Plumping Gel Effect", "019 Matte Finish"], 46)
add("Unhas", "Nails", "French Manicure Set", "3x11ml", 1150, None, 47)


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main():
    products, rows = [], []
    for p in P:
        pid = slug(f"{p['name']} {p['size']}")
        variants = p["variants"] or ["Único"]
        p_out = {"id": pid, **p, "variants": [{"sku": f"{pid}--{slug(v)}", "name": v} for v in variants]}
        products.append(p_out)
        for v in p_out["variants"]:
            rows.append([p_out["category"], p_out["line"], p_out["name"], p_out["size"], v["name"],
                         p_out["price_mzn"] if p_out["price_mzn"] is not None else "", v["sku"],
                         p_out["page"], p_out["note"]])
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data/catalogo.json").write_text(json.dumps(
        {"source": "INUKA Product Catalogue 2026 V1", "currency": "MZN", "products": products},
        ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with open(ROOT / "data/catalogo.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["Categoria", "Linha", "Produto", "Tamanho", "Variante", "Preço (MT)", "SKU", "Página", "Nota"])
        w.writerows(rows)
    flagged = [p for p in products if p["note"].startswith(("CONFIRMAR", "SEM PREÇO"))]
    print(f"{len(products)} produtos, {len(rows)} variantes (SKUs), {len(flagged)} a confirmar")


if __name__ == "__main__":
    main()
