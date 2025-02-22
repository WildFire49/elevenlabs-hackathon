import os

from google import genai
from google.genai.types import GenerateContentConfig

from video_processor.video_processor import VideoProcessor


class GeminiVideoProcessor(VideoProcessor):
    def __init__(self, file_name: str):
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        self.system_prompt = """You're a professional content writer who creates high quality voiceover text for videos. Given the context of a video and a prompt, you should generate the voiceover text for the video with appropriate timestamps"""
        self.file_name = file_name

    def process(self, video_path: str, prompt: str) -> str:
        try:
            self.__upload__video__()
            response = self.client.models.generate_content(
                model="gemini-1.5-pro",
                config=GenerateContentConfig(
                    system_instruction=self.system_prompt,
                    temperature=0.5
                )
            )
            return response.text
        except Exception as e:
            print(e)
            return ""


    def __upload__video__(self):
        pass

        