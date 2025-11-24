from pathlib import Path

class ConfiguracionMySQL:

    def get_mysql_port_from_xampp(
        ini_path: str = r"C:\xampp\mysql\bin\my.ini",
        default_port: int = 3306,
    ) -> int:
        path = Path(ini_path)
        if not path.exists():
            return default_port

        port = default_port
        current_section = None

        with path.open(encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith(("#", ";")):
                    continue

                # detectar secciones [mysqld], [client], etc.
                if line.startswith("[") and line.endswith("]"):
                    current_section = line[1:-1].strip().lower()
                    continue

                # buscamos port= dentro de la sección [mysqld]
                if current_section == "mysqld" and line.lower().startswith("port"):
                    name, value = line.split("=", 1)
                    try:
                        port = int(value.strip())
                    except ValueError:
                        pass
                    break

        return port

