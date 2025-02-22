'use client';

import { Box, Typography, IconButton, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { useState, useRef, useEffect, useCallback } from 'react';

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

export default function VideoPreview({ 
  videoUrl, 
  audioUrl,
  playing,
  onPlayPause,
  onProgress,
  playerRef,
  onFileUpload,
  currentTime,
  videoMuted,
  audioMuted,
  videoVolume,
  audioVolume 
}) {
  const audioRef = useRef(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.preload = 'auto';
    
    audio.addEventListener('canplaythrough', () => {
      setIsAudioReady(true);
    });

    audio.addEventListener('ended', () => {
      onPlayPause?.(false);
    });

    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('canplaythrough', () => setIsAudioReady(true));
        audioRef.current.removeEventListener('ended', () => onPlayPause?.(false));
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl, onPlayPause]);

  // Handle play/pause and seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isFinite(currentTime) || currentTime < 0) return;

    // Update time if needed
    const timeDiff = Math.abs(audio.currentTime - currentTime);
    if (timeDiff > 0.1) {
      audio.currentTime = currentTime;
    }

    // Handle play/pause
    if (playing) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Audio playback error:', error);
          onPlayPause?.(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [playing, currentTime, onPlayPause]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioMuted ? 0 : audioVolume;
    }
  }, [audioVolume, audioMuted]);

  const handlePlayPause = useCallback(() => {
    onPlayPause?.(!playing);
  }, [playing, onPlayPause]);

  const handleProgress = useCallback((state) => {
    if (!state?.playedSeconds || !isFinite(state.playedSeconds)) return;
    onProgress?.(state);
  }, [onProgress]);

  const handleVideoEnded = useCallback(() => {
    onPlayPause?.(false);
  }, [onPlayPause]);

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
              muted={videoMuted}
              volume={videoVolume}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              onError={(error) => {
                console.error('Video playback error:', error);
                onPlayPause?.(false);
              }}
            />
          </PlayerContainer>
          <Controls>
            <StyledIconButton 
              onClick={handlePlayPause} 
              size="small"
              disabled={audioUrl && !isAudioReady}
            >
              {playing ? <PauseIcon /> : <PlayArrowIcon />}
            </StyledIconButton>
          </Controls>
        </>
      ) : (
        <UploadZone
          component="label"
          elevation={0}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            onFileUpload({ target: { files } });
          }}
          onDragOver={(e) => e.preventDefault()}
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
              Upload Media
            </Typography>
            <Typography variant="body2" sx={{ color: '#90caf9', fontFamily: 'var(--font-poppins)' }}>
              Drag and Drop your Video or audio files, or Click to Browse
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
