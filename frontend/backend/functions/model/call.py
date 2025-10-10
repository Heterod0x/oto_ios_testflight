from __future__ import annotations

from datetime import datetime

from firedantic import SubCollection, SubModel
from pydantic import ConfigDict, Field

from lib.utils import utcnow


class CallHistoryEntry(SubModel):
    peerId: str
    peerName: str
    roomId: str
    startedAt: int
    endedAt: int
    durationSeconds: int
    pointsEarned: int
    createdAt: datetime = Field(default_factory=utcnow)

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    class Collection(SubCollection):
        __collection_tpl__ = "users/{id}/callHistory"
