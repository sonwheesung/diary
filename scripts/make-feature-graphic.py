# -*- coding: utf-8 -*-
"""
Play 스토어 **그래픽 이미지**(1024×500) 생성 — 언어별로 뽑는다.

## 왜 필요한가

Play 는 그래픽 이미지도 **언어별 자산**이다. 없으면 기본 언어 것을 물려받는데, 조각의
한국어판에는 `조각 / 하루를 한 조각으로` 가 **그림 안에 박혀 있어** 영어 등록정보에 그대로
나갔다(2026-09-07). 그리고 **기본 언어를 바꾸려면 그 언어가 자기 그래픽을 가져야 한다** —
en-US 를 기본으로 올리려면 이 파일이 먼저 있어야 한다.

## 규약

- `make-assets.py` 와 **같은 팔레트**를 쓴다. 어긋나면 스토어 카드에서 색이 튄다.
- 문자는 번들된 **Pretendard** 로 그린다(앱과 같은 글꼴이라 스토어→앱이 이어져 보인다).
- 🚫 문구를 여기서 **번역하지 않는다.** `assets/store/listing.json` 과 성격이 다르다 —
  저건 스토어가 읽는 문장이고 이건 그림이다. 언어를 추가하려면 아래 `COPY` 에 한 줄 넣는다.
- ⚠ 우측 카드의 점 8개는 **감정 8종**을, 아래 선 3개는 본문을 뜻한다. 한국어판과 같은 구도라
  언어만 갈리고 그림은 같다 — 스토어에서 같은 앱으로 읽히게 하려는 것이다.

실행: python scripts/make-feature-graphic.py [en]
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# make-assets.py 와 같은 값이어야 한다(theme/palettes.ts 가 정본).
BG = "#F5F7FA"
NAVY = "#2C4A7C"
BLUE_MUTED = "#7B9BC4"
CARD = "#FFFFFF"
LINE = "#E8EDF3"
DOT_ON = "#7B9BC4"
DOT_OFF = "#DDE5EF"
SUB = "#8A9BB4"

W, H = 1024, 500
SS = 2  # 안티에일리어싱 배율

FONT_DIR = "assets/fonts"
SEMIBOLD = os.path.join(FONT_DIR, "Pretendard-SemiBold.otf")
MEDIUM = os.path.join(FONT_DIR, "Pretendard-Medium.otf")
REGULAR = os.path.join(FONT_DIR, "Pretendard-Regular.otf")

# 언어별 문구. 🔴 앱 이름은 로마자 `Jogak` 으로 둔다 — 스토어 제목(`Jogak - Private Diary
# Journal`)과 같은 이름이 그림에도 보여야 같은 앱으로 읽힌다.
COPY = {
    "en": ("Jogak", "One piece of each day", "A quiet diary that stays on your device"),
    "ko": ("조각", "하루를 한 조각으로", "기기에 저장되는 조용한 일기장"),
}


def rounded(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def render(lang: str) -> Image.Image:
    title, tagline, sub = COPY[lang]
    im = Image.new("RGB", (W * SS, H * SS), BG)
    d = ImageDraw.Draw(im)

    f_title = ImageFont.truetype(SEMIBOLD, 96 * SS)
    f_tag = ImageFont.truetype(SEMIBOLD, 40 * SS)
    f_sub = ImageFont.truetype(REGULAR, 26 * SS)

    # ── 왼쪽: 글자 ──────────────────────────────────────────────────────────
    x = 78 * SS
    d.text((x, 178 * SS), title, font=f_title, fill=NAVY)
    d.text((x, 300 * SS), tagline, font=f_tag, fill=NAVY)
    d.text((x, 362 * SS), sub, font=f_sub, fill=SUB)

    # ── 오른쪽: 종이 카드 한 장 ────────────────────────────────────────────
    cx0, cy0, cx1, cy1 = 560 * SS, 62 * SS, 952 * SS, 468 * SS
    rounded(d, (cx0, cy0, cx1, cy1), 28 * SS, CARD)

    # 감정 8종 — 채워진 것과 비워진 것을 번갈아 둔다(고른 것과 안 고른 것)
    r = 20 * SS
    gap_x, gap_y = 68 * SS, 78 * SS
    ox, oy = cx0 + 62 * SS, cy0 + 90 * SS
    for row in range(2):
        for col in range(4):
            cx = ox + col * gap_x
            cy = oy + row * gap_y
            on = (row + col) % 2 == 0
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=DOT_ON if on else DOT_OFF)

    # 본문 세 줄
    for i, w in enumerate((262, 200, 240)):
        y = cy0 + 230 * SS + i * 34 * SS
        rounded(d, (cx0 + 62 * SS, y, cx0 + (62 + w) * SS, y + 14 * SS), 7 * SS, LINE)

    return im.resize((W, H), Image.LANCZOS)


def main() -> None:
    langs = sys.argv[1:] or ["en"]
    out_dir = "assets/store"
    os.makedirs(out_dir, exist_ok=True)
    for lang in langs:
        if lang not in COPY:
            raise SystemExit(f"모르는 언어: {lang} (있는 것: {', '.join(COPY)})")
        path = os.path.join(out_dir, f"feature-{lang}-1024x500.png")
        render(lang).save(path, "PNG", optimize=True)
        size = os.path.getsize(path)
        print(f"  {path:44} 1024x500  {size / 1024:.0f}KB")
    # ⚠ 파이썬 stdout 이 cp949 라 비ASCII 기호가 터진다. 메시지는 순수 ASCII 로 둔다
    print("\n[!] Play spec: PNG/JPEG, max 15MB, exactly 1024x500")


if __name__ == "__main__":
    main()
