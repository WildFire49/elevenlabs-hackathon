from abc import ABC, abstractmethod


class TTSProcessor(ABC):

    @abstractmethod
    def process(self, text: str) -> str:
        pass
