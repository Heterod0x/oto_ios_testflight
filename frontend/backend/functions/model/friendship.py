from __future__ import annotations

from datetime import datetime

from firedantic import Model, SubCollection, SubModel
from pydantic import ConfigDict, Field

from lib.utils import utcnow


class User(Model):
    __collection__ = "users"

    # The user document may include additional fields such as avatarColor or points.
    # We only need the identifier to verify existence, so allow arbitrary extras.
    name: str | None = None

    model_config = ConfigDict(extra="allow", populate_by_name=True)


class FriendLink(SubModel):
    friendId: str
    roomId: str
    createdAt: datetime = Field(default_factory=utcnow)
    updatedAt: datetime = Field(default_factory=utcnow)

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    class Collection(SubCollection):
        __collection_tpl__ = "users/{id}/friends"

    def touch(self) -> None:
        self.updatedAt = utcnow()


class FriendRoom(Model):
    __collection__ = "rooms"

    participants: list[str]
    roomId: str
    createdAt: datetime = Field(default_factory=utcnow)
    updatedAt: datetime = Field(default_factory=utcnow)

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    def touch(self) -> None:
        self.updatedAt = utcnow()
