import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@mui/material';

const buttonVariants = {
  rest: {
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  tap: {
    scale: 0.98
  }
};

const AnimatedButton = ({ 
  children, 
  variant = 'contained',
  color = 'primary',
  sx = {},
  ...props 
}) => {
  return (
    <motion.div
      variants={buttonVariants}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Button
        variant={variant}
        color={color}
        sx={{
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '12px',
          padding: '10px 24px',
          transition: 'all 0.2s ease',
          ...sx
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default AnimatedButton;

