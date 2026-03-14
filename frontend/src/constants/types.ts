// TaskFlow Data Types

export interface SubTask {
  id: string;
  title: string;
  emoji: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  emoji: string;
  priority: 'high' | 'medium' | 'low' | 'none';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  date: string; // ISO date string
  reminderTime: string | null; // ISO datetime string
  duration: {
    hours: number;
    minutes: number;
  };
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  subtasks: SubTask[];
  completed: boolean;
  notificationId: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tag: 'work' | 'personal' | 'ideas' | 'none';
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  rating: number; // 1-5
}

export interface UserProfile {
  name: string;
  defaultReminderMinutes: number;
  notificationSoundEnabled: boolean;
}

export interface StreakData {
  currentStreak: number;
  totalDays: number;
  lastActiveDate: string;
}

// Storage keys
export const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks',
  NOTES: 'taskflow_notes',
  MOOD: 'taskflow_mood',
  PROFILE: 'taskflow_profile',
  STREAK: 'taskflow_streak',
  INITIALIZED: 'taskflow_initialized',
};

// Time of day icons
export const TIME_OF_DAY_ICONS = {
  morning: 'sunny',
  afternoon: 'partly-sunny',
  evening: 'moon',
  anytime: 'time',
};

export const TIME_OF_DAY_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  anytime: 'Anytime',
};

export const PRIORITY_LABELS = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  none: 'TO-DO',
};

export const TAG_LABELS = {
  work: 'WORK',
  personal: 'PERSONAL',
  ideas: 'IDEAS',
  none: 'GENERAL',
};
