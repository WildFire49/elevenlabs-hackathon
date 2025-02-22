'use client';

import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const BackgroundContainer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: -1,
  background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
});

const GradientOrb = styled(motion.div)({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(80px)',
});

const BackgroundOverlay = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'radial-gradient(circle at center, transparent, rgba(0, 0, 0, 0.7))',
  backdropFilter: 'blur(100px)',
});

const Background = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const orbs = [
    {
      color: 'rgba(99, 102, 241, 0.3)',
      size: '600px',
      initialX: '20%',
      initialY: '30%',
    },
    {
      color: 'rgba(244, 63, 94, 0.2)',
      size: '800px',
      initialX: '70%',
      initialY: '60%',
    },
    {
      color: 'rgba(67, 56, 202, 0.15)',
      size: '700px',
      initialX: '50%',
      initialY: '20%',
    },
    {
      color: 'rgba(59, 130, 246, 0.2)',
      size: '900px',
      initialX: '30%',
      initialY: '70%',
    },
  ];

  return (
    <BackgroundContainer>
      {orbs.map((orb, index) => (
        <GradientOrb
          key={index}
          style={{
            background: orb.color,
            width: orb.size,
            height: orb.size,
            left: orb.initialX,
            top: orb.initialY,
          }}
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
            scale: [1, 1.1, 1],
          }}
          transition={{
            type: 'spring',
            stiffness: 50,
            damping: 20,
            mass: 2,
          }}
        />
      ))}
      <BackgroundOverlay />
    </BackgroundContainer>
  );
};

export default Background;
