#!/usr/bin/env python3
"""
Generate pixel art sprites for U Cavaddu Runner game.
Creates 11 missing/invalid PNG sprites as valid pixel art files.
"""
import struct
import zlib
import os

def create_png(width, height, pixels):
    """
    Create a PNG file from a pixel array.
    pixels: list of (r, g, b, a) tuples, row by row, top to bottom
    Returns bytes of valid PNG file.
    """
    def pack_chunk(chunk_type, data):
        length = len(data)
        chunk = chunk_type + data
        crc = zlib.crc32(chunk) & 0xffffffff
        return struct.pack('>I', length) + chunk + struct.pack('>I', crc)

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = pack_chunk(b'IHDR', ihdr_data)

    # IDAT: raw image data
    raw_data = b''
    for y in range(height):
        raw_data += b'\x00'  # filter type none
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw_data += bytes([r, g, b, a])

    compressed = zlib.compress(raw_data, 9)
    idat = pack_chunk(b'IDAT', compressed)

    # IEND
    iend = pack_chunk(b'IEND', b'')

    return signature + ihdr + idat + iend


def make_canvas(width=64, height=64):
    """Make transparent canvas."""
    return [(0, 0, 0, 0)] * (width * height)


def set_pixel(canvas, x, y, color, width=64):
    """Set pixel at (x, y) with color (r, g, b, a)."""
    if 0 <= x < width and 0 <= y < 64:
        canvas[y * width + x] = color


def fill_rect(canvas, x, y, w, h, color, width=64):
    """Fill rectangle."""
    for dy in range(h):
        for dx in range(w):
            set_pixel(canvas, x + dx, y + dy, color, width)


def save_sprite(path, canvas, width=64, height=64):
    """Save canvas as PNG."""
    data = create_png(width, height, canvas)
    with open(path, 'wb') as f:
        f.write(data)
    print(f"  Saved: {path} ({len(data)} bytes)")


# ============================================================
# COLOR CONSTANTS
# ============================================================
TRANSPARENT = (0, 0, 0, 0)

# Horse colors
HORSE_BODY = (240, 232, 221, 255)   # cream white
HORSE_SHADOW = (224, 212, 196, 255) # warm shadow
HORSE_MANE = (26, 20, 16, 255)      # dark brown
HORSE_HOOF = (51, 51, 51, 255)      # dark gray
BEER_MUG = (218, 165, 32, 255)      # golden
BEER_LIQUID = (232, 160, 32, 255)   # amber
BEER_FOAM = (255, 255, 240, 255)    # cream white
HORSE_MUZZLE = (248, 221, 208, 255) # pinkish

# Fornacella colors
IRON_DARK = (80, 80, 80, 255)
IRON_MID = (102, 102, 102, 255)
IRON_LIGHT = (119, 119, 119, 255)
IRON_RIM = (153, 153, 153, 255)
COAL_RED = (170, 34, 0, 255)
FLAME_ORANGE = (255, 102, 0, 255)
FLAME_YELLOW = (255, 204, 0, 255)
COAL_DARK = (138, 48, 32, 255)

# Mafioso colors
SKIN = (212, 165, 116, 255)
SKIN_DARK = (180, 130, 90, 255)
SHIRT_WHITE = (238, 238, 238, 255)
PANTS_DARK = (26, 26, 74, 255)
SHOE_BLACK = (34, 34, 34, 255)
KNIFE_BLADE = (204, 204, 204, 255)
KNIFE_HANDLE = (74, 42, 16, 255)
GOLD_CHAIN = (218, 165, 32, 255)
FEDORA = (58, 40, 40, 255)
SUIT_BLACK = (26, 26, 26, 255)
TIE_RED = (138, 0, 0, 255)
GUN_METAL = (85, 85, 85, 255)
BERET_DARK = (68, 68, 68, 255)
POLO_GREEN = (0, 102, 51, 255)
POLO_LIGHT = (0, 136, 68, 255)

# Boss colors
STONE_MID = (105, 105, 105, 255)
STONE_LIGHT = (128, 128, 128, 255)
STONE_DARK = (85, 85, 85, 255)
STONE_HI = (160, 160, 160, 255)
STONE_BRIGHT = (176, 176, 176, 255)
TUSK_COLOR = (240, 232, 208, 255)
EYE_RED = (255, 0, 0, 255)

# Arancino colors
ARC_GOLD = (212, 136, 10, 255)
ARC_HI = (232, 160, 32, 255)
ARC_SHADOW = (176, 106, 8, 255)
ARC_BRIGHT = (240, 184, 48, 255)

# Lava colors
LAVA_OUTER = (255, 34, 0, 255)
LAVA_MID = (255, 68, 0, 255)
LAVA_ORANGE = (255, 102, 0, 255)
LAVA_BRIGHT = (255, 136, 0, 255)
LAVA_YELLOW = (255, 204, 0, 255)
LAVA_CORE = (255, 238, 0, 255)

