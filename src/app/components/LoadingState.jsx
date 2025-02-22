'use client';

import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Progress } from './ui/progress';
import { useEffect, useState } from 'react';

const LoadingContainer = styled(motion.div)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '32px',
  backgroundColor: '#0a1929',
  zIndex: 1000,
}));

const StageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '600px',
  padding: '0 24px',
}));

const stages = [
  { id: 1, name: 'Initializing Editor', duration: 1000 },
  { id: 2, name: 'Processing Video', duration: 2000 },
  { id: 3, name: 'Preparing Audio Tracks', duration: 1500 },
  { id: 4, name: 'Setting Up Timeline', duration: 1000 },
  { id: 5, name: 'Loading Effects', duration: 1500 },
];

const LoadingState = ({ onLoadingComplete }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    let progressTimer;

    const runStage = (stageIndex) => {
      if (stageIndex >= stages.length) {
        if (onLoadingComplete) {
          onLoadingComplete();
        }
        return;
      }

      const stage = stages[stageIndex];
      let stageProgress = 0;

      progressTimer = setInterval(() => {
        stageProgress += 2;
        setProgress((prevProgress) => {
          const newProgress = (stageIndex * 100 + stageProgress) / stages.length;
          return Math.min(newProgress, 100);
        });

        if (stageProgress >= 100) {
          clearInterval(progressTimer);
          setCurrentStage(stageIndex + 1);
          runStage(stageIndex + 1);
        }
      }, stage.duration / 50);
    };

    runStage(0);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onLoadingComplete]);

  return (
    <LoadingContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="gradient-border glassmorphism"
        style={{ padding: '48px', width: '100%', maxWidth: '600px' }}
      >
        <Typography 
          variant="h4" 
          className="text-gradient"
          sx={{ 
            textAlign: 'center',
            mb: 4,
            fontWeight: 600,
          }}
        >
          Preparing Your Editor
        </Typography>

        <StageContainer>
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body1"
              sx={{ 
                color: '#90caf9',
                mb: 1,
                fontWeight: 500,
              }}
            >
              {currentStage < stages.length ? stages[currentStage].name : 'Ready!'}
            </Typography>
            <Progress value={progress} className="animate-shimmer" />
          </Box>

          <Box sx={{ mt: 4 }}>
            {stages.map((stage, index) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= currentStage ? 1 : 0.5,
                  x: 0,
                }}
                transition={{ delay: index * 0.2 }}
                style={{ marginBottom: '12px' }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: index < currentStage ? '#2196f3' : 
                           index === currentStage ? '#90caf9' : '#64b5f6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {index < currentStage ? '✓' : '○'} {stage.name}
                </Typography>
              </motion.div>
            ))}
          </Box>
        </StageContainer>
      </motion.div>
    </LoadingContainer>
  );
};

export default LoadingState;
