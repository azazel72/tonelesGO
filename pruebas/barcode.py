import socket

PRINTER_IP = "192.168.1.200"
PRINTER_PORT = 9100

# 43mm x 29mm @ 203dpi (8 dots/mm)
LABEL_W = 344
LABEL_H = 232
GAP = 8

FONT_H = 22
FONT_W = 18


def send_raw_zpl(zpl: str):
    data = zpl.encode("utf-8")
    with socket.create_connection((PRINTER_IP, PRINTER_PORT), timeout=5) as s:
        s.sendall(data)


def build_datamatrix_label(value: str, copies: int = 1) -> str:
    if not value:
        raise ValueError("El valor no puede estar vacio.")
    if copies < 1:
        raise ValueError("copies debe ser >= 1")

    # En Data Matrix el tamano final depende del contenido.
    # Se usa un modulo estable para 43x29mm y se centra el bloque.
    dm_module = 5
    dm_estimated_size = 120

    block_h = dm_estimated_size + GAP + FONT_H
    dm_x = (LABEL_W - dm_estimated_size) // 2
    dm_y = (LABEL_H - block_h) // 2
    text_y = dm_y + dm_estimated_size + GAP

    return f"""^XA
^PW{LABEL_W}
^LL{LABEL_H}
^CI28
^LH0,0

^FO{dm_x},{dm_y}
^BXN,{dm_module},200
^FD{value}^FS

^FO0,{text_y}
^A0N,{FONT_H},{FONT_W}
^FB{LABEL_W},1,0,C,0
^FD{value}^FS

^PQ{copies}
^XZ
"""


def print_label(value: str, copies: int = 1):
    send_raw_zpl(build_datamatrix_label(value, copies=copies))


if __name__ == "__main__":
    print_label("A1B2C3D4E5F6G7H-000*", copies=1)
