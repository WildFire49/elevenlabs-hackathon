from pydantic.v1 import BaseModel


class ProcessedVideoResponse(BaseModel):
    video_id: str = ""
    subtitles: list[dict[str, str]] = [
        {
            "start": str,
            "end": str,
            "text": str
        }
    ]