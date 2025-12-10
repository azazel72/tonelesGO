from datetime import date, datetime, timedelta

def obtener_anterior_dia_semana(dia_objetivo: int = 3, fecha: date | datetime | None = None) -> date:
    """
    Devuelve la fecha del día objetivo anterior (o el mismo día si coincide).
    En python, el lunes es 0 y el domingo es 6.
    """
    if fecha is None:
        fecha = date.today()
    if isinstance(fecha, datetime):
        fecha = fecha.date()

    dia_actual = fecha.weekday()
    if dia_actual == dia_objetivo:
        return fecha

    diferencia = (dia_actual - dia_objetivo + 7) % 7
    return fecha - timedelta(days=diferencia)
