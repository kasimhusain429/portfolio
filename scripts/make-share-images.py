"""
Generates the social share card and raster icons from the brand palette.
  public/og-image.png         1200x630  (Open Graph / Twitter card)
  public/apple-touch-icon.png  180x180
  public/favicon-32.png         32x32
Run: python scripts/make-share-images.py   (needs Pillow)
Colours mirror src/styles/tokens.css.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
INK_900, INK = (16, 13, 46), (24, 20, 79)
PAPER = (248, 244, 238)
IRIS_600, IRIS_300 = (91, 63, 240), (194, 182, 255)
ORCHID_500, CORAL_500, MARIGOLD_500, TEAL_400 = (220, 87, 208), (255, 111, 91), (255, 185, 39), (79, 220, 200)


def font(names, size):
    for n in names:
        p = Path("C:/Windows/Fonts") / n
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def glow(size, centre, radius, colour, alpha):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = centre
    d.ellipse([x - radius, y - radius, x + radius, y + radius], fill=colour + (alpha,))
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.55))


def og():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), INK_900 + (255,))
    for c, r, col, a in [((980, 80), 380, ORCHID_500, 150), ((140, 600), 340, IRIS_600, 170),
                         ((1150, 620), 260, CORAL_500, 140), ((560, 700), 220, MARIGOLD_500, 90)]:
        img = Image.alpha_composite(img, glow((W, H), c, r, col, a))
    # portrait in a rounded arch
    portrait = Image.open(PUBLIC / "about" / "kasim.webp").convert("RGBA")
    pw, ph = 330, 470
    portrait = portrait.resize((pw, int(portrait.height * pw / portrait.width)), Image.LANCZOS).crop((0, 0, pw, ph))
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw, ph + 200], radius=pw // 2, fill=255)
    frame = Image.new("RGBA", (pw + 8, ph + 8), (0, 0, 0, 0))
    ImageDraw.Draw(frame).rounded_rectangle([0, 0, pw + 8, ph + 208], radius=(pw + 8) // 2, fill=IRIS_300 + (255,))
    img.alpha_composite(frame, (W - pw - 116, H - ph - 4))
    img.paste(portrait, (W - pw - 112, H - ph), mask)
    d = ImageDraw.Draw(img)
    d.text((80, 150), "Kasim Husain", font=font(["segoeuib.ttf", "arialbd.ttf"], 92), fill=PAPER)
    d.text((84, 270), "Frontend engineer", font=font(["seguisli.ttf", "georgiai.ttf", "segoeui.ttf"], 48), fill=IRIS_300)
    d.text((84, 350), "React interfaces with care for", font=font(["segoeui.ttf", "arial.ttf"], 32), fill=PAPER)
    d.text((84, 392), "motion, layout and performance.", font=font(["segoeui.ttf", "arial.ttf"], 32), fill=PAPER)
    x = 84
    for col in (IRIS_600, ORCHID_500, CORAL_500, MARIGOLD_500, TEAL_400):
        d.rounded_rectangle([x, 470, x + 56, 478], radius=4, fill=col)
        x += 66
    img.convert("RGB").save(PUBLIC / "og-image.png", optimize=True)


def icon(size, name):
    s = size * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s, s], radius=s // 4, fill=INK + (255,))
    f = font(["segoeuib.ttf", "arialbd.ttf"], int(s * 0.62))
    d.text((s * 0.2, s * 0.08), "K", font=f, fill=PAPER)
    r = s * 0.085
    d.ellipse([s * 0.7 - r, s * 0.72 - r, s * 0.7 + r, s * 0.72 + r], fill=ORCHID_500)
    img.resize((size, size), Image.LANCZOS).save(PUBLIC / name, optimize=True)


if __name__ == "__main__":
    og()
    icon(180, "apple-touch-icon.png")
    icon(32, "favicon-32.png")
    print("wrote og-image.png, apple-touch-icon.png, favicon-32.png")
