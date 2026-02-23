from datetime import datetime, timedelta, timezone
import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from servidor.colector import Colector
from servidor.logica.helpers import BcryptHelper
from servidor.modelos import UsuarioDB
from servidor.persistencia import DB
from servidor.dominio.maestros.usuario_dto import UsuarioDTO


class JwtLoginRequest(BaseModel):
    username: str
    password: str


class JwtLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserDto(BaseModel):
    id: int
    code: Optional[str] = None
    username: str
    fullname: Optional[str] = None
    role_id: Optional[int] = None


class UserPatchDto(BaseModel):
    code: Optional[str] = None
    username: Optional[str] = None
    fullname: Optional[str] = None
    role_id: Optional[int] = None


class _JwtService:
    _algo = "HS256"
    _ttl = timedelta(hours=12)
    _secret = os.getenv("NUEVA_API_JWT_SECRET", "cambia-esta-clave-en-produccion")

    @classmethod
    def issue(cls, user: UsuarioDTO) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "username": user.alias,
            "role_id": user.rol_id,
            "iat": int(now.timestamp()),
            "exp": int((now + cls._ttl).timestamp()),
        }
        return jwt.encode(payload, cls._secret, algorithm=cls._algo)

    @classmethod
    def parse_user_id(cls, token: str) -> Optional[int]:
        try:
            payload = jwt.decode(token, cls._secret, algorithms=[cls._algo])
            sub = payload.get("sub")
            return int(sub) if sub is not None else None
        except (JWTError, ValueError, TypeError):
            return None


class NuevaApiRoutes:

    @staticmethod
    def get_router() -> APIRouter:
        auth_router = APIRouter(prefix="/auth", tags=["Nueva API Auth"])
        api_router = APIRouter(prefix="/api", tags=["Nueva API"])
        bearer = HTTPBearer(auto_error=False)

        def require_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> UsuarioDB:
            if credentials is None or credentials.scheme.lower() != "bearer":
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

            user_id = _JwtService.parse_user_id(credentials.credentials)
            if user_id is None:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

            with DB.crear_sesion() as session:
                user = session.get(UsuarioDB, user_id)
                if user is None:
                    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
                return user

        @auth_router.post("/login", response_model=JwtLoginResponse)
        async def login(payload: JwtLoginRequest) -> JwtLoginResponse:
            colector = Colector.colector
            if colector is None or colector.maestros is None:
                raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Maestros not loaded")

            usuario = colector.maestros.buscar_usuario_por_username(payload.username)
            if not usuario or not BcryptHelper.verify_password(payload.password, usuario.clave):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

            token = _JwtService.issue(usuario)
            return JwtLoginResponse(access_token=token)

        @api_router.get("/users", response_model=list[UserDto])
        async def list_users(_: UsuarioDB = Depends(require_user)) -> list[UserDto]:
            colector = Colector.colector
            with DB.crear_sesion() as session:
                users = colector.repo_usuarios.list_all(session)
                return [
                    UserDto(
                        id=user.id,
                        code=user.codigo,
                        username=user.alias,
                        fullname=user.nombre,
                        role_id=user.rol_id,
                    )
                    for user in users
                ]

        @api_router.patch("/users/{user_id}", response_model=UserDto)
        async def patch_user(user_id: int, payload: UserPatchDto, _: UsuarioDB = Depends(require_user)) -> UserDto:
            with DB.crear_sesion() as session:
                user = session.get(UsuarioDB, user_id)
                if user is None:
                    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

                if payload.username is not None:
                    user.alias = payload.username
                if payload.fullname is not None:
                    user.nombre = payload.fullname
                if payload.code is not None:
                    code = str(payload.code).strip()
                    if len(code) > 2:
                        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="code must have at most 2 characters")
                    user.codigo = code
                if payload.role_id is not None:
                    user.rol_id = payload.role_id

                try:
                    session.add(user)
                    session.commit()
                    session.refresh(user)
                except Exception:
                    session.rollback()
                    raise

                colector = Colector.colector
                if colector and colector.maestros and colector.maestros.usuarios is not None:
                    colector.maestros.usuarios[user.id] = UsuarioDTO.from_db(user)

                return UserDto(
                    id=user.id,
                    code=user.codigo,
                    username=user.alias,
                    fullname=user.nombre,
                    role_id=user.rol_id,
                )

        router = APIRouter()
        router.include_router(auth_router)
        router.include_router(api_router)
        return router
