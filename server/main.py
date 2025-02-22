import logging
import os
import cuid
import json
import subprocess
from mutagen.mp3 import MP3
import urllib
from typing import List, Dict

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

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

@app.get("/tts-models")
async def get_tts_models():
    return {"models": [
        {"name": "Alice", "id": "Xb7hH8MSUJpSbSDYk0k2"},
        {"name": "Dori", "id": "AZnzlk1XvdvUeBnXmlld"},
        {"name": "Hans", "id": "2IvXjXK6UQs4Y5eCkX4q"}
    ]}

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

class TranscriptUpdate(BaseModel):
    video_id: str
    transcripts: List[Dict[str, str]]
    voice_id: str = "AZnzlk1XvdvUeBnXmlld"  # Default voice ID

@app.post("/video/{video_id}/update")
async def update_video(video_id: str, update: TranscriptUpdate):
    try:
        video_id = urllib.parse.unquote(video_id).replace("files/", "")
        logger.info(f"Updating video with ID: {video_id}")
        
        logger.info("Creating temporary audio directory")
        os.makedirs("static/temp_audio/", exist_ok=True)
        audio_files = []
        
        logger.info("Generating audio for each transcript")
        for transcript in update.transcripts:
            text = transcript['text']
            logger.debug(f"Processing text: {text}")
            audio = elevenlabs_processor.process(text, voice_id=update.voice_id)
            subtitle_id = cuid.cuid()
            audio_filename = f"temp_audio_{subtitle_id}.mp3"
            audio_path = os.path.join("static/temp_audio/", audio_filename)
            
            logger.debug(f"Saving audio to {audio_path}")
            with open(audio_path, "wb") as audio_file:
                audio_file.write(audio)
            
            logger.debug("Getting audio duration and updating transcript timing")
            audio_file = MP3(audio_path)
            audio_length = audio_file.info.length
            audio_files.append({
                'path': audio_path,
                'start': transcript['start'],
                'end': transcript['end']
            })

        logger.info("Preparing video paths")
        video_path = os.path.join("static/videos/", f"{video_id}.mp4")
        output_path = os.path.join("static/videos/", f"{video_id}_with_audio.mp4")
        temp_path = os.path.join("static/videos/", f"{video_id}_temp.mp4")
        
        try:
            logger.info("Step 1: Extracting video without audio")
            extract_cmd = [
                "ffmpeg", "-y",
                "-i", video_path,
                "-c:v", "copy",
                "-an",
                temp_path
            ]
            
            logger.info(f"Running FFmpeg extract command: {' '.join(extract_cmd)}")
            subprocess.run(extract_cmd, check=True, capture_output=True, text=True)
            
            if audio_files:
                logger.info("Step 2: Creating complex filter for audio mixing")
                # Construct FFmpeg command for mixing audio
                mix_cmd = ["ffmpeg", "-y"]
                
                # Add video input first
                mix_cmd.extend(["-i", temp_path])
                
                # Add all audio inputs
                for audio in audio_files:
                    mix_cmd.extend(["-i", audio['path']])
                
                # Construct filter complex
                filter_parts = []
                
                # Create audio delays for each input
                for i, audio in enumerate(audio_files, start=1):
                    # Convert time format from MM:SS to seconds
                    start_time = sum(x * int(t) for x, t in zip([60, 1], audio['start'].split(":")))
                    # Add volume adjustment and delay
                    filter_parts.append(f"[{i}:a]volume=1.0,adelay={int(start_time*1000)}|{int(start_time*1000)}[a{i}]")
                
                # Add the mix filter
                if filter_parts:
                    filter_parts.append(
                        "".join(f"[a{i}]" for i in range(1, len(audio_files) + 1)) +
                        f"amix=inputs={len(audio_files)}:dropout_transition=0:normalize=0[aout]"
                    )
                
                # Join all filter parts with semicolons
                filter_complex = ";".join(filter_parts)
                
                logger.debug(f"Filter complex: {filter_complex}")
                
                # Add filter complex to command
                mix_cmd.extend([
                    "-filter_complex", filter_complex,
                    "-map", "0:v",
                    "-map", "[aout]",
                    "-c:v", "copy",
                    "-c:a", "aac",
                    "-b:a", "256k",
                    output_path
                ])
                
                logger.info(f"Running FFmpeg mix command: {' '.join(mix_cmd)}")
                process = subprocess.run(mix_cmd, check=True, capture_output=True, text=True)
                logger.info(f"FFmpeg stdout: {process.stdout}")
                logger.error(f"FFmpeg stderr: {process.stderr}")
                
                logger.info("Replacing original video with the new one")
                os.replace(output_path, video_path)
            else:
                logger.info("No audio files, using the video without audio")
                os.replace(temp_path, video_path)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr}")
            return {"success": False, "error": f"Failed to merge audio: {e.stderr}"}
        finally:
            logger.info("Cleaning up temporary files")
            for path in [temp_path] + [audio['path'] for audio in audio_files]:
                if os.path.exists(path):
                    os.remove(path)
                    logger.debug(f"Removed temporary file: {path}")
        
        logger.info("Updating transcripts in database")
        with get_db_cursor() as cursor:
            cursor.execute(
                "UPDATE videos SET transcripts = %s WHERE video_id = %s",
                (json.dumps(update.transcripts), video_id)
            )
        
        logger.info("Video update completed successfully")
        return {"success": True, "message": "Video updated successfully"}
    except Exception as e:
        logger.error(f"Error updating video: {str(e)}")
        return {"success": False, "error": str(e)}
