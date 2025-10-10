import math
from uuid import uuid4

from firebase_functions import https_fn
from firebase_functions import options
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app, firestore
from firedantic import configure
from firedantic.exceptions import ModelNotFoundError

from lib.firebase import get_uid_verify
from lib.daily import DailyClient
from lib.config import settings
from lib.errors import ApiError
from lib.utils import (
    ensure_fields,
    handler,
    json_response,
    message_response,
    parse_json,
)
from model.call import CallHistoryEntry
from model.friendship import FriendLink, FriendRoom, User


set_global_options(max_instances=10)

initialize_app()
client = firestore.client()

# configure firedantic
configure(client)

# daily client
daily_client = DailyClient(
    settings.daily_base_url,
    settings.daily_api_key,
    settings.daily_bucket_name,
    settings.daily_bucket_region,
    settings.daily_assume_role_arn,
)


# define handlers

cors_options = options.CorsOptions(
    cors_origins=[
        "http://localhost:3000",
    ],
    cors_methods=["POST", "OPTIONS"],
)


def get_uid(req: https_fn.Request) -> str:
    authorization = req.headers.get("Authorization")
    if not authorization:
        raise PermissionError("Missing Authorization header")
    authorization = authorization.strip()
    if authorization.startswith("Bearer "):
        return get_uid_verify(authorization)
    return authorization


def compute_duration_seconds(started_at: int, ended_at: int) -> int:
    raw_seconds = (ended_at - started_at) / 1000.0
    duration = math.floor(raw_seconds + 0.5)
    return max(duration, 0)


