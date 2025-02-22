from abc import ABC, abstractmethod


class VideoProcessor(ABC):
    @abstractmethod
    def process(self, video_path: str, prompt: str) -> str:
        pass
