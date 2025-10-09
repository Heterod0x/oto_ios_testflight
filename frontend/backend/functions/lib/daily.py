import requests
from datetime import datetime
from typing import Optional
from lib.utils import utcnow
from model.daily import DailyMeetingResponse


class DailyClient:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        bucket_name: str,
        bucket_region: str,
        assume_role_arn: str,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        self.bucket_name = bucket_name
        self.bucket_region = bucket_region
        self.assume_role_arn = assume_role_arn

    def create_room(self, room_name: str, expires_at: Optional[datetime] = None):
        if room_name == "":
            raise ValueError("Room name cannot be empty")
        if expires_at is not None and expires_at < utcnow():
            raise ValueError("Expires at must be in the future, not in the past")

        url = f"{self.base_url}/rooms"
        payload: dict[str, object] = {
            "name": room_name,
            "privacy": "public",  # we use public for now.
        }

        properties: dict[str, object] = {
            "enable_recording": "raw-tracks",
            "eject_at_room_exp": expires_at is not None,
        }
        if expires_at is not None:
            properties["exp"] = int(expires_at.timestamp())

        if (
            self.bucket_name
            and self.bucket_region
            and self.assume_role_arn
        ):
            properties["recordings_bucket"] = {
                "bucket_name": self.bucket_name,
                "bucket_region": self.bucket_region,
                "assume_role_arn": self.assume_role_arn,
                "allow_api_access": True,
                "allow_streaming_from_bucket": False,
            }

        if properties:
            payload["properties"] = properties

        response = requests.post(url, headers=self.headers, json=payload)
        if response.status_code != 200:
            print(response.json())
            raise Exception(response.json())
        return response.json()

    def create_meeting_token(
        self,
        room_name: str,
        expires_at: datetime,
        max_duration_in_seconds: int,
        user_name: str,
        user_id: str,
    ) -> str:
        if room_name == "" or room_name is None:
            raise ValueError("Room name cannot be empty")

        url = f"{self.base_url}/meeting-tokens"
        payload = {
            "properties": {
                "room_name": room_name,
                "user_name": user_name,
                "eject_at_token_exp": True,
                "exp": int(expires_at.timestamp()),
                "enable_screenshare": False,
                "enable_recording_ui": False,
                "enable_prejoin_ui": False,
                "start_video_off": True,
                "start_cloud_recording": False,  # raw-tracks is not supported to be automatically started
                "enable_recording": "raw-tracks",
                "user_id": user_id,
            },
        }
        response = requests.post(url, headers=self.headers, json=payload)
        if response.status_code != 200:
            raise Exception(response.json())
        return response.json()["token"]

    def get_recording(self, recording_id: str) -> dict:
        url = f"{self.base_url}/recordings/{recording_id}"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200:
            raise Exception(response.json())
        return response.json()

    def get_meetings(self, room_name: str) -> DailyMeetingResponse:
        url = f"{self.base_url}/meetings"
        response = requests.get(url, params={"room": room_name}, headers=self.headers)
        if response.status_code != 200:
            raise Exception(response.json())
        return DailyMeetingResponse.model_validate_json(response.text, strict=False)
