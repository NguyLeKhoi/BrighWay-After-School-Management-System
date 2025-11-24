import React from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const AnimatedCard = ({ 
  children, 
  delay = 0, 
  hover = true,
  className = '',
  sx = {},
  ...props 
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      variants={cardVariants}
      style={{
        transition: { delay }
      }}
      className={className}
      {...props}
    >
      <Box
        sx={{
          height: '100%',
          ...sx
        }}
      >
        {children}
      </Box>
    </motion.div>
  );
};

export default AnimatedCard;

