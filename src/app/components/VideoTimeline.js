'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const TimelineContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#0a1929',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  position: 'relative',
  height: '100%',
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

const ScrollContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#132f4c',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#2196f3',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  },
}));

const Track = styled(Box)(({ theme }) => ({
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  border: '1px solid #1e3a5f',
  position: 'relative',
  minWidth: 'fit-content',
}));

const VideoTrack = styled(Box)(({ theme }) => ({
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  position: 'relative',
  marginLeft: '48px',
}));

const AudioTrack = styled(Box)(({ theme }) => ({
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  marginLeft: '48px',
}));

const TimeMarker = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '2px',
  height: '100%',
  backgroundColor: '#2196f3',
  zIndex: 2,
}));

const FramePreview = styled(Box)(({ theme }) => ({
  height: '100%',
  minWidth: '120px',
  backgroundColor: '#1e3a5f',
  borderRadius: '4px',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    outline: '2px solid #2196f3',
  }
}));

const WaveformCanvas = styled('canvas')({
  width: '100%',
  height: '100%',
  position: 'absolute',
});

const TimelineRuler = styled(Box)(({ theme }) => ({
  height: '24px',
  position: 'relative',
  marginLeft: '48px',
  borderBottom: '1px solid #1e3a5f',
}));

const TimelineMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '1px',
  height: '8px',
  backgroundColor: '#1e3a5f',
  bottom: 0,
  '&::after': {
    content: 'attr(data-time)',
    position: 'absolute',
    top: '-20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    color: '#64b5f6',
    fontFamily: 'var(--font-poppins)',
  }
}));

const ZoomControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: '20px',
  top: '20px',
  display: 'flex',
  gap: '8px',
  zIndex: 3,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: '#90caf9',
  backgroundColor: '#132f4c',
  '&:hover': {
    backgroundColor: '#1e3a5f',
  },
}));

async function generateThumbnails(videoUrl, numFrames = 20) {
  const video = document.createElement('video');
  video.src = videoUrl;
  
  await new Promise((resolve) => {
    video.onloadedmetadata = resolve;
  });
  
  const duration = video.duration;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 120;
  canvas.height = 80;
  
  const thumbnails = [];
  
  for (let i = 0; i < numFrames; i++) {
    const time = (duration * i) / numFrames;
    video.currentTime = time;
    
    await new Promise((resolve) => {
      video.onseeked = async () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.push({
          time,
          dataUrl: canvas.toDataURL('image/jpeg', 0.7)
        });
        resolve();
      };
    });
  }
  
  return thumbnails;
}

async function generateWaveform(audioUrl, canvas, width, height) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / width);
  const amp = height / 2;
  
  ctx.fillStyle = '#132f4c';
  ctx.fillRect(0, 0, width, height);
  
  ctx.beginPath();
  ctx.moveTo(0, amp);
  
  ctx.strokeStyle = '#2196f3';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < width; i++) {
    let min = 1.0;
    let max = -1.0;
    
    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    
    ctx.lineTo(i, (1 + min) * amp);
  }
  
  for (let i = width - 1; i >= 0; i--) {
    let min = 1.0;
    let max = -1.0;
    
    for (let j = 0; j < step; j++) {
      const datum = data[(i * step) + j];
      if (datum < min) min = datum;
      if (datum > max) max = datum;
    }
    
    ctx.lineTo(i, (1 + max) * amp);
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
  ctx.fill();
}

export default function VideoTimeline({
  videoUrl,
  audioUrl,
  currentTime,
  videoDuration,
  audioDuration,
  onSeek,
  onDurationChange,
  onExport,
}) {
  const [thumbnails, setThumbnails] = useState([]);
  const trackRef = useRef(null);
  const waveformRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth - 48);
    }
  }, [videoUrl, audioUrl]);

  useEffect(() => {
    if (videoUrl) {
      generateThumbnails(videoUrl).then(setThumbnails);
    }
  }, [videoUrl]);

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      generateWaveform(audioUrl, waveformRef.current, trackWidth, 60);
    }
  }, [audioUrl, trackWidth]);

  const formatTime = (seconds) => {
    const pad = (num) => (`0${Math.floor(num)}`).slice(-2);
    const minutes = seconds / 60;
    return `${pad(minutes)}:${pad(seconds % 60)}`;
  };

  const handleTrackClick = (e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 48;
    const percentage = x / trackWidth;
    const time = percentage * videoDuration;
    onSeek(Math.max(0, Math.min(time, videoDuration)));
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      // Update time marker position based on scroll
      const percentage = scrollLeft / (trackWidth * zoom);
      // You might want to update some state here
    }
  };

  return (
    <TimelineContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: '#fff',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontFamily: 'var(--font-poppins)',
          }}
        >
          <MovieIcon sx={{ color: '#2196f3' }} />
          Timeline
        </Typography>
        <ZoomControls>
          <StyledIconButton onClick={handleZoomOut} size="small">
            <ZoomOutIcon />
          </StyledIconButton>
          <StyledIconButton onClick={handleZoomIn} size="small">
            <ZoomInIcon />
          </StyledIconButton>
        </ZoomControls>
      </Box>

      <ScrollContainer ref={scrollContainerRef} onScroll={handleScroll}>
        <TimelineRuler style={{ width: `${trackWidth * zoom}px` }}>
          {[...Array(Math.ceil(videoDuration))].map((_, i) => (
            <TimelineMarker
              key={i}
              data-time={formatTime(i)}
              sx={{
                left: `${(i / videoDuration) * 100}%`,
                height: i % 5 === 0 ? '12px' : '8px',
              }}
            />
          ))}
        </TimelineRuler>

        <Track ref={trackRef} onClick={handleTrackClick} style={{ width: `${trackWidth * zoom}px` }}>
          <VideoTrack>
            <MovieIcon sx={{ color: '#64b5f6', position: 'absolute', left: '-36px' }} />
            {thumbnails.map((thumb, index) => (
              <FramePreview
                key={index}
                sx={{
                  backgroundImage: `url(${thumb.dataUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: `${(trackWidth * zoom) / thumbnails.length}px`,
                }}
              />
            ))}
            <TimeMarker 
              style={{ 
                left: `${(currentTime / videoDuration) * trackWidth * zoom + 48}px` 
              }} 
            />
          </VideoTrack>

          {audioUrl && (
            <AudioTrack>
              <AudiotrackIcon sx={{ color: '#64b5f6', position: 'absolute', left: '-36px' }} />
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <WaveformCanvas ref={waveformRef} style={{ width: `${trackWidth * zoom}px` }} />
              </Box>
            </AudioTrack>
          )}
        </Track>
      </ScrollContainer>
    </TimelineContainer>
  );
}
