"""Configuration and constants for the conversation collector APIs."""

from __future__ import annotations

import os
from datetime import timedelta
from pydantic import BaseModel, Field

import dotenv

dotenv.load_dotenv()


class Settings(BaseModel):
    project_id: str | None = Field(default=os.getenv("FIREBASE_PROJECT_ID"))
    daily_api_key: str | None = Field(default=os.getenv("DAILY_API_KEY"))
    daily_base_url: str = Field(
        default=os.getenv("DAILY_BASE_URL", "https://api.daily.co/v1")
    )
    daily_bucket_name: str | None = Field(default=os.getenv("DAILY_BUCKET_NAME"))
    daily_bucket_region: str | None = Field(default=os.getenv("DAILY_BUCKET_REGION"))
    daily_assume_role_arn: str | None = Field(
        default=os.getenv("DAILY_ASSUME_ROLE_ARN")
    )
    webhook_secret: str | None = Field(default=os.getenv("DAILY_WEBHOOK_SECRET"))


settings = Settings()
