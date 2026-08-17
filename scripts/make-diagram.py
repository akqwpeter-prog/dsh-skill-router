#!/usr/bin/env python3
"""Draw docs/screenshots/how-it-works.png — the routing flow, self-contained."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
W, H = 1280, 640
BG = (13, 18, 40)
CARD = (24, 32, 64)
BLUE = (77, 107, 254)
BLUE_SOFT = (159, 176, 224)
TEXT = (240, 244, 255)
MUTED = (159, 176, 224)
GREEN = (74, 222, 128)

FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_CJK = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"


def main() -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    title_f = ImageFont.truetype(FONT_BOLD, 34)
    card_f = ImageFont.truetype(FONT_BOLD, 21)
    sub_f = ImageFont.truetype(FONT_REG, 16)
    cjk_f = ImageFont.truetype(FONT_CJK, 15)

    d.text((48, 34), "How the router works", font=title_f, fill=TEXT)
    d.text((48, 78), "规则命中才注入技能，零命中零介入", font=cjk_f, fill=MUTED)

    def card(x, y, w, h, title, subs, accent=BLUE, fill=CARD):
        d.rounded_rectangle((x, y, x + w, y + h), radius=14, fill=fill, outline=accent, width=2)
        d.text((x + 18, y + 16), title, font=card_f, fill=TEXT)
        yy = y + 52
        for s in subs:
            d.text((x + 18, yy), s, font=sub_f, fill=MUTED)
            yy += 26

    def arrow(x1, y1, x2, y2, color=BLUE_SOFT):
        import math
        d.line((x1, y1, x2, y2), fill=color, width=3)
        ang = math.atan2(y2 - y1, x2 - x1)
        for da in (0.42, -0.42):
            d.line((x2, y2, x2 - 16 * math.cos(ang + da), y2 - 16 * math.sin(ang + da)),
                   fill=color, width=3)

    # Row 1: hook + match
    card(48, 140, 300, 170, "agent/pre-step", ["hooks every step, reads the", "latest user message"], accent=BLUE)
    arrow(348, 215, 390, 215)
    card(390, 140, 420, 170, "Rule match", ["~/.dsh/skill-router.yaml first,", "then each skill's whenToUse", "trigger. First match wins."], accent=BLUE)
    arrow(810, 215, 852, 215)
    card(852, 140, 380, 170, "Hit?", ["no hit → zero intervention,", "model keeps its catalog flow"], accent=GREEN)

    # Row 2: outcome
    card(390, 400, 420, 190, "Pour", ["matched skill bodies injected as", "skill-invocation messages; the", "already-loaded rule applies;", "at most once per session"], accent=GREEN)
    arrow(560, 310, 560, 400)
    card(852, 400, 380, 190, "Silence", ["no LLM judge, no embeddings,", "no tokens spent until a rule", "actually pours"], accent=BLUE)

    out = ROOT / "docs" / "screenshots" / "how-it-works.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    print("wrote:", out)


if __name__ == "__main__":
    main()