# Flash white
WHITE = (255, 255, 255, 255)
WHITE_MID = (238, 238, 238, 255)
WHITE_SHADOW = (221, 221, 221, 255)
WHITE_DARK = (204, 204, 204, 255)


def draw_horse_run2():
    """Frame 2: crossing legs mid-stride."""
    c = make_canvas()

    # Ground reference: y=63 is bottom edge
    base_y = 63

    # Tail (alternate direction)
    fill_rect(c, 2, base_y-22, 2, 4, HORSE_MANE)
    fill_rect(c, 1, base_y-26, 2, 3, HORSE_MANE)
    fill_rect(c, 0, base_y-27, 2, 2, HORSE_MANE)

    # Body (main)
    for i in range(14):
        shade = HORSE_BODY if i < 10 else HORSE_SHADOW
        fill_rect(c, 8+i*2, base_y-24, 2, 10, shade)

    # Belly highlight
    for i in range(3, 11):
        fill_rect(c, 8+i*2, base_y-16, 2, 2, (248, 244, 238, 255))

    # Back line
    for i in range(1, 13):
        fill_rect(c, 8+i*2, base_y-24, 2, 1, HORSE_SHADOW)

    # Chest
    fill_rect(c, 36, base_y-23, 2, 7, HORSE_SHADOW)
    fill_rect(c, 36, base_y-22, 2, 5, HORSE_BODY)

    # Neck
    fill_rect(c, 36, base_y-28, 4, 5, HORSE_SHADOW)
    fill_rect(c, 38, base_y-31, 4, 4, HORSE_SHADOW)
    fill_rect(c, 40, base_y-33, 4, 3, HORSE_SHADOW)
    fill_rect(c, 36, base_y-28, 2, 5, HORSE_BODY)
    fill_rect(c, 38, base_y-31, 2, 3, HORSE_BODY)

    # Mane (shifted slightly for frame 2)
    fill_rect(c, 34, base_y-28, 2, 6, HORSE_MANE)
    fill_rect(c, 36, base_y-31, 2, 5, HORSE_MANE)
    fill_rect(c, 38, base_y-33, 2, 4, HORSE_MANE)
    fill_rect(c, 40, base_y-34, 2, 3, HORSE_MANE)
    fill_rect(c, 32, base_y-26, 2, 4, (42, 34, 24, 255))
    fill_rect(c, 42, base_y-36, 2, 2, HORSE_MANE)

    # Head
    fill_rect(c, 42, base_y-35, 6, 4, HORSE_BODY)
    fill_rect(c, 44, base_y-36, 4, 2, HORSE_BODY)
    fill_rect(c, 48, base_y-34, 6, 3, (245, 236, 224, 255))
    fill_rect(c, 50, base_y-33, 4, 2, HORSE_MUZZLE)
    fill_rect(c, 52, base_y-33, 4, 2, HORSE_MUZZLE)

    # Ears
    fill_rect(c, 42, base_y-37, 2, 2, HORSE_SHADOW)
    fill_rect(c, 46, base_y-37, 2, 2, HORSE_SHADOW)
    fill_rect(c, 42, base_y-36, 2, 1, (240, 200, 184, 255))
    fill_rect(c, 46, base_y-36, 2, 1, (240, 200, 184, 255))

    # Eye
    fill_rect(c, 46, base_y-35, 4, 2, (255, 255, 255, 255))
    fill_rect(c, 48, base_y-35, 2, 1, (17, 17, 17, 255))

    # Nostril
    fill_rect(c, 54, base_y-33, 2, 1, (191, 160, 144, 255))

    # Mouth
    fill_rect(c, 50, base_y-31, 4, 1, (208, 184, 168, 255))

    # Legs: crossing mid-stride (frame 2 - legs closer together)
    # Front right leg
    fill_rect(c, 30, base_y-14, 4, 4, (224, 212, 196, 255))
    fill_rect(c, 28, base_y-10, 4, 5, (208, 192, 176, 255))
    fill_rect(c, 28, base_y-5, 2, 1, (192, 176, 160, 255))
    fill_rect(c, 28, base_y-4, 4, 2, (208, 192, 176, 255))
    fill_rect(c, 28, base_y-2, 4, 2, HORSE_HOOF)
    # Front left leg
    fill_rect(c, 26, base_y-14, 4, 4, (224, 212, 196, 255))
    fill_rect(c, 26, base_y-10, 4, 5, (208, 192, 176, 255))
    fill_rect(c, 26, base_y-5, 2, 1, (192, 176, 160, 255))
    fill_rect(c, 26, base_y-4, 4, 2, (208, 192, 176, 255))
    fill_rect(c, 26, base_y-2, 4, 2, HORSE_HOOF)
    # Back right leg
    fill_rect(c, 16, base_y-14, 4, 4, (224, 212, 196, 255))
    fill_rect(c, 16, base_y-10, 4, 5, (208, 192, 176, 255))
    fill_rect(c, 16, base_y-5, 2, 1, (192, 176, 160, 255))
    fill_rect(c, 16, base_y-4, 4, 2, (208, 192, 176, 255))
    fill_rect(c, 16, base_y-2, 4, 2, HORSE_HOOF)
    # Back left leg
    fill_rect(c, 12, base_y-14, 4, 4, (224, 212, 196, 255))
    fill_rect(c, 12, base_y-10, 4, 5, (208, 192, 176, 255))
    fill_rect(c, 12, base_y-5, 2, 1, (192, 176, 160, 255))
    fill_rect(c, 12, base_y-4, 4, 2, (208, 192, 176, 255))
    fill_rect(c, 12, base_y-2, 4, 2, HORSE_HOOF)

    # Beer mug
    bx, by = 22, base_y-18
    fill_rect(c, bx-2, by+2, 2, 4, KNIFE_HANDLE)
    fill_rect(c, bx-4, by+4, 2, 2, KNIFE_HANDLE)
    fill_rect(c, bx, by, 8, 6, BEER_MUG)
    fill_rect(c, bx+2, by, 4, 6, (232, 184, 48, 255))
    fill_rect(c, bx+2, by+2, 4, 4, BEER_LIQUID)
    fill_rect(c, bx+2, by+4, 4, 2, (240, 184, 48, 255))
    fill_rect(c, bx, by-2, 8, 2, BEER_FOAM)
    fill_rect(c, bx+2, by-4, 4, 2, (255, 253, 224, 255))
    fill_rect(c, bx, by+6, 8, 2, (138, 90, 16, 255))

    return c


