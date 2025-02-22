'use client';

import { Box, Typography, TextField, Tab, Tabs, AppBar, Toolbar, IconButton, Divider, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import TransformIcon from '@mui/icons-material/Transform';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DescriptionIcon from '@mui/icons-material/Description';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import TuneIcon from '@mui/icons-material/Tune';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const SIDEBAR_WIDTH = 540;

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  height: '100%',
  backgroundColor: '#0a1929',
  borderLeft: '1px solid #1e3a5f',
  display: 'flex',
  flexDirection: 'column',
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  borderBottom: '1px solid #1e3a5f',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
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

const SubtitlesContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}));

const AudioControlsContainer = styled(Box)(({ theme }) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
}));

const VolumeControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  border: '1px solid #1e3a5f',
}));

const VolumeSlider = styled(Slider)(({ theme }) => ({
  color: '#90caf9',
  '& .MuiSlider-rail': {
    backgroundColor: '#1e3a5f',
  },
  '& .MuiSlider-track': {
    backgroundColor: '#2196f3',
  },
  '& .MuiSlider-thumb': {
    backgroundColor: '#90caf9',
    '&:hover, &.Mui-focusVisible': {
      boxShadow: '0 0 0 8px rgba(144, 202, 249, 0.16)',
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontFamily: 'var(--font-poppins)',
  color: '#64b5f6',
  '&.Mui-selected': {
    color: '#90caf9',
  },
  '&:hover': {
    color: '#bbdefb',
    backgroundColor: 'rgba(144, 202, 249, 0.08)',
  },
  transition: 'all 0.3s ease',
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  color: '#90caf9',
  '&:hover': {
    backgroundColor: 'rgba(144, 202, 249, 0.08)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.2s ease',
}));

const StyledListItem = styled('div')(({ theme }) => ({
  padding: '12px 16px',
  marginBottom: '4px',
  borderRadius: '8px',
  cursor: 'pointer',
  color: '#64b5f6',
  '&:hover': {
    backgroundColor: 'rgba(144, 202, 249, 0.08)',
    transform: 'translateX(8px)',
  },
  transition: 'all 0.3s ease',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: 4,
  color: '#90caf9',
  backgroundColor: 'rgba(25, 118, 210, 0.08)',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.16)',
    color: '#fff',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.2s ease',
}));

const MessageBubble = styled('div', {
  shouldForwardProp: (prop) => !['isEditing', 'isActive'].includes(prop)
})(({ theme, isEditing, isActive }) => ({
  backgroundColor: isActive ? '#234876' : isEditing ? '#1a3f63' : '#1e3a5f',
  borderRadius: '12px',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  transition: 'background-color 0.3s ease',
  position: 'relative',
  '&:hover .actions': {
    opacity: 1,
  }
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  color: '#64b5f6',
  fontSize: '0.75rem',
  marginBottom: theme.spacing(1),
  opacity: 0.8,
  fontFamily: 'var(--font-poppins)',
}));

const SubtitleText = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontSize: '0.9rem',
  lineHeight: 1.5,
  fontFamily: 'var(--font-poppins)',
}));

const ActionButtons = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5),
  opacity: 0,
  transition: 'opacity 0.2s ease',
}));

const ButtonList = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  padding: theme.spacing(1),
  backgroundColor: '#132f4c',
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const ButtonItem = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: '#64b5f6',
  cursor: 'pointer',
  padding: theme.spacing(0.5),
  borderRadius: '4px',
  transition: 'all 0.3s ease',
  minWidth: '60px',
  '&:hover': {
    backgroundColor: 'rgba(144, 202, 249, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

const ButtonText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#64b5f6',
  fontFamily: 'var(--font-poppins)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginTop: theme.spacing(1),
  '& .MuiOutlinedInput-root': {
    fontFamily: 'var(--font-poppins)',
    color: '#fff',
    backgroundColor: '#0a1929',
    '& fieldset': { borderColor: '#1e3a5f' },
    '&:hover fieldset': { borderColor: '#2196f3' },
    '&.Mui-focused fieldset': { borderColor: '#64b5f6' },
  },
}));

const toolbarItems = [
  { icon: <TransformIcon sx={{ fontSize: 20 }} />, text: 'Transform' },
  { icon: <AudiotrackIcon sx={{ fontSize: 20 }} />, text: 'Audio' },
  { icon: <SpeedIcon sx={{ fontSize: 20 }} />, text: 'Speed' },
  { icon: <TimerIcon sx={{ fontSize: 20 }} />, text: 'Time' },
  { icon: <SummarizeIcon sx={{ fontSize: 20 }} />, text: 'Summary' },
];

