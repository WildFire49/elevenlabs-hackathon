import os
import typing

from elevenlabs import ElevenLabs, VoiceSettings

from tts.tts_processor import TTSProcessor


class ElevenLabsTTSProcessor(TTSProcessor):
    def __init__(self):
        self.client = ElevenLabs(
            api_key=os.environ.get("ELEVENLABS_API_KEY")
        )

    def process(self, text: str, voice_id: str = "AZnzlk1XvdvUeBnXmlld") -> bytes:
        audio = self.client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_192",
            voice_settings=VoiceSettings(
                stability=1,
                style=0.1,
                similarity_boost=0.8
            )
        )
        # Convert iterator to bytes if needed
        if isinstance(audio, typing.Iterator):
            return b''.join(audio)
        return audio

    def get_models(self) -> typing.List[typing.Dict[str, str]]:
        voices = self.client.voices.get_all()
        return [{"name": voice.name, "id": voice.voice_id} for voice in voices]