'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import WaveSurfer from 'wavesurfer.js';

const WaveformContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#1a365d',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '12px',
  border: '1px solid #1e3a5f',
  '&:hover': {
    backgroundColor: '#1e4976',
  },
}));

const WaveformBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '64px',
  backgroundColor: '#0a1929',
  borderRadius: '4px',
  overflow: 'hidden',
  cursor: 'pointer',
}));

const TimeDisplay = styled(Typography)(({ theme }) => ({
  color: '#90caf9',
  fontSize: '0.75rem',
  fontFamily: 'monospace',
}));

const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function AudioWaveform({
  audioUrl,
  playing,
  onPlayPause,
  currentTime,
  startTime,
  endTime,
  isActive,
  text,
}) {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [localPlaying, setLocalPlaying] = useState(false);

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) return;

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#64b5f6',
      progressColor: '#2196f3',
      cursorColor: '#90caf9',
      barWidth: 2,
      barRadius: 3,
      barGap: 2,
      height: 64,
      normalize: true,
      responsive: true,
      fillParent: true,
      minPxPerSec: 50,
    });

    wavesurfer.load(audioUrl);
    
    wavesurfer.on('ready', () => {
      setIsReady(true);
      wavesurferRef.current = wavesurfer;
    });

    wavesurfer.on('finish', () => {
      setLocalPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  useEffect(() => {
    if (!wavesurferRef.current || !isReady) return;

    if (playing && !localPlaying) {
      wavesurferRef.current.play();
      setLocalPlaying(true);
    } else if (!playing && localPlaying) {
      wavesurferRef.current.pause();
      setLocalPlaying(false);
    }
  }, [playing, localPlaying, isReady]);

  useEffect(() => {
    if (!wavesurferRef.current || !isReady || !currentTime) return;

    const progress = (currentTime - startTime) / (endTime - startTime);
    if (progress >= 0 && progress <= 1) {
      wavesurferRef.current.seekTo(progress);
    }
  }, [currentTime, startTime, endTime, isReady]);

  const handlePlayPause = () => {
    if (!isReady) return;
    onPlayPause(!localPlaying);
  };

  return (
    <WaveformContainer
      sx={{
        borderColor: isActive ? '#2196f3' : '#1e3a5f',
        boxShadow: isActive ? '0 0 0 1px #2196f3' : 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton
          size="small"
          onClick={handlePlayPause}
          sx={{ color: '#90caf9', mr: 1 }}
        >
          {localPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Typography
          sx={{
            color: '#90caf9',
            fontSize: '0.875rem',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TimeDisplay>{formatTime(startTime)}</TimeDisplay>
          <TimeDisplay>{formatTime(endTime)}</TimeDisplay>
        </Box>
      </Box>
      <WaveformBox ref={waveformRef} />
    </WaveformContainer>
  );
}
