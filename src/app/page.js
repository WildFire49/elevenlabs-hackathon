'use client';

import { Box, styled } from '@mui/material';
import { useState, useRef, useEffect, useCallback } from 'react';
import VideoPreview from './components/VideoPreview';
import VideoTimeline from './components/VideoTimeline';
import Sidebar from './components/Sidebar';
import UploadState from './components/UploadState';
import LoadingState from './components/LoadingState';
import Background from './components/Background';
import { motion, AnimatePresence } from 'framer-motion';

const EditorContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  height: '100vh',
  backgroundColor: 'transparent',
  overflow: 'hidden',
  isolation: 'isolate',
}));

const MainContent = styled(motion.div)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  gap: '12px',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(19, 47, 76, 0.4)',
  borderRight: '1px solid rgba(255, 255, 255, 0.1)',
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}));

const TimelineContainer = styled(motion.div)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  position: 'relative',
  padding: '16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(10, 25, 41, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
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
  const [isLoading, setIsLoading] = useState(false);
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

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
    if (file) {
      setIsLoading(true);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setTrimStart(0);
    }
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    handleFileUpload(event);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

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

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handlePromptChange = useCallback((event) => {
    setPrompt(event.target.value);
  }, []);

  const handleSubtitlesChange = useCallback((newSubtitles) => {
    setSubtitles(newSubtitles);
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

  const handleTrimChange = useCallback((start, end) => {
    setTrimStart(start);
    setTrimEnd(end);
  }, []);

  return (
    <>
      <Background />
      <EditorContainer>
        <AnimatePresence mode="wait">
          <MainContent
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {!videoUrl ? (
              <UploadState
                onUpload={handleFileUpload}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                fileInputRef={fileInputRef}
              />
            ) : isLoading ? (
              <LoadingState onLoadingComplete={() => setIsLoading(false)} />
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
                <TimelineContainer
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
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
        </AnimatePresence>
        {!isLoading && videoUrl && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
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
          </motion.div>
        )}
      </EditorContainer>
    </>
  );
}
