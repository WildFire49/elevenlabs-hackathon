'use client';

import { Box, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MovieIcon from '@mui/icons-material/Movie';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpeedIcon from '@mui/icons-material/Speed';

const Container = styled(motion.div)({
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '48px',
  padding: '48px 24px',
  color: '#fff',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  },
});

const UploadZone = styled(motion.div)({
  width: '100%',
  maxWidth: '800px',
  aspectRatio: '16/9',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '24px',
  padding: '48px',
  borderRadius: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: 'scale(1.02)',
  },
});

const Feature = styled(motion.div)({
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  padding: '32px',
  borderRadius: '24px',
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  width: '100%',
  maxWidth: '800px',
});

const FeatureIcon = styled(Box)({
  width: '64px',
  height: '64px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& svg': {
    fontSize: '32px',
    color: '#fff',
  },
});

const features = [
  {
    icon: <AutoAwesomeIcon />,
    title: 'AI-Powered Video Enhancement',
    description: 'Transform your videos with cutting-edge AI technology. Enhance quality, remove noise, and optimize for any platform.',
  },
  {
    icon: <RecordVoiceOverIcon />,
    title: 'Voice Cloning & Dubbing',
    description: 'Clone voices and create natural-sounding dubs in multiple languages using advanced voice synthesis.',
  },
  {
    icon: <SpeedIcon />,
    title: 'Real-Time Processing',
    description: 'Experience lightning-fast video processing with our optimized cloud infrastructure.',
  },
];

const UploadState = ({ onUpload, onDrop, onDragOver, fileInputRef }) => {
  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '36px', md: '48px' },
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
            background: 'linear-gradient(to right, #fff, #a5b4fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Transform Your Videos with AI
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: '18px', md: '24px' },
            fontWeight: 400,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Enhance, clone voices, and create stunning videos with our advanced AI tools
        </Typography>
      </motion.div>

      <UploadZone
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => fileInputRef.current?.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={onUpload}
          accept="video/*"
          style={{ display: 'none' }}
        />
        <IconButton
          sx={{
            width: '96px',
            height: '96px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          }}
        >
          <CloudUploadIcon sx={{ fontSize: '48px', color: '#fff' }} />
        </IconButton>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Drag & drop your video or click to browse
        </Typography>
      </UploadZone>

      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            style={{ marginBottom: '24px' }}
          >
            <Feature>
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <Box>
                <Typography variant="h6" sx={{ marginBottom: '8px' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {feature.description}
                </Typography>
              </Box>
            </Feature>
          </motion.div>
        ))}
      </Box>
    </Container>
  );
};

export default UploadState;
