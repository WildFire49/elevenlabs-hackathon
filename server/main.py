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
        # Decode video_id and log
        video_id = urllib.parse.unquote(video_id).replace("files/", "")
        logger.info(f"Updating video with ID: {video_id}")

        # Create temporary audio directory
        logger.info("Creating temporary audio directory")
        os.makedirs("static/temp_audio/", exist_ok=True)
        audio_files = []  # Will store dicts with keys: path, start, end, audio_length, orig_start, orig_end

        logger.info("Generating audio for each transcript")
        # (Assume update.transcripts is sorted by start time, e.g. "MM:SS")
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

            # Get audio duration
            logger.debug("Getting audio duration and updating transcript timing")
            mp3_audio = MP3(audio_path)
            audio_length = mp3_audio.info.length

            # Convert transcript start and end (format "MM:SS") to seconds
            start_sec = sum(x * int(t) for x, t in zip([60, 1], transcript['start'].split(":")))
            end_sec = sum(x * int(t) for x, t in zip([60, 1], transcript['end'].split(":")))
            video_duration = end_sec - start_sec

            audio_files.append({
                'path': audio_path,
                'start': transcript['start'],
                'end': transcript['end'],
                'audio_length': audio_length,
                'video_duration': video_duration,
                'orig_start': start_sec,
                'orig_end': end_sec
            })

        logger.info("Preparing video paths")
        video_path = os.path.join("static/videos/", f"{video_id}.mp4")
        output_path = os.path.join("static/videos/", f"{video_id}_with_audio.mp4")
        temp_path = os.path.join("static/videos/", f"{video_id}_temp.mp4")

        # First, extract the video without audio (we will re-encode the video)
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

            # Get total video duration using ffprobe
            ffprobe_cmd = [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                temp_path
            ]
            result = subprocess.run(ffprobe_cmd, capture_output=True, text=True)
            video_total_duration = float(result.stdout.strip())
            logger.info(f"Total video duration: {video_total_duration} seconds")

            # Build segments for video processing.
            # We want to create segments for:
            #   • Non-transcript parts (which remain at normal speed)
            #   • Transcript segments (which will be slowed down so that their new duration equals the corresponding MP3 length)
            segments = []
            audio_delays = []  # new timeline start for each transcript segment audio

            current_orig = 0  # current position in the original video timeline
            new_time = 0  # accumulator for new (stretched) timeline time

            # Process each transcript segment (assumed in order)
            for idx, af in enumerate(audio_files):
                orig_start = af['orig_start']
                orig_end = af['orig_end']

                # If there is a gap before this transcript segment, add it as a non-transcript segment
                if orig_start > current_orig:
                    seg_duration = orig_start - current_orig
                    segments.append({
                        "type": "non",
                        "start": current_orig,
                        "end": orig_start,
                        "new_duration": seg_duration
                    })
                    new_time += seg_duration
                    current_orig = orig_start

                # Transcript segment – calculate slowdown factor so new duration equals MP3 duration
                seg_orig_duration = orig_end - orig_start
                factor = af['audio_length'] / seg_orig_duration if seg_orig_duration > 0 else 1
                segments.append({
                    "type": "transcript",
                    "start": orig_start,
                    "end": orig_end,
                    "new_duration": af['audio_length'],
                    "factor": factor,
                    "audio_index": idx
                })
                # Record the new timeline start for this transcript audio
                audio_delays.append(new_time)
                new_time += af['audio_length']
                current_orig = orig_end

            # Add any remaining video after the last transcript
            if current_orig < video_total_duration:
                segments.append({
                    "type": "non",
                    "start": current_orig,
                    "end": video_total_duration,
                    "new_duration": video_total_duration - current_orig
                })

            # Build the filter_complex for video.
            # For each segment, we trim from the video input and (if a transcript segment) apply setpts to slow it down.
            vf_parts = []
            seg_labels = []
            for i, seg in enumerate(segments):
                if seg["type"] == "non":
                    # Normal segment – just trim and reset pts
                    vf_parts.append(
                        f"[0:v]trim=start={seg['start']}:end={seg['end']},setpts=PTS-STARTPTS[seg{i}]".replace("{i}",
                                                                                                               str(i)))
                else:
                    # Transcript segment – slow down by factor so that new duration = original duration * factor
                    vf_parts.append(
                        f"[0:v]trim=start={seg['start']}:end={seg['end']},setpts=PTS-STARTPTS,setpts=PTS*{seg['factor']:.4f}[seg{i}]".replace(
                            "{i}", str(i)))
                seg_labels.append(f"[seg{i}]".replace("{i}", str(i)))
            # Concatenate all video segments together
            concat_filter = "".join(seg_labels) + f"concat=n={len(segments)}:v=1:a=0[v]"
            video_filter_complex = ";".join(vf_parts + [concat_filter])
            logger.debug(f"Video filter_complex: {video_filter_complex}")

            # Build filter_complex for audio.
            # For each transcript’s MP3 we delay its start by the new timeline offset computed above.
            audio_filters = []
            for i, delay in enumerate(audio_delays, start=1):
                delay_ms = int(delay * 1000)
                audio_filters.append(f"[{i}:a]volume=1.0,adelay={delay_ms}|{delay_ms}[a{i}]")
            if audio_filters:
                amix_input = "".join(f"[a{i}]" for i in range(1, len(audio_filters) + 1))
                audio_filter_complex = ";".join(audio_filters + [
                    f"{amix_input}amix=inputs={len(audio_filters)}:dropout_transition=0:normalize=0[aout]"])
            else:
                # If no transcript audio exists, we won’t add any audio
                audio_filter_complex = ""

            # Combine video and audio filter_complex strings.
            if audio_filter_complex:
                filter_complex = video_filter_complex + ";" + audio_filter_complex
            else:
                filter_complex = video_filter_complex

            # Build the final FFmpeg command.
            mix_cmd = ["ffmpeg", "-y", "-i", temp_path]
            # Append each audio file input
            for af in audio_files:
                mix_cmd.extend(["-i", af['path']])
            mix_cmd.extend([
                "-filter_complex", filter_complex,
                "-map", "[v]",
                "-map", "[aout]",
                "-c:v", "libx264",
                "-preset", "slow",  # Ensure high quality encoding
                "-crf", "18",  # Lower CRF for higher quality output
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

        except subprocess.CalledProcessError as e:
            logger.error(f"FFmpeg error: {e.stderr}")
            return {"success": False, "error": f"Failed to merge audio: {e.stderr}"}
        finally:
            logger.info("Cleaning up temporary files")
            # Remove temporary video and audio files
            for path in [temp_path] + [af['path'] for af in audio_files]:
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





