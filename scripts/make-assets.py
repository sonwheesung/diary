# -*- coding: utf-8 -*-
"""
아이콘·스플래시 에셋 생성.

**코드로 그린다.** 조각의 디자인 언어가 "Apple 수준 미니멀 · Glass 금지 · 과한 Gradient 금지 ·
Shadow 최소"(CLAUDE.md §9)라서 기하학적 마크가 타협이 아니라 정답에 가깝다. 덤으로:

  - 색을 바꾸려면 이 파일의 상수만 고치면 된다. 이미지 편집기를 열 일이 없다.
  - 크기가 늘어도(iOS 새 사이즈 등) 다시 뽑기만 하면 된다.
  - 팔레트가 정본 하나(theme/palettes.ts)와 어긋나면 여기서 바로 보인다.

마크의 뜻: **겹쳐 놓인 종이 조각 세 장.** 하루가 조각으로 쌓인다는 앱의 한 줄 요약 그대로다.
작은 크기(48px 런처)에서도 읽히도록 형태를 셋으로 제한했다 — 수채 일러스트는 48px에서 뭉개진다.

실행: python scripts/make-assets.py
"""
import os
from PIL import Image, ImageDraw

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
OUT = "assets/images"
os.makedirs(OUT, exist_ok=True)

# theme/palettes.ts 와 같은 값이어야 한다. 어긋나면 앱을 열 때 아이콘만 색이 튄다.
BG_LIGHT = "#F5F7FA"
CREAM = "#EFE7DA"
BLUE_MUTED = "#7B9BC4"
NAVY = "#2C4A7C"

# 다크 배경(#12161F)용 조각 색.
#
# ⚠ 라이트 색을 그대로 쓰면 **앞의 남색 조각이 배경에 묻힌다.** 다크 팔레트에서 강조색의
# 명암을 뒤집은 것과 같은 이유다(CLAUDE.md §9) — 어두운 바탕에서 진한 남색은 안 읽힌다.
# 그래서 앞 조각을 가장 밝게(accent) 올리고 가운데를 한 단계 내려 서로 구분되게 한다.
NAVY_ON_DARK = "#8AB0E8"   # dark 팔레트의 accent
BLUE_ON_DARK = "#4A6FA5"

# 안티에일리어싱: 4배로 그리고 줄인다. Pillow에는 벡터 렌더러가 없다.
SS = 4

# 종이 조각 세 장 — (중심 x, y / 한 변 / 회전) 모두 마크 상자 기준 비율.
# 뒤에서 앞 순서. 앞의 것이 뒤를 가리므로 서로 어긋나게 놓아 셋 다 보이게 한다.
# (중심 x, y / 한 변 / 회전 / 라이트 색 / 다크 색)
PIECES = [
    (-0.19, -0.13, 0.56, -14, CREAM, CREAM),
    (0.18, -0.04, 0.54, 11, BLUE_MUTED, BLUE_ON_DARK),
    (-0.03, 0.18, 0.58, -4, NAVY, NAVY_ON_DARK),
]


def draw_mark(canvas: int, mark: float, dark: bool = False) -> Image.Image:
    """투명 배경에 마크만 그린다. `mark`는 캔버스 대비 마크 상자의 비율."""
    size = canvas * SS
    box = size * mark
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    for cx, cy, side, angle, light_color, dark_color in PIECES:
        color = dark_color if dark else light_color
        s = int(box * side)
        # 조각 하나를 따로 그려 회전한 뒤 합성한다 — Pillow는 회전된 사각형을 직접 못 그린다.
        pad = int(s * 0.5)
        tile = Image.new("RGBA", (s + pad * 2, s + pad * 2), (0, 0, 0, 0))
        ImageDraw.Draw(tile).rounded_rectangle(
            [pad, pad, pad + s, pad + s],
            radius=int(s * 0.17),  # 부드러운 radius(§9). 완전한 각은 이 앱의 언어가 아니다
            fill=color,
        )
        tile = tile.rotate(angle, resample=Image.BICUBIC, expand=False)
        layer.alpha_composite(
            tile,
            (int(size / 2 + box * cx - tile.width / 2), int(size / 2 + box * cy - tile.height / 2)),
        )

    return layer.resize((canvas, canvas), Image.LANCZOS)


def save(img: Image.Image, name: str) -> None:
    path = os.path.join(OUT, name)
    img.save(path, "PNG")
    print(f"  {name:24} {img.width}x{img.height}  {os.path.getsize(path) / 1024:.0f}KB")


print("에셋 생성:")

# 앱 아이콘 — 배경을 채운다(iOS는 투명을 허용하지 않는다).
icon = Image.new("RGBA", (1024, 1024), BG_LIGHT)
icon.alpha_composite(draw_mark(1024, 0.60))
save(icon.convert("RGB"), "icon.png")

# 안드로이드 적응형 아이콘 전경 — 투명. 런처가 어떤 모양으로 깎아낼지 모르므로
# 내용을 **가운데 66% 원 안**에 둔다. 넘치면 원형 런처에서 잘린다.
save(draw_mark(1024, 0.42), "adaptive-icon.png")

# 스플래시 — 투명. 배경색은 expo-splash-screen 설정이 칠한다.
save(draw_mark(1024, 0.62), "splash-icon.png")
save(draw_mark(1024, 0.62, dark=True), "splash-icon-dark.png")

# 웹 파비콘 — 지금 웹은 안 쓰지만 expo가 없으면 경고를 낸다.
fav = Image.new("RGBA", (48, 48), BG_LIGHT)
fav.alpha_composite(draw_mark(48, 0.68))
save(fav.convert("RGB"), "favicon.png")

print("완료")
