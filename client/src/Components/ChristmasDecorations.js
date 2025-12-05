import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const ChristmasDecorations = () => {
  const location = useLocation();
  const [decorations, setDecorations] = useState([]);

  // Assign different decoration types to different routes
  const decorationType = useMemo(() => {
    const path = location.pathname;
    const types = [
      'snowflakes', // /
      'stars',      // /blog
      'baubles',    // /goals
      'candy',      // /bookmarks
      'trees',      // /contacts
      'snowman',    // /login
      'bells',      // /editor
      'gifts',      // /manager
    ];

    // Hash the path to get consistent decoration type
    const hash = path.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return types[hash % types.length];
  }, [location.pathname]);

  useEffect(() => {
    // Create only 12-15 decorations (light and subtle)
    const count = 12 + Math.floor(Math.random() * 4);
    const items = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 15 + Math.random() * 10, // Slower fall
      size: 0.6 + Math.random() * 0.8, // Smaller size
    }));
    setDecorations(items);
  }, [decorationType]);

  const getDecorationSymbol = (type) => {
    const types = {
      snowflakes: ['❄️', '❅', '❆'],
      stars: ['⭐', '✨'],
      baubles: ['🔴', '🔵', '🟡'],
      candy: ['🍬'],
      trees: ['🎄'],
      bells: ['🔔'],
      gifts: ['🎁'],
      snowman: ['⛄'],
      sled: ['🛷'],
    };
    const symbols = types[type] || types.snowflakes;
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {decorations.map((deco) => (
        <motion.div
          key={deco.id}
          className="absolute"
          style={{
            left: `${deco.left}%`,
            fontSize: `${deco.size}rem`,
            opacity: 0.15, // Very subtle
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, 0.15, 0.15, 0],
            rotate: [0, 360],
            x: [0, Math.sin(deco.id) * 30, 0], // Gentle horizontal sway
          }}
          transition={{
            duration: deco.duration,
            delay: deco.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {getDecorationSymbol(decorationType)}
        </motion.div>
      ))}
    </div>
  );
};

export default ChristmasDecorations;
