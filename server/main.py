from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

load_dotenv()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/process-video")
async def process_video(
    video: UploadFile = File(...),
    prompt: str = Form(...)
):
    # Here you can add your video processing logic
    # For now, we'll just return a success response
    print(prompt)
    return {"success": True}
