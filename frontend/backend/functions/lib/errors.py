from __future__ import annotations

from typing import Any
import json
from firebase_functions import https_fn


class ApiError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 400,
        *,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


def to_http_error(err: Exception) -> https_fn.Response:
    if isinstance(err, ApiError):
        payload = {
            "error": err.message,
            **({"details": err.details} if err.details else {}),
        }
        return https_fn.Response(json.dumps(payload), status=int(err.status_code))
    if isinstance(err, PermissionError):
        return https_fn.Response({"error": str(err) or "Unauthorized"}, status=401)
    return https_fn.Response({"error": "Internal Server Error"}, status=500)
