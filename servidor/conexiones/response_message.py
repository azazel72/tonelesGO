# models/response_message.py
from __future__ import annotations
from typing import Any, Generic, Optional, TypeVar, Literal
from pydantic import BaseModel, Field

T = TypeVar("T")  # tipo del payload data

class ResponseMessage(BaseModel, Generic[T]):
    action: str  # o usa un Enum/Literal si quieres restringir
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, action: str, data: T) -> "ResponseMessage[T]":
        return cls(action=action, data=data)

    @classmethod
    def fail(cls, action: str, error: str) -> "ResponseMessage[Any]":
        return cls(action=action, error=error)
