'use client';

import { Box, Typography, IconButton, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SpeedIcon from '@mui/icons-material/Speed';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import { Tooltip } from '@mui/material';

const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#1a2035',
  borderRadius: '12px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  overflow: 'hidden',
}));

const ScrollContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  overflowY: 'hidden',
  width: '100%',
  position: 'relative',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#0a1929',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#2196f3',
    borderRadius: '4px',
    '&:hover': {
      background: '#1976d2',
    },
  },
}));

const TimelineContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  minWidth: '100%',
  display: 'inline-block',
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
  position: 'relative',
  height: '80px',
  backgroundColor: '#0a1929',
  borderRadius: '8px',
  overflow: 'hidden',
  display: 'flex',
}));

const AudioTrackContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 60,
  backgroundColor: '#1e3a5f',
  borderRadius: 4,
  marginTop: theme.spacing(1),
  overflow: 'hidden',
}));

const AudioTrack = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  height: '100%',
  backgroundColor: '#2196f3',
  opacity: 0.3,
  cursor: 'grab',
  '&:hover': {
    opacity: 0.4,
  },
  '&:active': {
    cursor: 'grabbing',
  },
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
  height: '40px',
  backgroundColor: 'transparent',
});

const AudioLabel = styled(Typography)({
  position: 'absolute',
  left: '-120px',
  color: '#64b5f6',
  width: '100px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '12px',
  textAlign: 'right',
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

const VolumeControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 120,
}));

const CurrentTimeIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '2px',
  height: '100%',
  backgroundColor: '#2196f3',
  zIndex: 2,
  pointerEvents: 'none',
}));

const TrimHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '8px',
  height: '100%',
  backgroundColor: '#ffd700',
  cursor: 'ew-resize',
  zIndex: 4,
  '&:hover': {
    backgroundColor: '#ffed4a',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '16px',
    height: '40px',
    backgroundColor: 'inherit',
    borderRadius: '4px',
  }
}));

const Controls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '8px 16px',
  backgroundColor: '#0a1929',
  borderRadius: '8px',
  marginLeft: 'auto',
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

const drawWaveform = async (audioUrl, canvas) => {
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const data = audioBuffer.getChannelData(0);
  const step = Math.ceil(data.length / canvas.width);
  const amp = canvas.height / 2;
  
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
  context.moveTo(0, amp);
  
  context.strokeStyle = '#64b5f6';
  context.lineWidth = 1;
  
  for (let i = 0; i < canvas.width; i++) {
    const min = Math.min(...data.slice(i * step, (i + 1) * step));
    const max = Math.max(...data.slice(i * step, (i + 1) * step));
    context.lineTo(i, amp + max * amp);
  }
  
  for (let i = canvas.width - 1; i >= 0; i--) {
    const min = Math.min(...data.slice(i * step, (i + 1) * step));
    const max = Math.max(...data.slice(i * step, (i + 1) * step));
    context.lineTo(i, amp + min * amp);
  }
  
  context.closePath();
  context.stroke();
  context.fillStyle = 'rgba(33, 150, 243, 0.3)';
  context.fill();
};

