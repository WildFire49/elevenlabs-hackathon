# Video Processing API

A FastAPI server that processes video files with text prompts.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload
```

## API Endpoints

### POST /process-video

Accepts a video file and a text prompt, returns a success response.

**Parameters:**
- `video`: Video file (multipart/form-data)
- `prompt`: Text prompt (form field)

**Response:**
```json
{
    "success": true
}
```
