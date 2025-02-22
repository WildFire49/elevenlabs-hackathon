'use client';

import { Box, styled } from '@mui/material';
import { useState, useRef, useEffect, useCallback } from 'react';
import VideoPreview from './components/VideoPreview';
import VideoTimeline from './components/VideoTimeline';
import Sidebar from './components/Sidebar';
import UploadState from './components/UploadState';

const EditorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: '#0a1929',
  overflow: 'hidden',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  gap: '12px',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, #1a365d40, transparent)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minHeight: 0, // Important for flex child scrolling
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto', // Enable scrolling
  '&::-webkit-scrollbar': {
    width: '8px',
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#0a1929',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#1e3a5f',
    borderRadius: '4px',
    '&:hover': {
      background: '#234876',
    },
  },
}));

export default function VideoEditor() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [subtitles, setSubtitles] = useState({
    result: {
      subtitles: []
    }
  });
  const [videoProgress, setVideoProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [audioOffset, setAudioOffset] = useState(0);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoVolume, setVideoVolume] = useState(1);
  const [audioVolume, setAudioVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const playerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (videoDuration > 0) {
      setTrimEnd(videoDuration);
    }
  }, [videoDuration]);

  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrimEnd(video.duration);
      };
    }
  }, [videoUrl]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Sort files by type - videos first, then audio
    const sortedFiles = files.sort((a, b) => {
      const isVideoA = a.type.startsWith('video/');
      const isVideoB = b.type.startsWith('video/');
      if (isVideoA && !isVideoB) return -1;
      if (!isVideoA && isVideoB) return 1;
      return 0;
    });

    // Process files in order
    sortedFiles.forEach(file => {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setTrimStart(0);
      } else if (file.type.startsWith('audio/')) {
        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(audio.duration);
        });
        setAudioUrl(url);
        setAudioFileName(file.name);
        setAudioOffset(0); // Reset audio offset when new audio is uploaded
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubtitlesChange = (newSubtitles) => {
    setSubtitles(newSubtitles);
  };

  const handlePlayPause = useCallback((newPlaying) => {
    setPlaying(newPlaying);
  }, []);

  const handleVideoProgress = useCallback((state) => {
    if (!state || typeof state.playedSeconds !== 'number' || !isFinite(state.playedSeconds)) {
      return;
    }
    
    setVideoProgress(state.played);
    setTimelinePosition(state.playedSeconds);
  }, []);

  const handleTimelineSeek = useCallback((time) => {
    if (typeof time !== 'number' || !isFinite(time) || !videoDuration) return;
    
    // Ensure time is within trim bounds
    const validTime = Math.max(trimStart, Math.min(time, trimEnd));
    setTimelinePosition(validTime);
    
    if (playerRef.current) {
      const seekPercentage = validTime / videoDuration;
      if (isFinite(seekPercentage) && seekPercentage >= 0 && seekPercentage <= 1) {
        playerRef.current.seekTo(seekPercentage);
      }
    }
  }, [videoDuration, trimStart, trimEnd]);

  const handleTrimChange = useCallback((start, end) => {
    setTrimStart(start);
    setTrimEnd(end);
  }, []);

  const handleVideoMute = useCallback(() => {
    setVideoMuted(!videoMuted);
  }, [videoMuted]);

  const handleAudioMute = useCallback(() => {
    setAudioMuted(!audioMuted);
  }, [audioMuted]);

  const handleVideoVolumeChange = useCallback((event, value) => {
    setVideoVolume(value);
  }, []);

  const handleAudioVolumeChange = useCallback((event, value) => {
    setAudioVolume(value);
  }, []);

  const handleSpeedChange = useCallback((value) => {
    setPlaybackSpeed(value);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    handleFileUpload(event);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <EditorContainer>
      <MainContent>
        {!videoUrl ? (
          <UploadState
            onUpload={handleFileUpload}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            fileInputRef={fileInputRef}
          />
        ) : (
          <>
            <VideoPreview
              videoUrl={videoUrl}
              audioUrl={audioUrl}
              playing={playing}
              onPlayPause={handlePlayPause}
              onProgress={handleVideoProgress}
              playerRef={playerRef}
              onFileUpload={handleFileUpload}
              currentTime={timelinePosition}
              videoMuted={videoMuted}
              audioMuted={audioMuted}
              videoVolume={videoVolume}
              audioVolume={audioVolume}
            />
            <TimelineContainer>
              <VideoTimeline
                videoUrl={videoUrl}
                audioUrl={audioUrl}
                currentTime={timelinePosition}
                videoDuration={videoDuration}
                audioDuration={audioDuration}
                onSeek={handleTimelineSeek}
                onDurationChange={setVideoDuration}
                onAudioOffsetChange={setAudioOffset}
                videoMuted={videoMuted}
                audioMuted={audioMuted}
                videoVolume={videoVolume}
                audioVolume={audioVolume}
                onVideoMute={handleVideoMute}
                onAudioMute={handleAudioMute}
                onVideoVolumeChange={handleVideoVolumeChange}
                onAudioVolumeChange={handleAudioVolumeChange}
                playbackSpeed={playbackSpeed}
                onSpeedChange={handleSpeedChange}
                trimStart={trimStart}
                trimEnd={trimEnd}
                onTrimChange={handleTrimChange}
                playing={playing}
                subtitles={subtitles.result.subtitles}
              />
            </TimelineContainer>
          </>
        )}
      </MainContent>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        prompt={prompt}
        onPromptChange={handlePromptChange}
        subtitles={subtitles}
        onSubtitlesChange={handleSubtitlesChange}
        onFileUpload={handleFileUpload}
        currentTime={timelinePosition}
        videoMuted={videoMuted}
        onVideoMute={handleVideoMute}
        videoVolume={videoVolume}
        onVideoVolumeChange={handleVideoVolumeChange}
        audioMuted={audioMuted}
        onAudioMute={handleAudioMute}
        audioVolume={audioVolume}
        onAudioVolumeChange={handleAudioVolumeChange}
      />
    </EditorContainer>
  );
}