export default function VideoTimeline({
  videoUrl,
  audioUrl,
  currentTime,
  videoDuration,
  audioDuration,
  onSeek,
  onDurationChange,
  onAudioOffsetChange,
  videoMuted,
  audioMuted,
  videoVolume,
  audioVolume,
  onVideoMute,
  onAudioMute,
  onVideoVolumeChange,
  onAudioVolumeChange,
  playbackSpeed,
  onSpeedChange,
  trimStart,
  trimEnd,
  onTrimChange,
  audioFileName,
}) {
  const [thumbnails, setThumbnails] = useState([]);
  const trackRef = useRef(null);
  const waveformRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef(null);
  const audioOffset = useRef(0);
  const [isDraggingTrim, setIsDraggingTrim] = useState(false);
  const [activeTrimHandle, setActiveTrimHandle] = useState(null);
  const trimStartRef = useRef(null);
  const trimEndRef = useRef(null);
  const [audioLength, setAudioLength] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);

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
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setAudioLength(audio.duration);
      });
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      drawWaveform(audioUrl, waveformRef.current);
    }
  }, [audioUrl, trackWidth]);

  const formatTime = (seconds) => {
    const pad = (num) => (`0${Math.floor(num)}`).slice(-2);
    const minutes = seconds / 60;
    return `${pad(minutes)}:${pad(seconds % 60)}`;
  };

  const handleTrackClick = (event) => {
    if (!videoDuration) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * videoDuration;
    
    // Ensure time is a valid, finite number and within bounds
    if (typeof time === 'number' && isFinite(time) && time >= 0 && time <= videoDuration) {
      onSeek?.(time);
    }
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

  const handleAudioDragStart = () => {
    // setIsDragging(true);
  };

  const handleAudioDrag = (event, info) => {
    const newPosition = audioOffset.current + info.delta.x;
    const maxOffset = trackWidth * zoom - (audioLength / videoDuration) * trackWidth * zoom;
    audioOffset.current = Math.max(0, Math.min(newPosition, maxOffset));
    
    // Convert pixel offset to time position
    const timePosition = (audioOffset.current / (trackWidth * zoom)) * videoDuration;
    setAudioPosition(timePosition);
    onAudioOffsetChange?.(timePosition);
  };

  const handleAudioDragEnd = () => {
    // setIsDragging(false);
  };

  const handleTrimMouseDown = (handle) => (event) => {
    setIsDraggingTrim(true);
    setActiveTrimHandle(handle);
    document.addEventListener('mousemove', handleTrimMouseMove);
    document.addEventListener('mouseup', handleTrimMouseUp);
  };

  const handleTrimMouseMove = (event) => {
    if (!isDraggingTrim || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const time = percentage * videoDuration;

    if (activeTrimHandle === 'start') {
      if (time < trimEnd) {
        onTrimChange(time, trimEnd);
      }
    } else if (activeTrimHandle === 'end') {
      if (time > trimStart) {
        onTrimChange(trimStart, time);
      }
    }
  };

  const handleTrimMouseUp = () => {
    setIsDraggingTrim(false);
    setActiveTrimHandle(null);
    document.removeEventListener('mousemove', handleTrimMouseMove);
    document.removeEventListener('mouseup', handleTrimMouseUp);
  };

  const currentTimePercentage = (currentTime / videoDuration) * 100;
  const audioWidthPercentage = (audioDuration / videoDuration) * 100;

  return (
    <TimelineContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 5 }}>
        <Typography variant="subtitle1" sx={{ 
          color: '#fff', 
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 2,
          fontFamily: 'var(--font-poppins)',
        }}>
          <MovieIcon sx={{ color: '#2196f3' }} />
          Timeline
          <Box sx={{ display: 'flex', gap: 5 }}>
            {/* Video Volume Control */}
            <VolumeControl>
              <IconButton onClick={onVideoMute} size="small" sx={{ color: '#fff' }}>
                {videoMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MovieIcon sx={{ fontSize: 16, color: '#64b5f6', mr: 1 }} />
                <Slider
                  size="small"
                  value={videoVolume}
                  onChange={onVideoVolumeChange}
                  min={0}
                  max={1}
                  step={0.1}
                  sx={{
                    color: '#2196f3',
                    width: 60,
                    '& .MuiSlider-thumb': {
                      width: 12,
                      height: 12,
                    },
                  }}
                />
              </Box>
            </VolumeControl>

            {/* Audio Volume Control */}
            {audioUrl && (
              <VolumeControl>
                <IconButton onClick={onAudioMute} size="small" sx={{ color: '#fff' }}>
                  {audioMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AudiotrackIcon sx={{ fontSize: 16, color: '#64b5f6', mr: 1 }} />
                  <Slider
                    size="small"
                    value={audioVolume}
                    onChange={onAudioVolumeChange}
                    min={0}
                    max={1}
                    step={0.1}
                    sx={{
                      color: '#2196f3',
                      width: 60,
                      '& .MuiSlider-thumb': {
                        width: 12,
                        height: 12,
                      },
                    }}
                  />
                </Box>
              </VolumeControl>
            )}
          </Box>
        </Typography>

        <Controls>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
            <Tooltip title="Playback Speed">
              <SpeedIcon sx={{ color: '#64b5f6' }} />
            </Tooltip>
            <Slider
              size="small"
              value={playbackSpeed}
              onChange={(_, value) => onSpeedChange(value)}
              min={0.25}
              max={2}
              step={0.25}
              marks
              valueLabelDisplay="auto"
              valueLabelFormat={x => `${x}x`}
              sx={{
                color: '#2196f3',
                '& .MuiSlider-mark': {
                  backgroundColor: '#64b5f6',
                },
              }}
            />
          </Box>
          <ZoomControls>
            <Tooltip title="Zoom Out">
              <StyledIconButton onClick={handleZoomOut} size="small">
                <ZoomOutIcon />
              </StyledIconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
              <StyledIconButton onClick={handleZoomIn} size="small">
                <ZoomInIcon />
              </StyledIconButton>
            </Tooltip>
          </ZoomControls>
        </Controls>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Typography variant="caption" sx={{ color: '#64b5f6', position: 'absolute', left: 0, top: -20 }}>
          {formatTime(currentTime)}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64b5f6', position: 'absolute', right: 0, top: -20 }}>
          {formatTime(videoDuration)}
        </Typography>

        <ScrollContainer ref={scrollContainerRef}>
          <TimelineContent>
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
              {/* Trim Handles */}
              <TrimHandle
                ref={trimStartRef}
                onMouseDown={handleTrimMouseDown('start')}
                style={{
                  left: `${(trimStart / videoDuration) * 100}%`,
                  opacity: isDraggingTrim && activeTrimHandle === 'start' ? 0.8 : 1
                }}
              />
              <TrimHandle
                ref={trimEndRef}
                onMouseDown={handleTrimMouseDown('end')}
                style={{
                  left: `${(trimEnd / videoDuration) * 100}%`,
                  opacity: isDraggingTrim && activeTrimHandle === 'end' ? 0.8 : 1
                }}
              />

              {/* Time Marker */}
              <TimeMarker 
                style={{ 
                  left: `${(currentTime / videoDuration) * 100}%`,
                  transform: 'translateX(-50%)',
                  transition: isDraggingTrim ? 'none' : 'left 0.1s linear'
                }} 
              />

              {/* Video Track */}
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
              </VideoTrack>

              {/* Audio Track */}
              {audioUrl && (
                <AudioTrackContainer>
                  <AudioLabel>
                    {audioFileName || 'Audio Track'}
                  </AudioLabel>
                  <AudioTrack
                    drag="x"
                    dragConstraints={scrollContainerRef}
                    dragElastic={0}
                    onDragStart={handleAudioDragStart}
                    onDrag={handleAudioDrag}
                    onDragEnd={handleAudioDragEnd}
                    style={{ 
                      width: `${(audioLength / videoDuration) * trackWidth * zoom}px`,
                      x: audioOffset.current
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', pl: 2, pr: 2 }}>
                      <WaveformCanvas ref={waveformRef} />
                    </Box>
                  </AudioTrack>
                </AudioTrackContainer>
              )}
            </Track>
          </TimelineContent>
        </ScrollContainer>
      </Box>
    </TimelineContainer>
  );
}
