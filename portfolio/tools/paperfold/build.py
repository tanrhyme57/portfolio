"""Build the folded-paper font. All glyphs are drawn on a grid where
1 unit = stroke width, x-height = 4, ascender = 5, descender = -1."""
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely.geometry.polygon import orient
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
import sys, os

U = 140          # font units per grid unit
SB = 0.5         # side bearing in grid units (concept spacing is 1u between glyphs)
FAMILY = "Paperfold"

def R(x0, y0, x1, y1): return box(x0, y0, x1, y1)
def P(*pts): return Polygon(pts)
def topT(y=3, w=3): return P((0, y), (1, y + 1), (w - 1, y + 1), (w, y))       # chamfered top bar
def botT(y=0, w=3): return P((0, y + 1), (1, y), (w - 1, y), (w, y + 1))       # chamfered bottom bar
def octa(w=3, h=4): return P((0, 1), (1, 0), (w - 1, 0), (w, 1), (w, h - 1), (w - 1, h), (1, h), (0, h - 1))
def shift(g, dx=0, dy=0):
    from shapely.affinity import translate
    return translate(g, dx, dy)

G = {}  # name -> (shape, advance width in units, codepoints)

def add(name, cps, w, *parts, minus=()):
    g = unary_union(parts)
    for m in minus: g = g.difference(m)
    G[name] = (g, w, cps)

# ---------- lowercase ----------
add("a", [0x61], 3, topT(), R(0, 1, 1, 3), P((0, 1), (1, 0), (1, 1)), R(2, 0, 3, 3), P((1, 0), (2, 1), (2, 2), (1, 1)))
add("b", [0x62], 3, R(0, 1, 1, 5), P((0, 1), (1, 0), (1, 1)), R(1, 3, 2, 4), P((2, 4), (3, 3), (2, 3)), R(2, 1, 3, 3), R(1, 0, 2, 1), P((2, 0), (3, 1), (2, 1)))
add("c", [0x63], 3, topT(), R(0, 1, 1, 3), botT())
add("d", [0x64], 3, R(2, 1, 3, 5), P((3, 1), (2, 0), (2, 1)), R(1, 3, 2, 4), P((0, 3), (1, 4), (1, 3)), R(0, 1, 1, 3), R(1, 0, 2, 1), P((0, 1), (1, 0), (1, 1)))
add("e", [0x65], 3, topT(), P((2, 3), (3, 3), (2, 2)), R(1, 2, 2, 3), R(0, 1, 1, 3), botT())
add("f", [0x66], 3, topT(), R(0, -1, 1, 3), R(1, 1, 2, 2), minus=[P((0, 2), (0.5, 1.5), (0, 1))])
add("g", [0x67], 3, topT(), R(0, 2, 1, 3), R(2, 2, 3, 3), P((0, 2), (2, 2), (3, 1), (1, 1)), R(2, 0, 3, 1.01), R(1, -1, 2, 0.01), P((2, -1), (2, 0), (3, 0)))
add("h", [0x68], 3, R(0, 0, 1, 5), R(1, 3, 2, 4), P((2, 4), (3, 3), (2, 3)), R(2, 0, 3, 3))
add("i", [0x69], 1, R(0, 0, 1, 4))
add("j", [0x6A], 3, R(2, 1, 3, 4), botT(), R(0, 1, 1, 2))
add("k", [0x6B], 3, R(0, 0, 1, 5), P((1, 2), (3, 2), (2, 3), (3, 4), (1.5, 4), (1, 3.5)), R(2, 0, 3, 2))
add("l", [0x6C], 3, R(0, 1, 1, 5), botT())
add("m", [0x6D], 5, topT(), shift(topT(), 2), R(0, 0, 1, 3), R(2, 1, 3, 3), R(4, 0, 5, 3))
add("n", [0x6E], 3, topT(), R(0, 0, 1, 3), R(2, 0, 3, 3))
add("o", [0x6F], 3, octa(), minus=[R(1, 1, 2, 3)])
add("p", [0x70], 3, topT(), R(0, 0, 1, 3), R(2, 2, 3, 3), R(1, 1, 2, 2), P((2, 2), (3, 2), (2, 1)))
add("q", [0x71], 3, topT(), R(0, 1, 1, 3), P((0, 1), (1, 0), (1, 1)), R(1, 0, 2, 1), P((2, 1), (2, 0), (3, 0)), R(2, 2, 3, 3), P((2, 2), (3, 2), (2, 1)))
add("r", [0x72], 3, topT(), R(0, 0, 1, 3), R(2, 2, 3, 3))
add("s", [0x73], 3, topT(), P((0, 3), (1, 3), (1, 1.5), (0, 2.5)), R(1, 1.5, 2, 2.5), P((2, 1), (3, 1), (3, 1.5), (2, 2.5)), botT())
add("t", [0x74], 2.5, R(0.5, 1, 1.5, 5), R(0, 3, 2.5, 4), P((0.5, 1), (1.5, 0), (2.5, 0), (2.5, 1)))
add("u", [0x75], 3, R(0, 1, 1, 4), R(2, 1, 3, 4), botT())
add("v", [0x76], 3, R(0, 1, 1, 4), P((0, 1), (1, 0), (1, 1)), P((1, 0), (3, 2), (3, 3.25), (1, 1.25)))
add("w", [0x77], 5, R(0, 1, 1, 4), R(2, 1, 3, 3), R(4, 1, 5, 4), botT(), shift(botT(), 2))
add("x", [0x78], 4, P((0, 3.25), (0.75, 4), (4, 0.75), (3.25, 0)), P((3.25, 4), (4, 3.25), (0.75, 0), (0, 0.75)))
add("y", [0x79], 3, R(0, 2, 1, 4), R(2, 0, 3, 4), P((0, 2), (1, 1), (2, 1), (2, 2)), R(1, -1, 2, 0.01), P((2, -1), (2, 0), (3, 0)))
add("z", [0x7A], 3, P((0, 3), (0, 4), (2, 4), (3, 3)), P((2, 3), (3, 3), (1, 1), (0, 1)), P((0, 1), (1, 0), (3, 0), (3, 1)))

