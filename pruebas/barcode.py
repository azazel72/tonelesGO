import socket

PRINTER_IP = "192.168.1.200"
PRINTER_PORT = 9100

# 43mm x 29mm @ 203dpi (8 dots/mm)
LABEL_W = 344
LABEL_H = 232
MARGIN = 12
GAP = 8

FONT_H = 22
FONT_W = 18


def send_raw_zpl(zpl: str):
    data = zpl.encode("utf-8")
    with socket.create_connection((PRINTER_IP, PRINTER_PORT), timeout=5) as s:
        s.sendall(data)


def code128_modules_for_n_chars(n: int) -> int:
    # Start + data + check + stop + termination
    return 11 * n + 37


def build_barcode128_label(value: str, copies: int = 1) -> str:
    if not value:
        raise ValueError("El valor no puede estar vacio.")
    if copies < 1:
        raise ValueError("copies debe ser >= 1")

    avail_w = LABEL_W - 2 * MARGIN
    modules = code128_modules_for_n_chars(len(value))
    module_width = max(1, min(3, avail_w // modules))
    barcode_w = modules * module_width

    bar_h = 110
    block_h = bar_h + GAP + FONT_H
    x = (LABEL_W - barcode_w) // 2
    y = (LABEL_H - block_h) // 2
    text_y = y + bar_h + GAP

    return f"""^XA
^PW{LABEL_W}
^LL{LABEL_H}
^CI28
^LH0,0

^FO{x},{y}
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
    send_raw_zpl(build_barcode128_label(value, copies=copies))


if __name__ == "__main__":
    print_label("A1B2C3D4E5F6G7H-000*", copies=1)
