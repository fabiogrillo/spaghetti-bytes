import React, { useState, useMemo } from 'react';
import { BiX } from 'react-icons/bi';
import { motion } from 'framer-motion';

const ChristmasBanner = ({ theme, setTheme }) => {
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('christmas-banner-dismissed') === 'true'
  );

  const isChristmasSeason = useMemo(() => {
    const now = new Date();
    const endDate = new Date('2026-01-15');
    return now < endDate;
  }, []);

  if (dismissed || theme === 'festive' || !isChristmasSeason) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('christmas-banner-dismissed', 'true');
  };

  const handleEnableTheme = () => {
    setTheme('festive');
    handleDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="alert shadow-soft-lg mb-4 relative bg-primary/10 border border-primary/20 rounded-soft"
    >
      <div className="flex items-center gap-4">
        <span className="text-2xl">🎄</span>
        <div>
          <p className="font-semibold">Try our festive Christmas theme!</p>
          <p className="text-sm text-base-content/70">Available until January 15, 2026</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnableTheme}
          className="btn btn-sm btn-primary ml-4 rounded-soft"
        >
          Enable Christmas Theme
        </motion.button>
      </div>
      <button
        onClick={handleDismiss}
        className="btn btn-ghost btn-sm btn-circle absolute right-2 top-2"
      >
        <BiX />
      </button>
    </motion.div>
  );
};

export default ChristmasBanner;
