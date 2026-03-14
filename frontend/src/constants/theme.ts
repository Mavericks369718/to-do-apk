// TaskFlow Theme Constants

export const COLORS = {
  // Primary colors
  primary: '#7C69EF',
  primaryLight: '#A5B4FC',
  primaryDark: '#8B5CF6',
  
  // Background colors
  background: '#F9F8FD',
  cardBackground: '#FFFFFF',
  
  // Text colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  
  // Priority colors
  high: '#EF4444',
  highBg: '#FEF2F2',
  medium: '#F97316',
  mediumBg: '#FFF7ED',
  low: '#6366F1',
  lowBg: '#EEF2FF',
  none: '#9CA3AF',
  noneBg: '#F3F4F6',
  
  // Status colors
  success: '#22C55E',
  successBg: '#DCFCE7',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // UI colors
  border: '#F1F0F9',
  borderLight: '#E2E8F0',
  tabBarBg: 'rgba(255, 255, 255, 0.9)',
  
  // Tag colors
  tagWork: '#7C69EF',
  tagWorkBg: '#EEF2FF',
  tagPersonal: '#F97316',
  tagPersonalBg: '#FFF7ED',
  tagIdeas: '#14B8A6',
  tagIdeasBg: '#CCFBF1',
};

export const FONTS = {
  serifRegular: 'DMSerifDisplay_400Regular',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 100,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return { color: COLORS.high, bg: COLORS.highBg };
    case 'medium':
      return { color: COLORS.medium, bg: COLORS.mediumBg };
    case 'low':
      return { color: COLORS.low, bg: COLORS.lowBg };
    default:
      return { color: COLORS.none, bg: COLORS.noneBg };
  }
};

export const getTagColor = (tag: string) => {
  switch (tag) {
    case 'work':
      return { color: COLORS.tagWork, bg: COLORS.tagWorkBg };
    case 'personal':
      return { color: COLORS.tagPersonal, bg: COLORS.tagPersonalBg };
    case 'ideas':
      return { color: COLORS.tagIdeas, bg: COLORS.tagIdeasBg };
    default:
      return { color: COLORS.none, bg: COLORS.noneBg };
  }
};
