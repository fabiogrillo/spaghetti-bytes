// Theme colors utility
// Centralized color definitions for consistency across the app
// Uses DaisyUI semantic colors that adapt to the active theme

export const statusColors = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
  spam: 'badge-error opacity-80'
};

export const badgeColors = {
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error'
};

// Progress bar colors for goals - using theme colors
export const progressColors = [
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-info',
  'bg-success'
];

export default {
  statusColors,
  badgeColors,
  progressColors
};
