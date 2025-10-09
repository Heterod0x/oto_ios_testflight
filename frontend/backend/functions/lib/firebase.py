"""Firebase helpers."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import firebase_admin
from firebase_admin import auth, firestore

from .config import settings


@lru_cache(maxsize=1)
def get_app() -> firebase_admin.App:
    if firebase_admin._apps:
        return firebase_admin.get_app()
    return firebase_admin.initialize_app()


@lru_cache(maxsize=1)
def get_firestore_client() -> firestore.Client:
    app = get_app()
    return firestore.client(app=app, project=settings.project_id)


def get_uid_verify(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise PermissionError("Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    return auth.verify_id_token(token, app=get_app())["uid"]
