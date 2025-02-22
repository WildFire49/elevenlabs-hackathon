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
import { Tooltip } from '@mui/material';
import AudioWaveform from './AudioWaveform';

const TimelineContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  height: '100%',
  overflow: 'hidden',
}));

const VideoTrackContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  padding: '12px',
  border: '1px solid #1e3a5f',
}));

const AudioSegmentsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '12px',
  backgroundColor: '#0a1929',
  borderRadius: '8px',
  border: '1px solid #1e3a5f',
  overflow: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
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

const TimelineControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  padding: '12px',
  border: '1px solid #1e3a5f',
}));

const VideoFramesContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '64px',
  backgroundColor: '#0a1929',
  borderRadius: '4px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'stretch',
}));

const VideoFrame = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: '80px',
  height: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRight: '1px solid #1e3a5f',
  '&:last-child': {
    borderRight: 'none',
  },
}));

const TimeMarkerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '24px',
  backgroundColor: '#0a1929',
  borderBottom: '1px solid #1e3a5f',
  marginBottom: '4px',
}));

const TimeMarker = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '1px',
  height: '8px',
  backgroundColor: '#1e3a5f',
  bottom: 0,
  transform: 'translateX(-50%)',
  '&::after': {
    content: 'attr(data-time)',
    position: 'absolute',
    top: '-16px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#64b5f6',
    fontSize: '10px',
    whiteSpace: 'nowrap',
    fontFamily: 'monospace',
  },
}));

const TimelineTrack = styled(Box)(({ theme }) => ({
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    '& .timeline-cursor': {
      backgroundColor: '#64b5f6',
    },
  },
}));

const TimelineCursor = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  width: '2px',
  height: '100%',
  backgroundColor: '#2196f3',
  zIndex: 2,
  pointerEvents: 'none',
  '&::after': {
    content: 'attr(data-time)',
    position: 'absolute',
    top: '4px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#90caf9',
    fontSize: '10px',
    whiteSpace: 'nowrap',
    fontFamily: 'monospace',
    backgroundColor: '#0a1929',
    padding: '2px 4px',
    borderRadius: '4px',
    border: '1px solid #1e3a5f',
  },
}));

const TimelineContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  minWidth: '100%',
  height: '100%',
}));

