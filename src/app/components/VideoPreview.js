'use client';

import { Box, Typography, IconButton, Paper, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useState, useRef } from 'react';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const PreviewContainer = styled(motion.div)(({ theme }) => ({
  flex: 1,
  backgroundColor: '#0a1929',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '20px',
  minHeight: '50vh',
  borderRadius: '12px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: 'radial-gradient(circle at top right, #1a365d40, transparent)',
    pointerEvents: 'none',
    borderRadius: '12px',
  }
}));

const UploadZone = styled(Paper)(({ theme }) => ({
  backgroundColor: '#132f4c',
  border: '2px dashed #2196f3',
  borderRadius: '12px',
  padding: '40px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#1a365d',
    borderColor: '#90caf9',
    transform: 'scale(1.02)',
  }
}));

const PlayerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '16/9',
  width: '100%',
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid #1e3a5f',
}));

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px',
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  border: '1px solid #1e3a5f',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: '#90caf9',
  '&:hover': {
    backgroundColor: 'rgba(144, 202, 249, 0.08)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.2s ease',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: '#2196f3',
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    backgroundColor: '#90caf9',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: '0 0 0 8px rgba(144, 202, 249, 0.16)',
    },
  },
  '& .MuiSlider-rail': {
    backgroundColor: '#1e3a5f',
  },
}));

const TimeDisplay = styled(Typography)(({ theme }) => ({
  color: '#90caf9',
  fontSize: '0.875rem',
  minWidth: '60px',
  fontFamily: 'var(--font-poppins)',
}));

export default function VideoPreview({ videoUrl, onFileUpload }) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const playerRef = useRef(null);

  const handlePlayPause = () => setPlaying(!playing);
  const handleMute = () => setMuted(!muted);
  
  const handleProgress = (state) => {
    if (!seeking) {
      setProgress(state.played);
    }
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (_, value) => {
    setProgress(value);
  };

  const handleSeekMouseUp = (_, value) => {
    setSeeking(false);
    playerRef.current?.seekTo(value);
  };

  const formatTime = (seconds) => {
    const pad = (num) => (`0${Math.floor(num)}`).slice(-2);
    const minutes = seconds / 60;
    const hours = minutes / 60;
    
    if (hours >= 1) {
      return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
    }
    return `${pad(minutes)}:${pad(seconds % 60)}`;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFileUpload({ target: { files } });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <PreviewContainer
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          color: '#fff',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontFamily: 'var(--font-poppins)',
        }}
      >
        <MovieIcon sx={{ color: '#2196f3' }} />
        Video Preview
      </Typography>

      {videoUrl ? (
        <>
          <PlayerContainer>
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              playing={playing}
              muted={muted}
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          </PlayerContainer>
          <Controls>
            <StyledIconButton onClick={handlePlayPause} size="small">
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </StyledIconButton>
            <StyledIconButton onClick={handleMute} size="small">
              {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </StyledIconButton>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <TimeDisplay>
                {formatTime(progress * duration)}
              </TimeDisplay>
              <StyledSlider
                value={progress}
                onMouseDown={handleSeekMouseDown}
                onChange={handleSeekChange}
                onChangeCommitted={handleSeekMouseUp}
                step={0.001}
                min={0}
                max={1}
              />
              <TimeDisplay>
                {formatTime(duration)}
              </TimeDisplay>
            </Box>
          </Controls>
        </>
      ) : (
        <UploadZone
          component="label"
          elevation={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            hidden
            accept="video/*,audio/*"
            onChange={onFileUpload}
            multiple
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: '#2196f3' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500, mb: 1, fontFamily: 'var(--font-poppins)' }}>
              Drop your media here 🎥 🎵
            </Typography>
            <Typography variant="body2" sx={{ color: '#90caf9', fontFamily: 'var(--font-poppins)' }}>
              Drag and drop your video or audio files, or click to browse
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64b5f6' }}>
              <MovieIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontFamily: 'var(--font-poppins)' }}>Video files</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64b5f6' }}>
              <AudiotrackIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontFamily: 'var(--font-poppins)' }}>Audio files</Typography>
            </Box>
          </Box>
        </UploadZone>
      )}
    </PreviewContainer>
  );
}