def compute_points(duration_seconds: int) -> int:
    return max(duration_seconds // 30, 1) * 5


def clear_waiting_flag(owner_id: str, friend_id: str) -> None:
    friend_link_ref = (
        client.collection("users")
        .document(owner_id)
        .collection("friends")
        .document(friend_id)
    )
    friend_link_ref.set(
        {"waiting": False, "updatedAt": firestore.SERVER_TIMESTAMP},
        merge=True,
    )


@https_fn.on_request(cors=cors_options)
def ping(req: https_fn.Request) -> https_fn.Response:
    return https_fn.Response("Hello World!")


@https_fn.on_request(cors=cors_options)
def hello_world_authenticated(req: https_fn.Request) -> https_fn.Response:
    uid = get_uid(req)
    return https_fn.Response(f"Hello World! {uid}")


@https_fn.on_request(cors=cors_options)
def add_friend(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    if req.method != "POST":
        return message_response("Method Not Allowed", status=405)

    uid = get_uid(req)
    body = parse_json(req)
    ensure_fields(body, ["friendId"])

    friend_id = str(body["friendId"]).strip()
    if not friend_id:
        raise ApiError("friendId must not be empty.")
    if friend_id == uid:
        raise ApiError("自分自身はフレンドに追加できません。")

    try:
        current_user = User.get_by_doc_id(uid)
    except ModelNotFoundError as exc:
        raise ApiError("ユーザーが存在しません。", status_code=404) from exc

    try:
        target_user = User.get_by_doc_id(friend_id)
    except ModelNotFoundError as exc:
        raise ApiError("フレンドが見つかりません。", status_code=404) from exc

    current_links = FriendLink.model_for(current_user)
    try:
        existing_link = current_links.get_by_id(friend_id)
        if existing_link.roomId:
            existing_link.touch()
            existing_link.save()
            return json_response(
                {"roomId": existing_link.roomId, "status": "already_exists"}
            )
    except ModelNotFoundError:
        existing_link = None

    participants = sorted([uid, friend_id])
    room_doc_id = f"{participants[0]}-{participants[1]}"

    try:
        room_doc = FriendRoom.get_by_doc_id(room_doc_id)
        room_id = room_doc.roomId
        if not room_id:
            raise ModelNotFoundError
    except ModelNotFoundError:
        room_id = f"fr-{uuid4().hex}"
        try:
            daily_client.create_room(room_id)
        except Exception as exc:  # pragma: no cover
            raise ApiError("Daily roomの作成に失敗しました。", status_code=502) from exc
        room_doc = FriendRoom(
            id=room_doc_id,
            participants=participants,
            roomId=room_id,
        )

    room_doc.participants = participants
    room_doc.roomId = room_id
    room_doc.touch()
    room_doc.save()

    def upsert_friend_link(owner: User, counterpart_id: str) -> None:
        collection_model = FriendLink.model_for(owner)
        try:
            link = collection_model.get_by_id(counterpart_id)
            link.roomId = room_id
        except ModelNotFoundError:
            link = collection_model(
                id=counterpart_id,
                friendId=counterpart_id,
                roomId=room_id,
            )
        link.touch()
        link.save()

    upsert_friend_link(current_user, friend_id)
    upsert_friend_link(target_user, uid)

    return json_response({"roomId": room_id, "status": "created"})


@https_fn.on_request(cors=cors_options)
def record_call_history(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    if req.method != "POST":
        return message_response("Method Not Allowed", status=405)

    uid = get_uid(req)
    body = parse_json(req)
    ensure_fields(body, ["friendId", "roomId"])

    daily_room_id = str(body["roomId"]).strip()
    if not daily_room_id:
        raise ApiError("roomId must not be empty.")

    friend_id = str(body["friendId"]).strip()
    if not friend_id:
        raise ApiError("friendId must not be empty.")
    if friend_id == uid:
        raise ApiError("同じユーザーを指定することはできません。")

    participants = sorted([uid, friend_id])
    room_id = f"{participants[0]}-{participants[1]}"

    room = FriendRoom.get_by_doc_id(room_id)
    if not room:
        raise ApiError("roomIdが見つかりません。", status_code=404)
    if room.participants[0] != uid and room.participants[1] != uid:
        raise ApiError("roomIdが見つかりません。", status_code=404)
    if room.participants[0] != friend_id and room.participants[1] != friend_id:
        raise ApiError("roomIdが見つかりません。", status_code=404)

    try:
        current_user = User.get_by_doc_id(uid)
    except ModelNotFoundError as exc:
        raise ApiError("ユーザーが存在しません。", status_code=404) from exc

    try:
        friend_user = User.get_by_doc_id(friend_id)
    except ModelNotFoundError as exc:
        raise ApiError("フレンドが見つかりません。", status_code=404) from exc

    current_user.activeCall = None
    current_user.save()

    clear_waiting_flag(friend_id, uid)

    meetings = daily_client.get_meetings(daily_room_id)

    for meeting in meetings.data:
        if meeting.ongoing:
            continue
        if len(meeting.participants) < 2:
            continue

        started_at = (meeting.start_time) * 1000
        ended_at = (meeting.start_time + meeting.duration) * 1000

        duration_seconds = compute_duration_seconds(started_at, ended_at)
        points_earned = compute_points(duration_seconds)

        user_history_model: type[CallHistoryEntry] = CallHistoryEntry.model_for(
            current_user
        )
        friend_history_model: type[CallHistoryEntry] = CallHistoryEntry.model_for(
            friend_user
        )

        user_history = user_history_model(
            id=meeting.id,
            peerId=friend_id,
            peerName=friend_user.name or friend_id,
            roomId=daily_room_id,
            startedAt=started_at,
            endedAt=ended_at,
            durationSeconds=duration_seconds,
            pointsEarned=points_earned,
        )
        friend_history = friend_history_model(
            id=meeting.id,
            peerId=uid,
            peerName=current_user.name or uid,
            roomId=daily_room_id,
            startedAt=started_at,
            endedAt=ended_at,
            durationSeconds=duration_seconds,
            pointsEarned=points_earned,
        )
        user_history.save()
        friend_history.save()

    # increment = firestore.Increment(points_earned)
    # user_doc_ref.update({"points": increment, "activeCall": None})
    # friend_doc_ref.update({"points": increment, "activeCall": None})

    return json_response(
        {
            "status": "recorded",
            "durationSeconds": duration_seconds,
            "pointsEarned": points_earned,
        }
    )