const TimelineScroll = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflowX: 'auto',
  overflowY: 'hidden',
  '&::-webkit-scrollbar': {
    height: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#0a1929',
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

const generateThumbnails = async (videoUrl, numThumbnails = 10) => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', () => {
      const thumbnails = [];
      const interval = video.duration / numThumbnails;
      let processed = 0;

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 160;
      canvas.height = 90;

      const captureFrame = (time) => {
        video.currentTime = time;
      };

      video.addEventListener('seeked', () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.push({
          time: video.currentTime,
          dataUrl: canvas.toDataURL('image/jpeg', 0.5),
        });

        processed++;
        if (processed < numThumbnails) {
          captureFrame(interval * processed);
        } else {
          resolve(thumbnails);
        }
      });

      captureFrame(0);
    });

    video.load();
  });
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
  playing,
  subtitles = [],
}) {
  const [activeAudioIndex, setActiveAudioIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const trackRef = useRef(null);
  const scrollRef = useRef(null);
  const [thumbnails, setThumbnails] = useState([]);

  useEffect(() => {
    if (videoUrl) {
      generateThumbnails(videoUrl).then(setThumbnails);
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!currentTime || !subtitles.length) return;

    const activeIndex = subtitles.findIndex(subtitle => {
      const start = timeToSeconds(subtitle.start);
      const end = timeToSeconds(subtitle.end);
      return currentTime >= start && currentTime < end;
    });

    setActiveAudioIndex(activeIndex);
  }, [currentTime, subtitles]);

  useEffect(() => {
    if (!currentTime || !videoDuration || !scrollRef.current) return;

    const scrollWidth = scrollRef.current.scrollWidth;
    const clientWidth = scrollRef.current.clientWidth;
    const scrollPosition = (currentTime / videoDuration) * scrollWidth;

    // Only auto-scroll if the current position is out of view
    if (scrollPosition < scrollRef.current.scrollLeft || 
        scrollPosition > scrollRef.current.scrollLeft + clientWidth) {
      scrollRef.current.scrollLeft = scrollPosition - (clientWidth / 2);
    }
  }, [currentTime, videoDuration]);

  const timeToSeconds = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (seconds) => {
    if (!seconds || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (event) => {
    if (!videoDuration || !scrollRef.current) return;
    
    const rect = scrollRef.current.getBoundingClientRect();
    const scrollLeft = scrollRef.current.scrollLeft;
    const x = event.clientX - rect.left + scrollLeft;
    const totalWidth = scrollRef.current.scrollWidth;
    const clickedTime = (x / totalWidth) * videoDuration;
    onSeek?.(clickedTime);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 1));
  };

  const generateTimeMarkers = () => {
    if (!videoDuration) return [];
    
    const markers = [];
    const interval = Math.max(Math.floor(videoDuration / 10), 1); // Show at least 10 markers
    
    for (let time = 0; time <= videoDuration; time += interval) {
      markers.push({
        time,
        position: (time / videoDuration) * 100,
      });
    }
    
    return markers;
  };

  return (
    <TimelineContainer>
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        p: 2, 
        backgroundColor: '#132f4c',
        borderRadius: '8px',
        border: '1px solid #1e3a5f',
      }}>
        <Typography variant="subtitle1" sx={{ color: '#90caf9', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MovieIcon /> Video Timeline
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} sx={{ color: '#90caf9' }}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} sx={{ color: '#90caf9' }}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <TimelineScroll ref={scrollRef}>
        <TimelineTrack
          ref={trackRef}
          onClick={handleTrackClick}
          sx={{
            width: `${100 * zoomLevel}%`,
            minWidth: '100%',
          }}
        >
          <TimelineContent>
            <TimeMarkerContainer>
              {generateTimeMarkers().map((marker, index) => (
                <TimeMarker
                  key={index}
                  data-time={formatTime(marker.time)}
                  sx={{
                    left: `${marker.position}%`,
                    height: index % 2 === 0 ? '12px' : '8px',
                  }}
                />
              ))}
            </TimeMarkerContainer>
            <VideoFramesContainer>
              {thumbnails.map((thumb, index) => (
                <VideoFrame
                  key={index}
                  style={{
                    backgroundImage: `url(${thumb.dataUrl})`,
                    width: `${100 / thumbnails.length}%`,
                  }}
                />
              ))}
            </VideoFramesContainer>
          </TimelineContent>
          <TimelineCursor
            className="timeline-cursor"
            data-time={formatTime(currentTime)}
            style={{
              left: `${(currentTime / videoDuration) * 100}%`,
            }}
          />
        </TimelineTrack>
      </TimelineScroll>
      <Typography sx={{ color: '#64b5f6', mt: 1, fontSize: '0.875rem' }}>
        {formatTime(currentTime)} / {formatTime(videoDuration)}
      </Typography>
      <AudioSegmentsContainer>
        {subtitles.map((subtitle, index) => (
          <AudioWaveform
            key={index}
            audioUrl={subtitle.audio}
            playing={playing && activeAudioIndex === index}
            onPlayPause={(isPlaying) => onSeek?.(timeToSeconds(subtitle.start))}
            currentTime={currentTime}
            startTime={timeToSeconds(subtitle.start)}
            endTime={timeToSeconds(subtitle.end)}
            isActive={activeAudioIndex === index}
            text={subtitle.text}
          />
        ))}
      </AudioSegmentsContainer>
      <TimelineControls>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={onVideoMute} sx={{ color: '#90caf9' }}>
              {videoMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={videoVolume}
              onChange={onVideoVolumeChange}
              min={0}
              max={1}
              step={0.1}
              sx={{
                width: 100,
                color: '#2196f3',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: '#90caf9',
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon sx={{ color: '#90caf9' }} />
            <Slider
              value={playbackSpeed}
              onChange={(e, value) => onSpeedChange(value)}
              min={0.5}
              max={2}
              step={0.1}
              sx={{
                width: 100,
                color: '#2196f3',
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: '#90caf9',
                },
              }}
            />
            <Typography sx={{ color: '#90caf9', minWidth: 40 }}>
              {playbackSpeed}x
            </Typography>
          </Box>
        </Box>
      </TimelineControls>
    </TimelineContainer>
  );
}
