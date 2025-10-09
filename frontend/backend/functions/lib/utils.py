from __future__ import annotations

import json
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, TypeVar

from firebase_functions import https_fn

from .errors import ApiError, to_http_error

F = TypeVar("F", bound=Callable[..., Any])


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def to_timestamp(dt: datetime | None) -> float | None:
    if dt is None:
        return None
    return dt.timestamp()


def parse_json(request: https_fn.Request) -> dict[str, Any]:
    if request.content_type != "application/json":
        raise ApiError("Content-Type must be application/json", status_code=415)
    try:
        body = request.get_json(force=True)
    except Exception as exc:
        raise ApiError("Invalid JSON payload") from exc
    if not isinstance(body, dict):
        raise ApiError("JSON payload must be an object")
    return body


def json_response(payload: Any, status: int = 200) -> https_fn.Response:
    return https_fn.Response(
        json.dumps(payload), status=status, headers={"Content-Type": "application/json"}
    )


def message_response(message: str, status: int = 200) -> https_fn.Response:
    return json_response({"message": message}, status=status)


def handler(func: F) -> F:
    def wrapper(request: https_fn.Request, *args: Any, **kwargs: Any):
        try:
            return func(request, *args, **kwargs)
        except Exception as exc:
            return to_http_error(exc)

    return wrapper


def random_id(prefix: str = "") -> str:
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=12))
    return f"{prefix}{suffix}" if prefix else suffix


def add_duration(dt: datetime, delta: timedelta) -> datetime:
    return dt + delta


def ensure_fields(data: dict[str, Any], required: list[str]) -> None:
    missing = [field for field in required if field not in data]
    if missing:
        raise ApiError(f"Missing required fields: {', '.join(missing)}")
