// Minimal animations utility
// Simple, fast animations for essential interactions only

export const minimal = {
  // Hover effect - subtle scale
  hover: {
    scale: 1.02,
    transition: { duration: 0.15, ease: "easeOut" }
  },

  // Tap/click effect
  tap: {
    scale: 0.98
  },

  // Simple fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.2, ease: "easeOut" }
  },

  // Fade in with slight movement
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: "easeOut" }
  }
};

// Pre-configured motion props for common use cases
export const motionPresets = {
  // Button with hover and tap
  button: {
    whileHover: minimal.hover,
    whileTap: minimal.tap
  },

  // Card with hover
  card: {
    whileHover: minimal.hover
  },

  // Fade in on mount
  fadeIn: {
    ...minimal.fadeIn
  },

  // Fade in up on mount
  fadeInUp: {
    ...minimal.fadeInUp
  }
};

export default minimal;
