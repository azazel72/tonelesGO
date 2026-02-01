
import socket


class ImprimirEtiqueta:
    PRINTER_IP = "192.168.1.155"
    PRINTER_PORT = 9100

    LABEL_W = 400
    LABEL_H = 800
    MARGIN = 20

    BAR_HEIGHT = 200
    GAP = 20

    def __init__(self, printer_ip: str | None = None, printer_port: int | None = None):
        if printer_ip:
            self.PRINTER_IP = printer_ip
        if printer_port:
            self.PRINTER_PORT = printer_port

    def send_raw_zpl(self, zpl: str):
        data = zpl.encode("utf-8")
        with socket.create_connection((self.PRINTER_IP, self.PRINTER_PORT), timeout=5) as s:
            s.sendall(data)

    def _code128_modules_for_n_chars(self, n: int) -> int:
        # Aproximacion: Start(11) + n*11 + Check(11) + Stop(13) + Term(2) = 11n + 37
        return 11 * n + 37

    def _build_label_botas(self, value: str, copies: int = 1) -> str:
        if not value:
            raise ValueError("El valor no puede estar vacio.")
        if copies < 1:
            raise ValueError("copies debe ser >= 1")

        avail_long = self.LABEL_H - 2 * self.MARGIN
        modules = self._code128_modules_for_n_chars(len(value))
        module_width = max(1, avail_long // modules)
        barcode_long = module_width * modules

        avail_w = self.LABEL_W - 2 * self.MARGIN
        avail_h = self.LABEL_H - 2 * self.MARGIN

        x = self.MARGIN + (avail_w - self.BAR_HEIGHT) // 2
        y = self.MARGIN + (avail_h - barcode_long) // 2

        text_x = x + self.BAR_HEIGHT + self.GAP
        text_y = y

        font_h = 38
        font_w = 32

        return f"""^XA
^PW{self.LABEL_W}
^LL{self.LABEL_H}
^CI28
^LH0,0

^FO{x},{y}
^BY{module_width},2,{self.BAR_HEIGHT}
^BCR,,N,N,N
^FD{value}^FS

^FO{text_x},{text_y}
^A0R,{font_h},{font_w}
^FB{barcode_long},1,0,C,0
^FD{value}^FS

^PQ{copies}
^XZ
"""

    def _build_label_palets(self, value: str, copies: int = 1) -> str:
        # Placeholder: usa mismo esquema que botas hasta que se defina uno distinto.
        return self._build_label_botas(value, copies=copies)

    def imprimir_etiqueta(self, tipo: str, value: str, copies: int = 1):
        if tipo == "botas":
            zpl = self._build_label_botas(value, copies=copies)
        elif tipo == "palets":
            zpl = self._build_label_palets(value, copies=copies)
        else:
            raise ValueError("Tipo de etiqueta no soportado.")
        self.send_raw_zpl(zpl)
