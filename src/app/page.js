'use client';

import { Box, styled } from '@mui/material';
import { useState, useRef } from 'react';
import VideoPreview from './components/VideoPreview';
import VideoTimeline from './components/VideoTimeline';
import Sidebar from './components/Sidebar';

const EditorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: '#0a1929',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  gap: '20px',
  overflow: 'hidden',
}));

export default function VideoEditor() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [subtitles, setSubtitles] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const playerRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        setVideoUrl(URL.createObjectURL(file));
      } else if (file.type.startsWith('audio/')) {
        setAudioUrl(URL.createObjectURL(file));
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleSubtitlesChange = (event) => {
    setSubtitles(event.target.value);
  };

  const handleVideoProgress = (state) => {
    setVideoProgress(state.played);
    setTimelinePosition(state.playedSeconds);
  };

  const handleTimelineSeek = (time) => {
    setTimelinePosition(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time / videoDuration);
    }
  };

  const handleDurationChange = (duration, type) => {
    if (type === 'video') {
      setVideoDuration(duration);
    } else {
      setAudioDuration(duration);
    }
  };

  return (
    <EditorContainer>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        prompt={prompt}
        onPromptChange={handlePromptChange}
        subtitles={subtitles}
        onSubtitlesChange={handleSubtitlesChange}
        onFileUpload={handleFileUpload}
      />
      <MainContent>
        <VideoPreview
          videoUrl={videoUrl}
          playing={playing}
          onProgress={handleVideoProgress}
          playerRef={playerRef}
          onFileUpload={handleFileUpload}
        />
        <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <VideoTimeline
            videoUrl={videoUrl}
            audioUrl={audioUrl}
            currentTime={timelinePosition}
            videoDuration={videoDuration}
            audioDuration={audioDuration}
            onSeek={handleTimelineSeek}
            onDurationChange={handleDurationChange}
          />
        </Box>
      </MainContent>
    </EditorContainer>
  );
}
