import json
import os
import logging
import time

from google import genai
from google.genai.types import GenerateContentConfig

from models.video_processor import ProcessedVideoResponse
from video_processor.video_processor import VideoProcessor
from utils.db import get_db_cursor

logger = logging.getLogger(__name__)


class GeminiVideoProcessor(VideoProcessor):
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        self.system_prompt = """You're a professional content writer who creates high quality voiceover text for videos. Given the context of a video and a prompt, you should generate the voiceover text for the video with appropriate timestamps"""

    def process(self, video_path: str, prompt: str) -> ProcessedVideoResponse:
        try:
            logger.info(f"Processing video {video_path}")
            video = self.__upload__video__(video_path)
            logger.info(f"Uploaded video {video_path} as {video.name}")
            response = self.client.models.generate_content(
                model="gemini-1.5-pro",
                config=GenerateContentConfig(
                    system_instruction=self.system_prompt,
                    temperature=0,
                    response_schema=genai.types.Schema(
                        type=genai.types.Type.OBJECT,
                        enum=[],
                        required=["subtitles"],
                        properties={
                            "subtitles": genai.types.Schema(
                                type=genai.types.Type.ARRAY,
                                items=genai.types.Schema(
                                    type=genai.types.Type.OBJECT,
                                    enum=[],
                                    required=["start", "end", "text"],
                                    properties={
                                        "start": genai.types.Schema(
                                            type=genai.types.Type.STRING,
                                        ),
                                        "end": genai.types.Schema(
                                            type=genai.types.Type.STRING,
                                        ),
                                        "text": genai.types.Schema(
                                            type=genai.types.Type.STRING,
                                        ),
                                    },
                                ),
                            ),
                            "error": genai.types.Schema(
                                type=genai.types.Type.STRING,
                            ),
                        },
                    ),
                    response_mime_type="application/json"
                ),
                contents=[video, prompt if prompt else "Generate a professional voiceover text for this video"],
            )
            logger.info(f"Generated subtitles for video {video_path}")
            
            # Parse the response
            subtitles = json.loads(response.text)['subtitles']
            video_id = video.name.replace("files/", "")
            logger.info(f"Processing video with ID: {video_id}")
            logger.info(f"Subtitles to be stored: {subtitles}")
            
            # Store transcripts in database
            with get_db_cursor() as cursor:
                # First check if video exists
                cursor.execute(
                    "SELECT video_id FROM videos WHERE video_id = %s",
                    (video_id,)
                )
                exists = cursor.fetchone()
                logger.info(f"Video exists in database: {exists is not None}")
                
                if not exists:
                    logger.info("Video not found in database, inserting new record")
                    cursor.execute(
                        "INSERT INTO videos (video_id, transcripts) VALUES (%s, %s)",
                        (video_id, json.dumps(subtitles))
                    )
                else:
                    logger.info("Video found in database, updating transcripts")
                    cursor.execute(
                        "UPDATE videos SET transcripts = %s WHERE video_id = %s",
                        (json.dumps(subtitles), video_id)
                    )
                logger.info(f"Updated transcripts for video_id: {video_id}")
            
            return ProcessedVideoResponse(video_id=video.name, subtitles=subtitles)
        except Exception as e:
            logger.error(f"Error processing video {video_path}: {e}")
            raise e

    def __upload__video__(self, file_path) -> genai.types.File:
        logger.info(f"Uploading video {file_path}")
        uploaded_file = self.client.files.upload(file=file_path)
        while uploaded_file.state.name == "PROCESSING":
            print(".", end="", flush=True)
            time.sleep(1)
            uploaded_file = self.client.files.get(name=uploaded_file.name)

        if uploaded_file.state.name == "FAILED":
            raise Exception(f"Failed to upload video {file_path}")
        
        # Store video ID in database using the central connection
        video_id = uploaded_file.name.replace("files/", "")
        logger.info(f"Storing video_id in database: {video_id}")
        with get_db_cursor() as cursor:
            cursor.execute(
                "INSERT INTO videos (video_id) VALUES (%s) ON CONFLICT (video_id) DO NOTHING",
                (video_id,)
            )
            logger.info(f"Stored video_id in database: {video_id}")
            
        logger.info(f"Uploaded video {file_path} as {uploaded_file.name}")
        return uploaded_file
