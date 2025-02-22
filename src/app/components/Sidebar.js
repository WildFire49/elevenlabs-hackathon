'use client';

import { Box, Typography, TextField, List, ListItem, ListItemIcon, ListItemText, Tab, Tabs, AppBar, Toolbar, IconButton, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import TransformIcon from '@mui/icons-material/Transform';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerIcon from '@mui/icons-material/Timer';
import SummarizeIcon from '@mui/icons-material/Summarize';
import DescriptionIcon from '@mui/icons-material/Description';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import TuneIcon from '@mui/icons-material/Tune';

const SIDEBAR_WIDTH = 540;

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: SIDEBAR_WIDTH,
  backgroundColor: '#0a1929',
  borderRight: '1px solid #1e3a5f',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    background: 'radial-gradient(circle at top right, #1a365d40, transparent)',
    pointerEvents: 'none',
  }
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    fontFamily: 'var(--font-poppins)',
    color: '#fff',
    backgroundColor: '#132f4c',
    '& fieldset': { borderColor: '#1e3a5f' },
    '&:hover fieldset': { borderColor: '#2196f3' },
    '&.Mui-focused fieldset': { borderColor: '#64b5f6' },
  },
  '& label': {
    fontFamily: 'var(--font-poppins)',
    color: '#64b5f6',
  },
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  color: '#90caf9',
  '&:hover': {
    backgroundColor: 'rgba(144, 202, 249, 0.08)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.2s ease',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
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

const toolbarItems = [
  { icon: <TransformIcon />, text: 'Transform' },
  { icon: <AudiotrackIcon />, text: 'Audio' },
  { icon: <SpeedIcon />, text: 'Speed' },
  { icon: <TimerIcon />, text: 'Time' },
  { icon: <SummarizeIcon />, text: 'Summary' },
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
}) {
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
              fontWeight: 500,
            }}
          >
            <TuneIcon sx={{ fontSize: 20 }} />
            Editor Tools
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

      <Tabs
        value={activeTab}
        onChange={onTabChange}
        sx={{
          borderBottom: 1,
          borderColor: '#1e3a5f',
          '& .MuiTabs-indicator': {
            backgroundColor: '#2196f3',
          },
          mt: 1,
        }}
      >
        <StyledTab icon={tabIcons[0]} label="Prompt" />
        <StyledTab icon={tabIcons[1]} label="Subtitles" />
        <StyledTab icon={tabIcons[2]} label="Summary" />
      </Tabs>

      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        {activeTab === 0 && (
          <StyledTextField
            fullWidth
            multiline
            rows={6}
            value={prompt}
            onChange={onPromptChange}
            placeholder="Enter your prompt here..."
            variant="outlined"
          />
        )}
        {activeTab === 1 && (
          <StyledTextField
            fullWidth
            multiline
            rows={15}
            value={subtitles}
            onChange={onSubtitlesChange}
            placeholder="Generated subtitles will appear here..."
            variant="outlined"
          />
        )}
        {activeTab === 2 && (
          <Box>
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
      </Box>

      <Divider sx={{ borderColor: '#1e3a5f', my: 2 }} />

      <List sx={{ px: 2 }}>
        {toolbarItems.map((item, index) => (
          <StyledListItem key={index}>
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontFamily: 'var(--font-poppins)',
                  fontWeight: 500,
                }
              }} 
            />
          </StyledListItem>
        ))}
      </List>
    </SidebarContainer>
  );
}
