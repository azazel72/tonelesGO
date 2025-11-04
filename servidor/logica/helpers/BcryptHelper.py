# bcrypt_helper.py
import bcrypt
from typing import Union

BytesLike = Union[bytes, str]

class BcryptHelper:
    """
    Utilidades estáticas para bcrypt:
      - hash_password(password, rounds) -> str
      - verify_password(password, stored_hash) -> bool
      - get_rounds(stored_hash) -> int
      - needs_rehash(stored_hash, desired_rounds) -> bool
    """

    @staticmethod
    def _to_bytes(value: BytesLike) -> bytes:
        return value if isinstance(value, bytes) else value.encode('utf-8')

    @staticmethod
    def hash_password(password: str, rounds: int = 12) -> str:
        """
        Genera un hash bcrypt (string) para guardar en DB.
        rounds: coste (log2 iterations), por ejemplo 12 o 13.
        Retorna str (utf-8) listo para almacenar.
        """
        pw = BcryptHelper._to_bytes(password)
        salt = bcrypt.gensalt(rounds)
        hashed = bcrypt.hashpw(pw, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password: str, stored_hash: str) -> bool:
        """
        Verifica una contraseña contra el hash almacenado.
        Devuelve True si coincide, False en caso contrario.
        Usa bcrypt.checkpw (comparación segura en tiempo constante).
        """
        try:
            pw = BcryptHelper._to_bytes(password)
            sh = BcryptHelper._to_bytes(stored_hash)
            return bcrypt.checkpw(pw, sh)
        except (ValueError, TypeError):
            return False

    @staticmethod
    def get_rounds(stored_hash: str) -> int:
        """
        Extrae el número de rounds (cost) del hash bcrypt.
        Formato esperado: $2b$12$...........
        Si no puede parsear, lanza ValueError.
        """
        if not isinstance(stored_hash, (str, bytes)):
            raise ValueError("stored_hash debe ser str o bytes")
        s = stored_hash.decode('utf-8') if isinstance(stored_hash, bytes) else stored_hash
        parts = s.split('$')
        # parts: ['', '2b', '12', '...']
        if len(parts) < 3 or not parts[2].isdigit():
            raise ValueError("Hash bcrypt en formato inesperado")
        return int(parts[2])

    @staticmethod
    def needs_rehash(stored_hash: str, desired_rounds: int) -> bool:
        """
        Comprueba si el hash usa un coste distinto al deseado.
        Útil para re-hashear contraseñas cuando subes el coste.
        """
        try:
            current = BcryptHelper.get_rounds(stored_hash)
            return current != int(desired_rounds)
        except ValueError:
            # si no podemos parsear, mejor rehashear (por seguridad)
            return True
