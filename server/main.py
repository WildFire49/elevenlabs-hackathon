import logging
import os
import cuid

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from tts.elevenlabs_tts_processor import ElevenLabsTTSProcessor
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
        # Save the uploaded video temporarily
        temp_video_path = f"temp_{video.filename}"
        with open(temp_video_path, "wb") as temp_file:
            temp_file.write(await video.read())

        # Process the video using GeminiVideoProcessor
        result = gemini_processor.process(temp_video_path, prompt)
        video_id = result.video_id
        subtitles = result.subtitles
        
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
            
            # Store the audio ID that can be used with get_audio endpoint
            subtitle['audio_id'] = f"audio_{subtitle_id}"
        
        # Clean up temporary video file
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