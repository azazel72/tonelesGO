import socket
from pathlib import Path

from PIL import Image, ImageOps

PRINTER_IP = "192.168.1.200"
PRINTER_PORT = 9100

# 43mm x 29mm @ 203dpi (8 dots/mm)
LABEL_W = 344
LABEL_H = 232
MARGIN = 10
GAP = 6

FONT_H = 20
FONT_W = 16

LOGO_MAX_W = 96
LOGO_MAX_H = 56
TITLE_TEXT = "Toneleria Paez Lobato"


def send_raw_zpl(zpl: str):
    data = zpl.encode("utf-8")
    with socket.create_connection((PRINTER_IP, PRINTER_PORT), timeout=5) as s:
        s.sendall(data)


def code128_modules_for_n_chars(n: int) -> int:
    # Start + data + check + stop + termination
    return 11 * n + 37


def resolve_logo_path() -> Path:
    candidates = [
        Path("imagenes/logo-toneleria.png"),
        Path("imagenes/Logo-Toneleria.png"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("No se encontro el logo en imagenes/logo-toneleria.png")


def image_to_gfa_hex(image_path: Path, max_w: int, max_h: int) -> tuple[str, int, int]:
    img = Image.open(image_path).convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.getchannel("A"))
    gray = ImageOps.grayscale(bg)
    gray.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)

    bw = gray.point(lambda p: 0 if p < 180 else 255, mode="1")
    width, height = bw.size

    bytes_per_row = (width + 7) // 8
    rows = []
    pixels = bw.load()

    for y in range(height):
        row = bytearray(bytes_per_row)
        for x in range(width):
            # En modo "1": 0 negro, 255 blanco. En ZPL, bit=1 dibuja punto.
            if pixels[x, y] == 0:
                row[x // 8] |= 1 << (7 - (x % 8))
        rows.append(row.hex().upper())

    total_bytes = bytes_per_row * height
    hex_data = "".join(rows)
    return f"^GFA,{total_bytes},{total_bytes},{bytes_per_row},{hex_data}", width, height


def build_barcode128_logo_label(value: str, copies: int = 1) -> str:
    if not value:
        raise ValueError("El valor no puede estar vacio.")
    if copies < 1:
        raise ValueError("copies debe ser >= 1")

    logo_path = resolve_logo_path()
    gfa, logo_w, logo_h = image_to_gfa_hex(logo_path, LOGO_MAX_W, LOGO_MAX_H)

    header_y = MARGIN
    logo_x = MARGIN
    logo_y = header_y

    title_x = logo_x + logo_w + 8
    title_y = logo_y + max(0, (logo_h - FONT_H) // 2)
    title_w = LABEL_W - title_x - MARGIN

    header_h = max(logo_h, FONT_H) + 8
    barcode_top = header_y + header_h

    avail_w = LABEL_W - 2 * MARGIN
    modules = code128_modules_for_n_chars(len(value))
    module_width = max(1, min(3, avail_w // modules))
    barcode_w = modules * module_width

    bar_h = max(40, LABEL_H - barcode_top - GAP - FONT_H - MARGIN)
    bar_x = (LABEL_W - barcode_w) // 2
    bar_y = barcode_top
    text_y = bar_y + bar_h + GAP

    return f"""^XA
^PW{LABEL_W}
^LL{LABEL_H}
^CI28
^LH0,0

^FO{logo_x},{logo_y}
{gfa}

^FO{title_x},{title_y}
^A0N,{FONT_H},{FONT_W}
^FB{title_w},1,0,L,0
^FD{TITLE_TEXT}^FS

^FO{bar_x},{bar_y}
^BY{module_width},2,{bar_h}
^BCN,,N,N,N
^FD{value}^FS

^FO0,{text_y}
^A0N,{FONT_H},{FONT_W}
^FB{LABEL_W},1,0,C,0
^FD{value}^FS

^PQ{copies}
^XZ
"""


def print_label(value: str, copies: int = 1):
    send_raw_zpl(build_barcode128_logo_label(value, copies=copies))


if __name__ == "__main__":
    print_label("A1B2C3D4E5F6G7H-000*", copies=1)
