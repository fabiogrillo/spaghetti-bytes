import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 'normal', theme }) => {
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

  const isChristmasSeason = useMemo(() => {
    const now = new Date();
    const endDate = new Date('2026-01-15');
    return now < endDate;
  }, []);

  const showChristmasDecoration = theme === 'festive' && isChristmasSeason;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 cursor-pointer"
    >
      <div className="flex items-center gap-1">
        <motion.span
          className={`${currentSize.emoji} animate-float`}
          style={{ animationDelay: '0.5s' }}
        >
          🍝
        </motion.span>
        {showChristmasDecoration && (
          <motion.span
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`text-lg`}
          >
            🎄
          </motion.span>
        )}
      </div>
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