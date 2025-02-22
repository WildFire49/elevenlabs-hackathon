import logging
import os
import cuid
from mutagen.mp3 import MP3
import urllib

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from tts.elevenlabs_tts_processor import ElevenLabsTTSProcessor
from utils.db import get_db_cursor
from video_processor.gemini_video_processor import GeminiVideoProcessor

load_dotenv()
app = FastAPI()
gemini_processor = GeminiVideoProcessor()
elevenlabs_processor = ElevenLabsTTSProcessor()

logger = logging.getLogger(__name__)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount the static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse('static/index.html')

@app.post("/process-video")
async def process_video(
        video: UploadFile = File(...),
        prompt: str = Form(...)
):
    try:
        os.makedirs("static/videos/", exist_ok=True)
        # Save the uploaded video temporarily
        temp_video_path = f"temp_{video.filename}"
        video_content = await video.read()
        with open(temp_video_path, "wb") as temp_file:
            temp_file.write(video_content)

        # Process the video using GeminiVideoProcessor
        result = gemini_processor.process(temp_video_path, prompt)
        video_id = result.video_id.replace("files/", "")
        logger.info(f"Generated video_id: {video_id}")
        
        # Save video file
        video_path = os.path.join("static/videos/", f"{video_id}.mp4")
        logger.info(f"Saving video to path: {video_path}")
        with open(video_path, "wb") as video_file:
            video_file.write(video_content)
        subtitles = result.subtitles
        logger.info(f"Generated subtitles: {subtitles}")
        
        # Create audio directory if it doesn't exist
        os.makedirs("static/audio/", exist_ok=True)
        
        for subtitle in subtitles:
            text = subtitle['text']
            audio = elevenlabs_processor.process(text)
            subtitle_id = cuid.cuid()
            audio_filename = f"audio_{subtitle_id}.mp3"
            audio_path = os.path.join("static/audio/", audio_filename)
            
            with open(audio_path, "wb") as audio_file:
                audio_file.write(audio)
            
            # Get audio duration
            audio_file = MP3(audio_path)
            audio_length = audio_file.info.length
            
            # Store the audio ID and length that can be used with get_audio endpoint
            subtitle['audio_id'] = f"audio_{subtitle_id}"
            subtitle['audio_length'] = audio_length
        os.remove(temp_video_path)
        return {"success": True, "result": result}
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        return {"success": False, "error": str(e)}


@app.post("/text-to-speech")
async def text_to_speech(text: str = Form(...)):
    try:
        audio = elevenlabs_processor.process(text)
        return Response(content=audio, media_type="audio/mpeg")
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/videos/{video_id}")
async def get_video_only(video_id: str):
    try:
        video_id = urllib.parse.unquote(video_id).replace("files/", "")
        logger.info(f"Getting video with ID: {video_id}")
        video_path = os.path.join("static/videos/", f"{video_id}.mp4")
        logger.info(f"Looking for video at path: {video_path}")
        if not os.path.exists(video_path):
            logger.error(f"Video file not found at path: {video_path}")
            return {"success": False, "error": "Video file not found"}
        return FileResponse(video_path, media_type="video/mp4")
    except Exception as e:
        logger.error(f"Error serving video: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/video/{video_id}/detail")
async def get_video(video_id: str):
    try:
        video_id = urllib.parse.unquote(video_id).replace("files/", "")
        logger.info(f"Getting video details with ID: {video_id}")
        
        # Get video transcripts from database
        with get_db_cursor() as cursor:
            # First check if video exists
            cursor.execute(
                "SELECT video_id, transcripts FROM videos WHERE video_id = %s",
                (video_id,)
            )
            result = cursor.fetchone()
            logger.info(f"Database query result: {result}")
            result = dict(result)
            if not result:
                logger.error(f"No video found for video_id: {video_id}")
                return {"success": False, "error": "Video not found in database"}
            
            if result["transcripts"] is None:
                logger.error(f"No transcripts found for video_id: {video_id}")
                return {"success": False, "error": "No transcripts available for this video"}
            
            transcripts = result["transcripts"]  # Get transcripts from the second column
            logger.info(f"Found transcripts for video_id: {video_id}")
            logger.info(f"Transcripts content: {transcripts}")
            
            return {
                "success": True,
                "video_url": f"http://localhost:8000/videos/{video_id}",
                "transcripts": transcripts
            }
    except Exception as e:
        logger.error(f"Error getting video details: {str(e)}")
        return {"success": False, "error": str(e)}



@app.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    try:
        audio_filename = f"{audio_id}.mp3"
        audio_path = os.path.join("static/audio/", audio_filename)
        
        if not os.path.exists(audio_path):
            return {"success": False, "error": "Audio file not found"}
            
        return FileResponse(audio_path, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"Error serving audio: {str(e)}")
        return {"success": False, "error": str(e)}
