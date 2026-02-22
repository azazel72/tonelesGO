# Nueva API REST (Angular)

La API nueva vive en un router separado (`NuevaApiRoutes`) y no toca la API WebSocket/CRUD existente.

## Rutas nuevas

- `POST /auth/login`
- `GET /api/users`
- `PATCH /api/users/{user_id}`

## Arranque opcional

1. Servidor completo (antiguo + nuevo):
   - `python -m servidor`
   - Puerto `5000`

2. Solo API nueva (aislada):
   - `python servidor/nueva_api.py`
   - Puerto `5000`

## JWT

- Algoritmo: `HS256`
- TTL: 12 horas
- Variable recomendada: `NUEVA_API_JWT_SECRET`

Ejemplo PowerShell:

```powershell
$env:NUEVA_API_JWT_SECRET = "pon-aqui-una-clave-larga"
python -m servidor
```