# ---------- digits ----------
add("one", [0x31], 2, P((0, 3), (1, 4), (1, 3), (0.5, 2.5)), P((1, 3), (1, 4), (2, 3)), R(1, 0, 2, 3))
add("two", [0x32], 3, topT(), P((2, 3), (3, 3), (3, 2.5), (2, 1.5)), R(1, 1.5, 2, 2.5), P((0, 1), (1, 1), (1, 2.5), (0, 1.5)), P((0, 1), (1, 0), (3, 0), (3, 1)))
add("three", [0x33], 3, topT(), R(2, 1, 3, 3), R(1, 1.5, 2, 2.5), botT(), minus=[P((3, 2.5), (2.5, 2), (3, 1.5))])
add("four", [0x34], 3, R(0, 2, 1, 4), R(2, 0, 3, 3), P((0, 2), (1, 1), (2, 1), (2, 2)))
add("five", [0x35], 3, P((0, 3), (1, 4), (3, 4), (3, 3)), P((0, 3), (1, 3), (1, 1.5), (0, 2.5)), R(1, 1.5, 2, 2.5), P((2, 1), (3, 1), (3, 1.5), (2, 2.5)), botT())
add("six", [0x36], 3, topT(), R(0, 1, 1, 3), R(1, 1, 2, 2), P((2, 2), (2, 1), (3, 1)), botT())
add("seven", [0x37], 3, topT(), R(2, 0, 3, 3))
add("eight", [0x38], 3, octa(), minus=[R(1, 2.5, 2, 3), R(1, 1, 2, 1.5), P((0, 2.5), (0.5, 2), (0, 1.5)), P((3, 2.5), (2.5, 2), (3, 1.5))])
add("nine", [0x39], 3, topT(), R(0, 2, 1, 3), R(2, 0, 3, 3), P((0, 2), (1, 1), (2, 1), (2, 2)))
add("zero", [0x30], 3, octa(), minus=[R(1, 1, 2, 3)])

# ---------- punctuation from the concept ----------
add("period", [0x2E], 1, R(0, 0, 1, 1))
add("comma", [0x2C], 1, R(0, 0, 1, 1), P((0, 0), (1, 0), (0, -1)))
add("colon", [0x3A], 1, R(0, 0, 1, 1), R(0, 2, 1, 3))
add("semicolon", [0x3B], 1, R(0, 0, 1, 1), P((0, 0), (1, 0), (0, -1)), R(0, 2, 1, 3))

# ---------- extras drawn in the same style (not in the concept) ----------
add("hyphen", [0x2D], 2, R(0, 1.5, 2, 2.5))
add("quotesingle", [0x27, 0x2019], 1, R(0, 4, 1, 5), P((0, 4), (1, 4), (0, 3)))
add("exclam", [0x21], 1, R(0, 2, 1, 5), R(0, 0, 1, 1))
add("question", [0x3F], 3, topT(4), P((2, 4), (3, 4), (3, 3.5), (2, 2.5)), R(1, 2, 2, 3), R(1, 0, 2, 1))
add("slash", [0x2F], 3, P((0, -1), (1, -1), (3, 5), (2, 5)))

# ---------- Polish letters (diacritics in the same folded style) ----------
acute = P((1, 4.5), (2, 4.5), (3, 5.5), (2, 5.5))
dot = R(1, 4.5, 2, 5.5)
def ogonek(x): return P((x, 0.01), (x + 1, 0.01), (x + 1, -1))
for base, cp, extra, w in [
    ("a", 0x105, ogonek(2), 3), ("c", 0x107, acute, 3), ("e", 0x119, ogonek(1), 3),
    ("n", 0x144, acute, 3), ("o", 0xF3, acute, 3), ("s", 0x15B, acute, 3),
    ("z", 0x17A, acute, 3), ("z", 0x17C, dot, 3)]:
    add(f"uni{cp:04X}", [cp], w, G[base][0], extra)
