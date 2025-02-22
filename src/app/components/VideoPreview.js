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
  position: 'relative',
  width: '100%',
  height: '55vh',
  backgroundColor: '#0a1929',
  borderRadius: '8px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const PlayerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  flex: 1,
  width: '100%',
  backgroundColor: '#000',
  '& > div': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
}));

const PlayPauseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  width: '60px',
  height: '60px',
  '& svg': {
    fontSize: '2rem',
  },
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
}));

const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  transition: 'background 0.2s ease-in-out',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.3)',
    '& .play-pause-button': {
      opacity: 1,
    },
  },
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
            <ControlsOverlay>
              <PlayPauseButton 
                className="play-pause-button"
                onClick={handlePlayPause} 
                size="small"
                disabled={audioUrl && !isAudioReady}
              >
                {playing ? <PauseIcon /> : <PlayArrowIcon />}
              </PlayPauseButton>
            </ControlsOverlay>
          </PlayerContainer>
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