def draw_boss_charge():
    """Boss U Liotru charging pose - trunk raised, legs mid-stride."""
    c = make_canvas()
    base_y = 63
    s = 3  # pixel size

    # Body
    for i in range(11):
        shade = STONE_LIGHT if 2 < i < 9 else STONE_MID
        fill_rect(c, 2 + i*s, base_y-18*s//3, s, 10*s//3, shade)

    # Simplified body block
    fill_rect(c, 2, base_y-32, 33, 18, STONE_MID)
    fill_rect(c, 4, base_y-31, 29, 16, STONE_LIGHT)
    fill_rect(c, 8, base_y-28, 21, 6, STONE_HI)  # belly
    for i in range(1, 10):
        fill_rect(c, 2+i*3, base_y-32, 3, 1, STONE_DARK)  # back line

    # Legs - charging stance (slightly different from idle)
    # Back-left
    fill_rect(c, 3, base_y-14, 6, 12, STONE_LIGHT)
    fill_rect(c, 3, base_y-3, 6, 3, STONE_DARK)
    # Back-right
    fill_rect(c, 11, base_y-16, 6, 14, STONE_MID)  # raised slightly
    fill_rect(c, 11, base_y-3, 6, 3, STONE_DARK)
    # Front-left
    fill_rect(c, 21, base_y-14, 6, 12, STONE_LIGHT)
    fill_rect(c, 21, base_y-3, 6, 3, STONE_DARK)
    # Front-right
    fill_rect(c, 29, base_y-16, 6, 14, STONE_MID)  # raised slightly
    fill_rect(c, 29, base_y-3, 6, 3, STONE_DARK)

    # Head
    fill_rect(c, 36, base_y-38, 18, 12, STONE_MID)
    fill_rect(c, 38, base_y-40, 14, 4, STONE_HI)
    fill_rect(c, 39, base_y-38, 12, 6, STONE_BRIGHT)  # forehead

    # Ears
    fill_rect(c, 36, base_y-44, 6, 6, STONE_LIGHT)
    fill_rect(c, 52, base_y-44, 6, 6, STONE_LIGHT)
    fill_rect(c, 36, base_y-43, 2, 4, (154, 112, 112, 255))
    fill_rect(c, 56, base_y-43, 2, 4, (154, 112, 112, 255))

    # Eyes (red, angry)
    fill_rect(c, 40, base_y-34, 6, 2, EYE_RED)
    fill_rect(c, 46, base_y-34, 3, 2, EYE_RED)
    fill_rect(c, 43, base_y-34, 3, 2, (68, 0, 0, 255))  # pupils

    # Trunk - raised upward (charging)
    fill_rect(c, 45, base_y-27, 4, 6, STONE_LIGHT)
    fill_rect(c, 46, base_y-33, 4, 6, STONE_MID)  # trunk raised up
    fill_rect(c, 48, base_y-38, 4, 5, STONE_LIGHT)
    fill_rect(c, 49, base_y-42, 2, 4, STONE_HI)

    # Tusks
    fill_rect(c, 38, base_y-31, 3, 8, TUSK_COLOR)
    fill_rect(c, 37, base_y-25, 3, 4, TUSK_COLOR)
    fill_rect(c, 52, base_y-31, 3, 8, TUSK_COLOR)
    fill_rect(c, 53, base_y-25, 3, 4, TUSK_COLOR)

    # Tail (wagging opposite direction)
    fill_rect(c, 1, base_y-28, 2, 6, STONE_DARK)
    fill_rect(c, 0, base_y-25, 2, 4, STONE_MID)

    # HP bar (placeholder - 3 red segments)
    for i in range(3):
        fill_rect(c, 4+i*12, base_y-47, 10, 4, EYE_RED)
        # border
        for bx2 in range(11):
            set_pixel(c, 3+i*12+bx2, base_y-48, STONE_DARK)
            set_pixel(c, 3+i*12+bx2, base_y-43, STONE_DARK)
        for by2 in range(5):
            set_pixel(c, 3+i*12, base_y-47+by2, STONE_DARK)
            set_pixel(c, 14+i*12, base_y-47+by2, STONE_DARK)

    return c


def draw_boss_flash():
    """Boss flash - all white silhouette."""
    c = make_canvas()
    base_y = 63

    # White body
    fill_rect(c, 2, base_y-32, 33, 18, WHITE_MID)
    fill_rect(c, 4, base_y-31, 29, 16, WHITE)
    fill_rect(c, 8, base_y-28, 21, 6, WHITE)

    # Legs
    fill_rect(c, 3, base_y-14, 6, 14, WHITE_MID)
    fill_rect(c, 11, base_y-14, 6, 14, WHITE)
    fill_rect(c, 21, base_y-14, 6, 14, WHITE_MID)
    fill_rect(c, 29, base_y-14, 6, 14, WHITE)

    # Head
    fill_rect(c, 36, base_y-38, 18, 12, WHITE_MID)
    fill_rect(c, 38, base_y-40, 14, 4, WHITE)

    # Ears
    fill_rect(c, 36, base_y-44, 6, 6, WHITE)
    fill_rect(c, 52, base_y-44, 6, 6, WHITE)

    # Eyes (slightly visible)
    fill_rect(c, 40, base_y-34, 6, 2, WHITE_DARK)
    fill_rect(c, 46, base_y-34, 3, 2, WHITE_DARK)

    # Trunk
    fill_rect(c, 45, base_y-27, 4, 6, WHITE)
    fill_rect(c, 46, base_y-33, 4, 6, WHITE_MID)
    fill_rect(c, 49, base_y-36, 2, 4, WHITE)

    # Tusks
    fill_rect(c, 38, base_y-31, 3, 8, WHITE_SHADOW)
    fill_rect(c, 37, base_y-25, 3, 4, WHITE_SHADOW)
    fill_rect(c, 52, base_y-31, 3, 8, WHITE_SHADOW)
    fill_rect(c, 53, base_y-25, 3, 4, WHITE_SHADOW)

    # Tail
    fill_rect(c, 1, base_y-28, 2, 6, WHITE_DARK)
    fill_rect(c, 0, base_y-25, 2, 4, WHITE_SHADOW)

    return c


def draw_arancino():
    """Arancino - golden Sicilian rice ball."""
    c = make_canvas()
    base_y = 55

    # Round/conical shape - dome
    fill_rect(c, 20, base_y-42, 24, 2, ARC_GOLD)
    fill_rect(c, 16, base_y-40, 32, 3, ARC_GOLD)
    fill_rect(c, 12, base_y-37, 40, 4, ARC_GOLD)
    fill_rect(c, 10, base_y-33, 44, 5, ARC_GOLD)
    fill_rect(c, 8, base_y-28, 48, 5, ARC_GOLD)
    fill_rect(c, 8, base_y-23, 48, 5, ARC_HI)
    fill_rect(c, 9, base_y-18, 46, 4, ARC_GOLD)
    fill_rect(c, 10, base_y-14, 44, 4, ARC_GOLD)
    fill_rect(c, 12, base_y-10, 40, 4, ARC_SHADOW)
    fill_rect(c, 16, base_y-6, 32, 4, ARC_SHADOW)
    fill_rect(c, 20, base_y-2, 24, 2, ARC_SHADOW)

    # Highlight (bright spot top-left)
    fill_rect(c, 16, base_y-38, 10, 6, ARC_HI)
    fill_rect(c, 14, base_y-36, 8, 4, ARC_BRIGHT)
    fill_rect(c, 16, base_y-36, 6, 3, ARC_BRIGHT)

    # Shadow bottom-right
    fill_rect(c, 36, base_y-16, 14, 10, ARC_SHADOW)
    fill_rect(c, 32, base_y-12, 16, 8, (176, 100, 8, 255))

    # Texture dots
    fill_rect(c, 22, base_y-28, 2, 2, ARC_SHADOW)
    fill_rect(c, 34, base_y-30, 2, 2, ARC_SHADOW)
    fill_rect(c, 28, base_y-24, 2, 2, ARC_SHADOW)
    fill_rect(c, 18, base_y-20, 2, 2, ARC_SHADOW)
    fill_rect(c, 40, base_y-22, 2, 2, ARC_SHADOW)

    return c


def draw_fornacella1():
    """Small brazier."""
    c = make_canvas()
    base_y = 63
    s = 4  # px scale

    # Legs
    fill_rect(c, 10, base_y-6, 4, 6, IRON_DARK)
    fill_rect(c, 26, base_y-4, 4, 4, IRON_DARK)
    fill_rect(c, 42, base_y-6, 4, 6, IRON_DARK)

    # Base shelf
    fill_rect(c, 6, base_y-8, 52, 4, IRON_MID)

    # Bowl body
    fill_rect(c, 8, base_y-26, 48, 18, IRON_LIGHT)
    fill_rect(c, 10, base_y-25, 44, 16, (130, 130, 130, 255))

    # Rim
    fill_rect(c, 6, base_y-27, 52, 3, IRON_RIM)
    for i in range(0, 13):
        fill_rect(c, 8+i*4, base_y-28, 2, 2, (170, 170, 170, 255))

    # Coals
    fill_rect(c, 12, base_y-24, 40, 4, COAL_RED)
    fill_rect(c, 16, base_y-23, 32, 3, (204, 51, 0, 255))

    # Flames
    fill_rect(c, 14, base_y-30, 8, 4, FLAME_ORANGE)
    fill_rect(c, 26, base_y-33, 8, 6, FLAME_YELLOW)
    fill_rect(c, 38, base_y-30, 8, 4, FLAME_ORANGE)
    fill_rect(c, 20, base_y-34, 6, 4, FLAME_YELLOW)
    fill_rect(c, 34, base_y-32, 6, 3, (255, 136, 0, 255))

    return c


def draw_fornacella2():
    """Medium brazier - taller, wider."""
    c = make_canvas()
    base_y = 63

    # Legs
    fill_rect(c, 10, base_y-6, 4, 6, IRON_DARK)
    fill_rect(c, 50, base_y-6, 4, 6, IRON_DARK)

    # Wide base
    fill_rect(c, 6, base_y-8, 52, 4, IRON_MID)

    # Tall bowl
    fill_rect(c, 4, base_y-32, 56, 24, IRON_LIGHT)
    fill_rect(c, 6, base_y-31, 52, 22, (130, 130, 130, 255))
    fill_rect(c, 10, base_y-29, 44, 18, (136, 136, 136, 255))

    # Rim with grate
    fill_rect(c, 4, base_y-33, 56, 3, IRON_RIM)
    for i in range(0, 14):
        fill_rect(c, 6+i*4, base_y-34, 2, 2, (170, 170, 170, 255))

    # Coals
    fill_rect(c, 10, base_y-28, 44, 5, COAL_DARK)
    fill_rect(c, 14, base_y-27, 36, 3, (170, 64, 48, 255))

    # Bigger flames
    fill_rect(c, 12, base_y-38, 8, 6, FLAME_ORANGE)
    fill_rect(c, 24, base_y-42, 10, 8, FLAME_YELLOW)
    fill_rect(c, 38, base_y-40, 8, 6, FLAME_ORANGE)
    fill_rect(c, 20, base_y-44, 8, 8, (255, 220, 0, 255))
    fill_rect(c, 34, base_y-42, 6, 6, (255, 136, 0, 255))
    fill_rect(c, 16, base_y-40, 6, 4, (255, 68, 0, 255))
    fill_rect(c, 42, base_y-38, 6, 4, (255, 68, 0, 255))

    return c


def draw_fornacella_grill():
    """Large grill with person grilling."""
    c = make_canvas()
    base_y = 63

    # --- Grill (foreground) ---
    fill_rect(c, 4, base_y-6, 4, 6, IRON_DARK)
    fill_rect(c, 14, base_y-4, 4, 4, IRON_DARK)
    fill_rect(c, 24, base_y-6, 4, 6, IRON_DARK)

    fill_rect(c, 2, base_y-8, 30, 4, IRON_MID)
    fill_rect(c, 2, base_y-24, 30, 16, IRON_LIGHT)
    fill_rect(c, 4, base_y-23, 26, 14, (130, 130, 130, 255))
    fill_rect(c, 2, base_y-24, 30, 2, IRON_RIM)

    # Grill grate
    for i in range(0, 6):
        fill_rect(c, 4+i*4, base_y-24, 2, 12, (136, 136, 136, 255))

    # Coals
    fill_rect(c, 4, base_y-22, 26, 4, COAL_RED)

    # Meat skewers
    for i in range(3):
        fill_rect(c, 4+i*8, base_y-29, 8, 2, (160, 80, 40, 255))
        fill_rect(c, 5+i*8, base_y-30, 6, 2, (200, 100, 60, 255))

    # Grill flames
    fill_rect(c, 6, base_y-30, 4, 4, FLAME_ORANGE)
    fill_rect(c, 14, base_y-32, 4, 5, FLAME_YELLOW)
    fill_rect(c, 22, base_y-30, 4, 4, FLAME_ORANGE)

    # --- Person behind grill ---
    # Head
    fill_rect(c, 38, base_y-46, 10, 8, SKIN)
    fill_rect(c, 40, base_y-44, 2, 2, (17, 17, 17, 255))  # eye
    fill_rect(c, 40, base_y-42, 4, 1, (136, 64, 48, 255))  # mouth

    # Apron/shirt (white with red stripe)
    fill_rect(c, 34, base_y-38, 18, 16, SHIRT_WHITE)
    fill_rect(c, 36, base_y-37, 14, 14, (221, 221, 221, 255))
    fill_rect(c, 34, base_y-32, 18, 2, (204, 0, 0, 255))

    # Arms and tongs
    fill_rect(c, 32, base_y-36, 6, 6, SKIN)
    fill_rect(c, 52, base_y-36, 6, 6, SKIN)
    fill_rect(c, 53, base_y-38, 3, 8, (136, 136, 136, 255))  # tongs
    fill_rect(c, 55, base_y-38, 3, 8, (136, 136, 136, 255))

    # Pants
    fill_rect(c, 36, base_y-22, 6, 14, (51, 51, 51, 255))
    fill_rect(c, 44, base_y-22, 6, 14, (51, 51, 51, 255))

    # Shoes
    fill_rect(c, 34, base_y-4, 8, 4, (34, 34, 34, 255))
    fill_rect(c, 44, base_y-4, 8, 4, (34, 34, 34, 255))

    return c


def draw_maf_coltello():
    """Mafioso with knife - facing left."""
    c = make_canvas()
    base_y = 63

    # Coppola (flat cap)
    fill_rect(c, 14, base_y-60, 26, 2, (34, 34, 34, 255))
    fill_rect(c, 10, base_y-58, 34, 2, (51, 51, 51, 255))
    fill_rect(c, 12, base_y-62, 24, 4, (42, 42, 42, 255))

    # Head
    fill_rect(c, 14, base_y-58, 22, 14, SKIN)
    fill_rect(c, 14, base_y-46, 22, 2, SKIN_DARK)

    # Eyes (looking left - menacing)
    fill_rect(c, 16, base_y-54, 4, 3, (17, 17, 17, 255))
    fill_rect(c, 26, base_y-54, 4, 3, (17, 17, 17, 255))
    fill_rect(c, 14, base_y-56, 4, 2, (34, 34, 34, 255))  # brows
    fill_rect(c, 24, base_y-56, 4, 2, (34, 34, 34, 255))

    # Mouth
    fill_rect(c, 18, base_y-48, 8, 2, (138, 64, 48, 255))

    # Neck
    fill_rect(c, 20, base_y-44, 10, 3, (196, 149, 100, 255))

    # Canottiera (white undershirt)
    fill_rect(c, 14, base_y-41, 22, 22, SHIRT_WHITE)
    fill_rect(c, 16, base_y-40, 18, 20, (255, 255, 255, 255))

    # Gold chain
    fill_rect(c, 18, base_y-38, 4, 2, GOLD_CHAIN)
    fill_rect(c, 22, base_y-36, 4, 2, (255, 215, 0, 255))  # pendant

    # Arms
    fill_rect(c, 8, base_y-41, 6, 8, SKIN)
    fill_rect(c, 36, base_y-41, 6, 8, SKIN)
    fill_rect(c, 6, base_y-36, 6, 10, SKIN)
    fill_rect(c, 38, base_y-36, 6, 10, SKIN)

    # Knife (right side, raised)
    fill_rect(c, 42, base_y-36, 4, 10, KNIFE_HANDLE)  # handle
    fill_rect(c, 42, base_y-52, 4, 16, KNIFE_BLADE)   # blade
    fill_rect(c, 42, base_y-54, 6, 4, (238, 238, 238, 255))  # tip
    fill_rect(c, 46, base_y-52, 4, 8, (221, 221, 221, 255))  # sharp edge

    # Pants
    fill_rect(c, 14, base_y-19, 22, 16, PANTS_DARK)
    fill_rect(c, 16, base_y-18, 18, 14, (34, 34, 102, 255))

    # Shoes
    fill_rect(c, 12, base_y-4, 10, 4, SHOE_BLACK)
    fill_rect(c, 24, base_y-4, 10, 4, SHOE_BLACK)
    fill_rect(c, 10, base_y-2, 4, 2, SHOE_BLACK)
    fill_rect(c, 34, base_y-2, 4, 2, SHOE_BLACK)

    return c


def draw_maf_lupara():
    """Mafioso with shotgun - facing left."""
    c = make_canvas()
    base_y = 63

    # Fedora
    fill_rect(c, 10, base_y-63, 34, 2, (42, 32, 32, 255))
    fill_rect(c, 14, base_y-68, 26, 6, (58, 40, 40, 255))
    fill_rect(c, 16, base_y-70, 22, 4, (58, 40, 40, 255))

    # Head (slightly taller/thinner)
    fill_rect(c, 14, base_y-62, 22, 16, (200, 149, 106, 255))
    # Sideburns
    fill_rect(c, 14, base_y-60, 4, 8, (58, 42, 26, 255))
    fill_rect(c, 32, base_y-60, 4, 8, (58, 42, 26, 255))

    # Eyes
    fill_rect(c, 16, base_y-56, 4, 3, (17, 17, 17, 255))
    fill_rect(c, 28, base_y-56, 4, 3, (17, 17, 17, 255))
    fill_rect(c, 14, base_y-58, 6, 2, (42, 26, 10, 255))
    fill_rect(c, 28, base_y-58, 6, 2, (42, 26, 10, 255))

    # Mouth
    fill_rect(c, 18, base_y-50, 12, 2, (42, 26, 10, 255))
    fill_rect(c, 32, base_y-54, 4, 4, (160, 96, 80, 255))  # ear

    # Neck
    fill_rect(c, 20, base_y-46, 10, 3, (200, 149, 106, 255))

    # Suit
    fill_rect(c, 10, base_y-43, 30, 26, SUIT_BLACK)
    fill_rect(c, 12, base_y-42, 26, 24, (37, 37, 37, 255))
    fill_rect(c, 18, base_y-43, 10, 8, (221, 221, 221, 255))  # shirt
    fill_rect(c, 22, base_y-43, 4, 12, TIE_RED)  # tie

    # Arms
    fill_rect(c, 6, base_y-43, 4, 14, SUIT_BLACK)
    fill_rect(c, 40, base_y-43, 4, 14, SUIT_BLACK)
    fill_rect(c, 4, base_y-33, 6, 8, (200, 149, 106, 255))  # hands
    fill_rect(c, 40, base_y-33, 6, 8, (200, 149, 106, 255))

    # Lupara (sawed-off shotgun - diagonal across chest)
    for i in range(8):
        fill_rect(c, 2-i+i*2//3, base_y-43+i, 4, 2, GUN_METAL)  # barrels diagonal
    fill_rect(c, 4, base_y-44, 4, 2, (102, 102, 102, 255))
    fill_rect(c, 0, base_y-40, 4, 2, (68, 68, 68, 255))
    # Stock
    fill_rect(c, 14, base_y-35, 6, 4, (90, 58, 26, 255))
    fill_rect(c, 18, base_y-33, 6, 4, (90, 58, 26, 255))

    # Pants
    fill_rect(c, 12, base_y-17, 26, 14, SUIT_BLACK)
    fill_rect(c, 14, base_y-16, 22, 12, (34, 34, 34, 255))

    # Shoes
    fill_rect(c, 10, base_y-4, 12, 4, (26, 16, 16, 255))
    fill_rect(c, 24, base_y-4, 12, 4, (26, 16, 16, 255))

    return c


def draw_maf_fornacella():
    """Mafioso holding brazier above head - tallest obstacle."""
    c = make_canvas()
    base_y = 63

    # Brazier above head (top of sprite)
    # Bowl
    fill_rect(c, 14, 2, 36, 10, IRON_LIGHT)
    fill_rect(c, 16, 3, 32, 8, (136, 136, 136, 255))
    fill_rect(c, 12, 1, 40, 3, IRON_RIM)

    # Coals
    fill_rect(c, 18, 5, 28, 3, COAL_RED)

    # Flames above brazier
    fill_rect(c, 18, 0, 6, 2, FLAME_ORANGE)
    fill_rect(c, 28, 0, 8, 1, FLAME_YELLOW)
    fill_rect(c, 38, 0, 6, 2, FLAME_ORANGE)

    # Arms raised
    fill_rect(c, 10, 12, 8, 16, SKIN)
    fill_rect(c, 46, 12, 8, 16, SKIN)
    fill_rect(c, 8, 10, 8, 4, SKIN)   # hand
    fill_rect(c, 48, 10, 8, 4, SKIN)

    # Beret
    fill_rect(c, 18, 22, 28, 2, (68, 68, 68, 255))
    fill_rect(c, 20, 20, 24, 4, (85, 85, 85, 255))

    # Head
    fill_rect(c, 18, 24, 28, 16, SKIN)
    fill_rect(c, 20, 28, 4, 3, (17, 17, 17, 255))  # eyes
    fill_rect(c, 32, 28, 4, 3, (17, 17, 17, 255))
    fill_rect(c, 20, 36, 14, 2, (170, 80, 64, 255))  # open mouth yelling
    fill_rect(c, 22, 37, 10, 3, (180, 100, 80, 255))

    # Neck
    fill_rect(c, 24, 40, 16, 4, (196, 149, 100, 255))

    # Polo shirt (green)
    fill_rect(c, 14, 44, 36, 20, POLO_GREEN)
    fill_rect(c, 16, 45, 32, 18, POLO_LIGHT)
    fill_rect(c, 22, 44, 8, 2, (0, 68, 34, 255))  # collar

    # Pants (dark gray)
    fill_rect(c, 16, base_y-20, 32, 16, (51, 51, 51, 255))
    fill_rect(c, 18, base_y-19, 28, 14, (68, 68, 68, 255))

    # Shoes
    fill_rect(c, 14, base_y-4, 12, 4, SHOE_BLACK)
    fill_rect(c, 38, base_y-4, 12, 4, SHOE_BLACK)

    return c


def draw_lava():
    """Lava fireball projectile."""
    c = make_canvas()
    cx, cy = 32, 32  # center

    # Irregular round shape - outer red
    fill_rect(c, cx-16, cy-10, 32, 20, LAVA_OUTER)
    fill_rect(c, cx-12, cy-14, 24, 28, LAVA_OUTER)
    fill_rect(c, cx-8, cy-16, 16, 32, LAVA_OUTER)

    # Jagged edges
    for i in range(-10, 11, 4):
        jag = 2 if abs(i) < 6 else 0
        fill_rect(c, cx+i-2, cy-18+jag, 4, 4, LAVA_OUTER)
        fill_rect(c, cx+i-2, cy+14-jag, 4, 4, LAVA_OUTER)
    fill_rect(c, cx-20, cy-4, 4, 8, LAVA_OUTER)
    fill_rect(c, cx+16, cy-4, 4, 8, LAVA_OUTER)

    # Middle orange
    fill_rect(c, cx-14, cy-8, 28, 16, LAVA_MID)
    fill_rect(c, cx-10, cy-12, 20, 24, LAVA_MID)
    fill_rect(c, cx-6, cy-14, 12, 28, LAVA_MID)

    # Inner orange
    fill_rect(c, cx-12, cy-6, 24, 12, LAVA_ORANGE)
    fill_rect(c, cx-8, cy-10, 16, 20, LAVA_ORANGE)
    fill_rect(c, cx-4, cy-12, 8, 24, LAVA_ORANGE)

    # Bright inner
    fill_rect(c, cx-10, cy-4, 20, 8, LAVA_BRIGHT)
    fill_rect(c, cx-6, cy-8, 12, 16, LAVA_BRIGHT)

    # Yellow core
    fill_rect(c, cx-8, cy-2, 16, 4, LAVA_YELLOW)
    fill_rect(c, cx-4, cy-6, 8, 12, LAVA_YELLOW)

    # Bright core
    fill_rect(c, cx-6, cy-1, 12, 2, LAVA_CORE)
    fill_rect(c, cx-2, cy-4, 4, 8, LAVA_CORE)

    # Spark particles
    fill_rect(c, cx-18, cy-8, 3, 3, LAVA_YELLOW)
    fill_rect(c, cx+15, cy-12, 3, 3, LAVA_YELLOW)
    fill_rect(c, cx+6, cy-18, 3, 3, LAVA_ORANGE)
    fill_rect(c, cx-14, cy+12, 3, 3, LAVA_ORANGE)
    fill_rect(c, cx+10, cy+14, 3, 3, LAVA_YELLOW)
    fill_rect(c, cx-4, cy+16, 3, 3, LAVA_ORANGE)

    return c


# ============================================================
# MAIN
# ============================================================
sprites_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sprites')
os.makedirs(sprites_dir, exist_ok=True)

print("Generating sprites...")

sprites = [
    ('horse_run2.png', draw_horse_run2),
    ('boss_charge.png', draw_boss_charge),
    ('boss_flash.png', draw_boss_flash),
    ('arancino.png', draw_arancino),
    ('fornacella1.png', draw_fornacella1),
    ('fornacella2.png', draw_fornacella2),
    ('fornacella_grill.png', draw_fornacella_grill),
    ('maf_coltello.png', draw_maf_coltello),
    ('maf_lupara.png', draw_maf_lupara),
    ('maf_fornacella.png', draw_maf_fornacella),
    ('lava.png', draw_lava),
]

for filename, draw_fn in sprites:
    path = os.path.join(sprites_dir, filename)
    canvas = draw_fn()
    save_sprite(path, canvas)

print(f"\nGenerated {len(sprites)} sprites successfully!")
print("\nSummary:")
for filename, _ in sprites:
    path = os.path.join(sprites_dir, filename)
    size = os.path.getsize(path)
    print(f"  {filename}: {size} bytes")