add("lslash", [0x142], 3, G["l"][0], P((-0.25, 2.25), (0.5, 3), (1.75, 4.25), (1.75, 3.25), (-0.25, 1.25)))

# uppercase → lowercase forms (the concept has no capitals)
for c in range(26):
    G[chr(0x61 + c)][2].append(0x41 + c)
for lc, uc in [(0x105, 0x104), (0x107, 0x106), (0x119, 0x118), (0x144, 0x143), (0xF3, 0xD3), (0x15B, 0x15A), (0x17A, 0x179), (0x17C, 0x17B)]:
    G[f"uni{lc:04X}"][2].append(uc)
G["lslash"][2].append(0x141)

# ---------- outline helpers ----------
def contours(geom, ccw_outer):
    polys = [geom] if geom.geom_type == "Polygon" else list(geom.geoms)
    out = []
    for p in polys:
        p = orient(p.buffer(0).simplify(1e-6), 1.0 if ccw_outer else -1.0)
        out.append(list(p.exterior.coords)[:-1])
        for i in p.interiors: out.append(list(i.coords)[:-1])
    return out

def draw(pen, geom, ccw_outer):
    for c in contours(geom, ccw_outer):
        pts = [(round((x + SB) * U), round(y * U)) for x, y in c]
        # drop duplicate consecutive points after rounding
        clean = [p for i, p in enumerate(pts) if p != pts[i - 1]]
        pen.moveTo(clean[0])
        for p in clean[1:]: pen.lineTo(p)
        pen.closePath()

order = [".notdef", "space"] + list(G.keys())
cmap = {0x20: "space", 0xA0: "space"}
for n, (_, _, cps) in G.items():
    for cp in cps: cmap[cp] = n
adv = {".notdef": round(3 * U + 2 * SB * U), "space": round(2.5 * U)}
for n, (_, w, _) in G.items(): adv[n] = round((w + 2 * SB) * U)

KERN = """
languagesystem DFLT dflt;
languagesystem latn dflt;
@punct = [period comma];
@round = [a c d e g o q s six eight nine zero];
feature kern {
  pos r @punct -70;
  pos seven @punct -70;
  pos v @punct -50;
  pos f @punct -50;
  pos t @punct -35;
  pos r @round -35;
  pos one one -35;
} kern;
"""

def build(fmt, path):
    fb = FontBuilder(1000, isTTF=(fmt == "ttf"))
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    glyphs = {}
    for n in order:
        if n == "space":
            geom = None
        elif n == ".notdef":
            geom = box(0, 0, 3, 4).difference(box(0.5, 0.5, 2.5, 3.5))
        else:
            geom = G[n][0]
        if fmt == "ttf":
            pen = TTGlyphPen(None)
            if geom is not None: draw(pen, geom, ccw_outer=False)
            glyphs[n] = pen.glyph()
        else:
            pen = T2CharStringPen(adv[n], None)
            if geom is not None: draw(pen, geom, ccw_outer=True)
            glyphs[n] = pen.getCharString()
    if fmt == "ttf":
        fb.setupGlyf(glyphs)
    else:
        fb.setupCFF(FAMILY.replace(" ", "") + "-Regular", {"FullName": FAMILY + " Regular"}, glyphs, {})
    metrics = {}
    for n in order:
        if n == "space": lsb = 0
        elif n == ".notdef": lsb = round(SB * U)
        else: lsb = round((G[n][0].bounds[0] + SB) * U)
        metrics[n] = (adv[n], lsb)
    fb.setupHorizontalMetrics(metrics)
    asc, desc = round(6 * U), -round(1.5 * U)
    fb.setupHorizontalHeader(ascent=asc, descent=desc)
    fb.setupNameTable({"familyName": FAMILY, "styleName": "Regular",
                       "version": "Version 1.000",
                       "copyright": "Built from a concept image; check original design source before public use."})
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=desc, sTypoLineGap=0,
                usWinAscent=asc, usWinDescent=-desc, sxHeight=4 * U, sCapHeight=4 * U,
                achVendID="NONE", fsType=0)
    fb.setupPost()
    if fmt == "ttf":
        fb.font["head"].flags |= 0
    addOpenTypeFeaturesFromString(fb.font, KERN)
    fb.save(path)
    return fb.font

if __name__ == "__main__":
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    build("otf", f"{out}/{FAMILY}-Regular.otf")
    f = build("ttf", f"{out}/{FAMILY}-Regular.ttf")
    from fontTools.ttLib import TTFont
    w = TTFont(f"{out}/{FAMILY}-Regular.ttf"); w.flavor = "woff2"; w.save(f"{out}/{FAMILY}-Regular.woff2")
    print("glyphs:", len(order))