const tabIcons = {
  0: <DescriptionIcon />,
  1: <SubtitlesIcon />,
  2: <SummarizeIcon />,
};

export default function Sidebar({
  activeTab,
  onTabChange,
  prompt,
  onPromptChange,
  subtitles,
  onSubtitlesChange,
  onFileUpload,
  currentTime = 0,
  videoMuted,
  onVideoMute,
  videoVolume,
  onVideoVolumeChange,
  audioMuted,
  onAudioMute,
  audioVolume,
  onAudioVolumeChange,
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({
    start: '',
    end: '',
    text: ''
  });

  const [subtitlesList, setSubtitlesList] = useState({
    success: true,
    result: {
      subtitles: [
        {
          start: "00:00",
          end: "00:02",
          text: "This is a demo of Acceldata's new Data Plane v3 which is lightweight and best for pushdown use cases."
        },
        {
          start: "00:02",
          end: "00:03",
          text: "Navigate to the resource group tab to create a new resource group."
        },
        {
          start: "00:03",
          end: "00:06",
          text: "Now, let's go to Google Cloud and create a new VM instance. Give it a name and select a region."
        },
        {
          start: "00:06",
          end: "00:09",
          text: "Select the machine type and click create."
        }
      ]
    }
  });

  useEffect(() => {
    // Update subtitlesList when subtitles prop changes
    if (subtitles && Array.isArray(subtitles) && subtitles.length > 0) {
      setSubtitlesList({
        success: true,
        result: {
          subtitles: subtitles
        }
      });
    }
  }, [subtitles]);

  const handleEdit = (index) => {
    const subtitle = subtitlesList.result.subtitles[index];
    setEditingIndex(index);
    setEditValues({
      start: subtitle.start,
      end: subtitle.end,
      text: subtitle.text
    });
  };

  const validateTimeFormat = (time) => {
    // Basic time format validation (MM:SS)
    const timeRegex = /^([0-5]?[0-9]):([0-5][0-9])$/;
    return timeRegex.test(time);
  };

  const handleTimeChange = (e, field) => {
    const value = e.target.value;
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (index) => {
    // Validate time formats
    if (!validateTimeFormat(editValues.start) || !validateTimeFormat(editValues.end)) {
      alert('Please enter valid time in MM:SS format');
      return;
    }

    // Convert times to seconds for comparison
    const startSeconds = timeToSeconds(editValues.start);
    const endSeconds = timeToSeconds(editValues.end);

    if (startSeconds >= endSeconds) {
      alert('End time must be greater than start time');
      return;
    }

    const newSubtitles = [...subtitlesList.result.subtitles];
    newSubtitles[index] = {
      ...newSubtitles[index],
      start: editValues.start,
      end: editValues.end,
      text: editValues.text
    };
    
    setSubtitlesList({
      ...subtitlesList,
      result: { ...subtitlesList.result, subtitles: newSubtitles }
    });
    onSubtitlesChange?.(newSubtitles);
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    const newSubtitles = subtitlesList.result.subtitles.filter((_, i) => i !== index);
    setSubtitlesList({
      ...subtitlesList,
      result: { ...subtitlesList.result, subtitles: newSubtitles }
    });
    onSubtitlesChange?.(newSubtitles);
  };

  const isSubtitleActive = (subtitle) => {
    const startTime = timeToSeconds(subtitle.start);
    const endTime = timeToSeconds(subtitle.end);
    return currentTime >= startTime && currentTime <= endTime;
  };

  const timeToSeconds = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  return (
    <SidebarContainer>
      <AppBar position="static" sx={{ backgroundColor: '#0a1929', boxShadow: 'none', borderBottom: '1px solid #1e3a5f' }}>
        <Toolbar variant="dense">
          <Typography 
            variant="subtitle1" 
            sx={{ 
              flexGrow: 1, 
              color: '#90caf9',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontFamily: 'var(--font-poppins)',
              fontWeight: 700,
            }}
          >
            <TuneIcon sx={{ fontSize: 20 }} />
            Bhadvenger Tools
          </Typography>
          <ToolbarButton size="small" component="label">
            <input 
              type="file" 
              hidden 
              accept="video/*,audio/*" 
              onChange={onFileUpload}
              multiple
            />
            <AddIcon />
          </ToolbarButton>
        </Toolbar>
      </AppBar>

      <TabsContainer>
        <Tabs 
          value={activeTab} 
          onChange={onTabChange}
          variant="fullWidth"
          sx={{
            minHeight: '48px',
            '& .MuiTab-root': {
              color: '#64b5f6',
              minHeight: '48px',
              '&.Mui-selected': {
                color: '#90caf9',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#2196f3',
            },
          }}
        >
          <Tab label="Audio" />
          <Tab label="Subtitles" />
          <Tab label="Transform" />
        </Tabs>
      </TabsContainer>
      
      <ContentContainer>
        {activeTab === 0 && (
          <AudioControlsContainer>
            <VolumeControl>
              <IconButton 
                size="small" 
                onClick={onVideoMute}
                sx={{ color: videoMuted ? '#64b5f6' : '#90caf9' }}
              >
                {videoMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Typography sx={{ color: '#90caf9', minWidth: '80px' }}>
                Video Volume
              </Typography>
              <VolumeSlider
                value={videoVolume}
                onChange={onVideoVolumeChange}
                min={0}
                max={1}
                step={0.1}
                disabled={videoMuted}
              />
            </VolumeControl>

            <VolumeControl>
              <IconButton 
                size="small"
                onClick={onAudioMute}
                sx={{ color: audioMuted ? '#64b5f6' : '#90caf9' }}
              >
                {audioMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
              <Typography sx={{ color: '#90caf9', minWidth: '80px' }}>
                Audio Volume
              </Typography>
              <VolumeSlider
                value={audioVolume}
                onChange={onAudioVolumeChange}
                min={0}
                max={1}
                step={0.1}
                disabled={audioMuted}
              />
            </VolumeControl>
          </AudioControlsContainer>
        )}
        
        {activeTab === 1 && (
          <SubtitlesContainer>
            {subtitlesList.result.subtitles.map((subtitle, index) => (
              <MessageBubble 
                key={index} 
                isEditing={editingIndex === index}
                isActive={isSubtitleActive(subtitle)}
              >
                {editingIndex === index ? (
                  <>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <StyledTextField
                        label="Start Time"
                        value={editValues.start}
                        onChange={(e) => handleTimeChange(e, 'start')}
                        placeholder="MM:SS"
                        size="small"
                        sx={{ width: '100px' }}
                      />
                      <StyledTextField
                        label="End Time"
                        value={editValues.end}
                        onChange={(e) => handleTimeChange(e, 'end')}
                        placeholder="MM:SS"
                        size="small"
                        sx={{ width: '100px' }}
                      />
                    </Box>
                    <StyledTextField
                      fullWidth
                      multiline
                      value={editValues.text}
                      onChange={(e) => handleTimeChange(e, 'text')}
                      variant="outlined"
                      size="small"
                      autoFocus
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                      <StyledIconButton size="small" onClick={() => handleSave(index)}>
                        <SaveIcon fontSize="small" />
                      </StyledIconButton>
                    </Box>
                  </>
                ) : (
                  <>
                    <TimeStamp>
                      {subtitle.start} - {subtitle.end}
                    </TimeStamp>
                    <SubtitleText>{subtitle.text}</SubtitleText>
                    <ActionButtons className="actions">
                      <StyledIconButton size="small" onClick={() => handleEdit(index)}>
                        <EditIcon fontSize="small" />
                      </StyledIconButton>
                      <StyledIconButton size="small" onClick={() => handleDelete(index)}>
                        <DeleteIcon fontSize="small" />
                      </StyledIconButton>
                    </ActionButtons>
                  </>
                )}
              </MessageBubble>
            ))}
          </SubtitlesContainer>
        )}
        
        {activeTab === 2 && (
          <Box p={2}>
            <Typography variant="h6" sx={{ color: '#90caf9', mb: 2, fontFamily: 'var(--font-poppins)', fontWeight: 500 }}>
              Video Summary
            </Typography>
            <Typography variant="body2" sx={{ color: '#64b5f6', mb: 2, fontFamily: 'var(--font-poppins)' }}>
              AI-powered summary of your video content
            </Typography>
            <StyledTextField
              fullWidth
              multiline
              rows={10}
              placeholder="The video summary will appear here..."
              variant="outlined"
            />
          </Box>
        )}
      </ContentContainer>

      <Divider sx={{ borderColor: '#1e3a5f', my: 2 }} />
    </SidebarContainer>
  );
}
