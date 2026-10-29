"""Generate PWA icons from the Duitku logo.

Usage:
    python scripts/generate-icons.py
    python scripts/generate-icons.py --source public/image.png --out public/icons

Requires Pillow (`pip install pillow`). Output is committed to the repo so the
build does not need Python.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

BRAND = (0x35, 0x25, 0xCD)
SURFACE = (0xF8, 0xF9, 0xFF)

# (filename, size, background, logo ratio)
VARIANTS = [
    ("icon-192.png", 192, None, 1.0),
    ("icon-512.png", 512, None, 1.0),
    ("icon-maskable-512.png", 512, BRAND, 0.62),
    ("apple-touch-icon.png", 180, SURFACE, 0.88),
    ("favicon-32.png", 32, None, 1.0),
]


def render(logo: Image.Image, size: int, background: tuple[int, int, int] | None, ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background + (255,) if background else (0, 0, 0, 0))
    target = max(1, round(size * ratio))
    scaled = logo.resize((target, target), Image.Resampling.LANCZOS)
    offset = ((size - target) // 2, (size - target) // 2)
    canvas.alpha_composite(scaled, offset)
    return canvas


def main() -> None:
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", default=str(root / "public" / "image.png"))
    parser.add_argument("--out", default=str(root / "public" / "icons"))
    args = parser.parse_args()

    source = Path(args.source)
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as raw:
        logo = raw.convert("RGBA")
        if logo.width != logo.height:
            side = max(logo.width, logo.height)
            square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            square.alpha_composite(logo, ((side - logo.width) // 2, (side - logo.height) // 2))
            logo = square

        for filename, size, background, ratio in VARIANTS:
            icon = render(logo, size, background, ratio)
            path = out_dir / filename
            icon.save(path, format="PNG", optimize=True)
            print(f"{path.relative_to(root)}  {size}x{size}")


if __name__ == "__main__":
    main()
