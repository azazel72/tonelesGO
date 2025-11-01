# servidor/__init__.py
from .colector import Colector
from .dominio.EntradasDTO import EntradasDTO

__all__ = [
    "Colector",
    "EntradasDTO",
]