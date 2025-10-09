from pydantic import BaseModel


class DailyMeetingResponse(BaseModel):
    total_count: int
    data: list["DailyMeeting"]


class DailyMeeting(BaseModel):
    id: str
    room: str
    start_time: int
    duration: int
    ongoing: bool
    max_participants: int
    participants: list["DailyParticipant"]


class DailyParticipant(BaseModel):
    user_id: str | None
    participant_id: str
    user_name: str
    join_time: int
    duration: int
