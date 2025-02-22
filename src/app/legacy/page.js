'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [subtitles, setSubtitles] = useState([]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const playerRef = useRef(null);
  const { toast } = useToast();

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!video || !prompt) {
      toast({
        title: "Error",
        description: "Please select a video and enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);
    setSubtitles([]);
    setAudioQueue([]);

    const formData = new FormData();
    formData.append('video', video);
    formData.append('prompt', prompt);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const response = await fetch('http://localhost:8000/process-video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      
      if (!response.ok) throw new Error('Processing failed');
      
      const data = await response.json();
      setSubtitles(data.result.subtitles);
      setProgress(100);
      
      // Preload all audio files with their durations
      const audioUrls = data.result.subtitles.map((subtitle, index) => {
        const start = timeToSeconds(subtitle.start);
        const audioLength = subtitle.audio_length;
        const end = start + audioLength;
        
        // Calculate next start time based on the next subtitle's audio
        const nextSubtitle = data.result.subtitles[index + 1];
        const nextStart = nextSubtitle 
          ? Math.min(
              timeToSeconds(nextSubtitle.start),
              end // Don't let it overlap with next subtitle's start
            )
          : end;

        return {
          id: subtitle.audio_id,
          start,
          end,
          audioLength,
          url: `http://localhost:8000/audio/${subtitle.audio_id}`,
          nextStart,
          text: subtitle.text // Store text for debugging
        };
      });
      setAudioQueue(audioUrls);
      
      toast({
        title: "Success",
        description: "Video processed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const timeToSeconds = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsRemaining = Math.floor(seconds % 60);
    return `${minutes}:${secondsRemaining.toString().padStart(2, '0')}`;
  };

  const getCurrentSubtitle = () => {
    if (!audioQueue.length) return null;
    
    return audioQueue.find(audio => {
      // Use audio timing instead of subtitle timing
      return currentTime >= audio.start && currentTime < audio.end;
    });
  };

  // Handle audio playback with smooth transitions
  useEffect(() => {
    if (!playing || audioQueue.length === 0) {
      if (currentAudio) {
        fadeOutAudio(currentAudio);
      }
      return;
    }

    const currentAudioItem = getCurrentSubtitle();
    if (!currentAudioItem) {
      if (currentAudio) {
        fadeOutAudio(currentAudio);
      }
      return;
    }

    const playAudioSegment = async () => {
      try {
        setIsLoadingAudio(true);

        // Calculate time until this audio should end
        const timeUntilEnd = currentAudioItem.end - currentTime;
        
        // If current audio is already playing this segment and we're not near the end
        if (
          currentAudio?.dataset?.audioId === currentAudioItem.id &&
          timeUntilEnd > 0.5 // More than 0.5s left
        ) {
          setIsLoadingAudio(false);
          return;
        }

        // Fade out current audio if it exists
        if (currentAudio) {
          fadeOutAudio(currentAudio);
        }

        const audio = new Audio(currentAudioItem.url);
        audio.dataset.audioId = currentAudioItem.id;
        audio.muted = muted;
        
        // Calculate where to start playing from
        const startOffset = Math.max(0, currentTime - currentAudioItem.start);
        
        // Check if enough time remains in this segment
        const timeLeftInAudio = currentAudioItem.audioLength - startOffset;
        if (timeLeftInAudio < 0.2) { // Don't play if less than 0.2s left
          setIsLoadingAudio(false);
          return;
        }

        audio.currentTime = startOffset;
        await audio.play();

        // Start fading in
        fadeInAudio(audio);
        
        setCurrentAudio(audio);
        setIsLoadingAudio(false);

        // Schedule fade out based on actual audio end time
        const timeUntilFadeOut = (currentAudioItem.end - currentTime) * 1000 - 500; // Start fade 500ms before end
        if (timeUntilFadeOut > 0) {
          setTimeout(() => {
            fadeOutAudio(audio);
          }, timeUntilFadeOut);
        }

      } catch (error) {
        console.error('Error playing audio:', error);
        setIsLoadingAudio(false);
      }
    };

    playAudioSegment();

    return () => {
      if (currentAudio) {
        fadeOutAudio(currentAudio);
      }
    };
  }, [currentTime, playing, audioQueue, muted]);

  // Audio fade functions
  const fadeOutAudio = (audio, duration = 500) => {
    if (!audio || audio.volume === 0) return;
    
    const startVolume = audio.volume;
    const steps = 20;
    const decrementValue = startVolume / steps;
    const stepTime = duration / steps;

    const fade = setInterval(() => {
      if (audio.volume - decrementValue > 0) {
        audio.volume = Math.max(0, audio.volume - decrementValue);
      } else {
        audio.volume = 0;
        audio.pause();
        clearInterval(fade);
      }
    }, stepTime);
  };

  const fadeInAudio = (audio, duration = 300) => {
    if (!audio) return;
    
    audio.volume = 0;
    const steps = 20;
    const incrementValue = 1 / steps;
    const stepTime = duration / steps;

    const fade = setInterval(() => {
      if (audio.volume + incrementValue < 1) {
        audio.volume = Math.min(1, audio.volume + incrementValue);
      } else {
        audio.volume = 1;
        clearInterval(fade);
      }
    }, stepTime);
  };

  // Handle mute state for audio
  useEffect(() => {
    if (currentAudio) {
      currentAudio.muted = muted;
    }
  }, [muted]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Video Voiceover Generator</h1>
          <p className="text-gray-600">Upload a video and get AI-generated voiceovers with synchronized subtitles</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Upload Video
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer hover:bg-gray-100">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <span className="mt-2 text-base text-gray-600">
                    {video ? video.name : "Click to upload video"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Prompt
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a description for the video voiceover..."
                className="min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={processing || !video}
              className="w-full"
            >
              {processing ? "Processing..." : "Generate Voiceover"}
            </Button>
          </form>

          {processing && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Processing video...</div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </div>

        {videoUrl && subtitles.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPlaying(!playing)}
                    disabled={isLoadingAudio}
                  >
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMuted(!muted)}
                  >
                    {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show Subtitles Overlay</span>
                  <Switch
                    checked={showOverlay}
                    onCheckedChange={setShowOverlay}
                  />
                </div>
              </div>

              <div className="relative rounded-lg overflow-hidden">
                <ReactPlayer
                  ref={playerRef}
                  url={videoUrl}
                  width="100%"
                  height="auto"
                  playing={playing}
                  muted={true}
                  onProgress={({ playedSeconds }) => setCurrentTime(playedSeconds)}
                  onPause={() => setPlaying(false)}
                  onPlay={() => setPlaying(true)}
                />
                {showOverlay && getCurrentSubtitle() && (
                  <div className="absolute bottom-4 left-0 right-0 mx-auto text-center">
                    <div className="bg-black bg-opacity-60 text-white p-2 mx-4 rounded">
                      {getCurrentSubtitle().text}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Transcription</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {audioQueue.map((audio, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        getCurrentSubtitle()?.id === audio.id
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-sm text-gray-500">
                        {formatTime(audio.start)} - {formatTime(audio.end)}
                      </div>
                      <div className="text-gray-900">{audio.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
