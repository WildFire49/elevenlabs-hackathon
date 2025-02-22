'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MovieIcon from '@mui/icons-material/Movie';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import SubtitlesIcon from '@mui/icons-material/Subtitles';

const Container = styled(motion.div)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '32px',
  padding: '48px',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'radial-gradient(circle at top right, #1a365d40, transparent)',
    pointerEvents: 'none',
  },
}));

const UploadZone = styled(motion.div)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  aspectRatio: '16/9',
  backgroundColor: '#0a1929',
  border: '2px dashed #1e3a5f',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
  cursor: 'pointer',
  padding: '32px',
  position: 'relative',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: '#0d2137',
    borderColor: '#2196f3',
    transform: 'scale(1.02)',
    '& .upload-icon': {
      transform: 'scale(1.1)',
      color: '#2196f3',
    },
  },
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  width: '100%',
  maxWidth: '800px',
}));

const FeatureCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: '#132f4c',
  borderRadius: '12px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  textAlign: 'center',
  border: '1px solid #1e3a5f',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: '#1a365d',
    transform: 'translateY(-4px)',
    '& .feature-icon': {
      color: '#2196f3',
    },
  },
}));

const features = [
  {
    icon: <MovieIcon sx={{ fontSize: 32 }} />,
    title: 'Video Upload',
    description: 'Upload your video files with ease. Supports multiple formats.',
  },
  {
    icon: <AudiotrackIcon sx={{ fontSize: 32 }} />,
    title: 'Audio Processing',
    description: 'Advanced audio processing with background music support.',
  },
  {
    icon: <SubtitlesIcon sx={{ fontSize: 32 }} />,
    title: 'Smart Subtitles',
    description: 'Automatically generate and edit subtitles for your videos.',
  },
];

export default function UploadState({ onUpload, onDrop, onDragOver, fileInputRef }) {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Typography 
        variant="h3" 
        sx={{ 
          color: '#90caf9',
          fontWeight: 600,
          textAlign: 'center',
          fontFamily: 'var(--font-poppins)',
          mb: 2,
        }}
      >
        Video Editor
      </Typography>
      
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#64b5f6',
          textAlign: 'center',
          maxWidth: '600px',
          mb: 4,
          opacity: 0.8,
        }}
      >
        Transform your videos with powerful editing tools and AI-powered features
      </Typography>

      <UploadZone
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onUpload}
          accept="video/*"
          style={{ display: 'none' }}
        />
        <CloudUploadIcon 
          className="upload-icon"
          sx={{ 
            fontSize: 64,
            color: '#90caf9',
            transition: 'all 0.3s ease-in-out',
          }} 
        />
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#90caf9',
              mb: 1,
              fontWeight: 500,
            }}
          >
            Drop your video here
          </Typography>
          <Typography 
            sx={{ 
              color: '#64b5f6',
              opacity: 0.8,
            }}
          >
            or click to browse
          </Typography>
        </Box>
      </UploadZone>

      <FeatureGrid>
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Box 
              className="feature-icon"
              sx={{ 
                color: '#90caf9',
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {feature.icon}
            </Box>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#90caf9',
                fontWeight: 500,
              }}
            >
              {feature.title}
            </Typography>
            <Typography 
              sx={{ 
                color: '#64b5f6',
                opacity: 0.8,
              }}
            >
              {feature.description}
            </Typography>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </Container>
  );
}
