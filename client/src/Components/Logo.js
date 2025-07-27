import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'normal' }) => {
  const sizes = {
    small: {
      emoji: 'text-2xl',
      text: 'text-xl',
      subtext: 'text-xs'
    },
    normal: {
      emoji: 'text-3xl',
      text: 'text-2xl',
      subtext: 'text-xs'
    },
    large: {
      emoji: 'text-5xl',
      text: 'text-4xl',
      subtext: 'text-sm'
    }
  };

  const currentSize = sizes[size] || sizes.normal;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 cursor-pointer"
    >
      <motion.span 
        className={`${currentSize.emoji} animate-float`}
        style={{ animationDelay: '0.5s' }}
      >
        🍝
      </motion.span>
      <div className="flex flex-col items-start">
        <div className={`${currentSize.text} logo-font leading-tight`}>
          <span className="gradient-text block">Spaghetti</span>
          <span className="gradient-text block -mt-2">Bytes</span>
        </div>
        <p className={`${currentSize.subtext} text-gray-500 italic`}>
          Untangling code, one byte at a time
        </p>
      </div>
    </motion.div>
  );
};

export default Logo;