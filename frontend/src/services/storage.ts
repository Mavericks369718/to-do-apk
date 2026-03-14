// TaskFlow Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Note, MoodEntry, UserProfile, StreakData, STORAGE_KEYS } from '../constants/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get today's date as ISO string
const getTodayISO = () => new Date().toISOString().split('T')[0];

// Sample data for first launch
const getSampleTasks = (): Task[] => {
  const today = getTodayISO();
  return [
    {
      id: uuidv4(),
      title: 'Do homework',
      emoji: '📚',
      priority: 'high',
      timeOfDay: 'morning',
      date: today,
      reminderTime: null,
      duration: { hours: 1, minutes: 30 },
      repeat: 'none',
      subtasks: [],
      completed: false,
      notificationId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Paying rent',
      emoji: '🏠',
      priority: 'medium',
      timeOfDay: 'anytime',
      date: today,
      reminderTime: null,
      duration: { hours: 0, minutes: 15 },
      repeat: 'monthly',
      subtasks: [],
      completed: false,
      notificationId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: 'Go to gym',
      emoji: '🏋️',
      priority: 'none',
      timeOfDay: 'afternoon',
      date: today,
      reminderTime: null,
      duration: { hours: 1, minutes: 0 },
      repeat: 'daily',
      subtasks: [
        { id: uuidv4(), title: 'Warm up', emoji: '🔥', completed: false },
        { id: uuidv4(), title: 'Cardio', emoji: '🏃', completed: false },
        { id: uuidv4(), title: 'Weights', emoji: '💪', completed: false },
        { id: uuidv4(), title: 'Stretching', emoji: '🧘', completed: false },
      ],
      completed: false,
      notificationId: null,
      createdAt: new Date().toISOString(),
    },
  ];
};

const getSampleNotes = (): Note[] => {
  const now = new Date().toISOString();
  return [
    {
      id: uuidv4(),
      title: 'Meeting Project Alpha',
      body: 'Need to finalize the navigation flow and the purple character interactions by Thursday. Also discuss the timeline for the MVP launch and gather feedback from the design team.',
      tag: 'work',
      pinned: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      title: 'Groceries List',
      body: 'Almond milk, avocados, whole grain bread, and dark chocolate for the weekend snacks. Also need to pick up some fresh vegetables and fruits.',
      tag: 'personal',
      pinned: false,
      createdAt: now,
      updatedAt: now,
    },
  ];
};

const getDefaultProfile = (): UserProfile => ({
  name: 'Alex Smith',
  defaultReminderMinutes: 30,
  notificationSoundEnabled: true,
});

const getDefaultStreak = (): StreakData => ({
  currentStreak: 0,
  totalDays: 0,
  lastActiveDate: '',
});

// Initialize app with sample data
export const initializeApp = async (): Promise<boolean> => {
  try {
    const initialized = await AsyncStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (initialized === 'true') {
      return false; // Already initialized
    }

    // Set sample data
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(getSampleTasks()));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(getSampleNotes()));
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(getDefaultProfile()));
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(getDefaultStreak()));
    await AsyncStorage.setItem(STORAGE_KEYS.MOOD, JSON.stringify([]));
    await AsyncStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return true; // First time initialization
  } catch (error) {
    console.error('Error initializing app:', error);
    return false;
  }
};

// Task operations
export const getTasks = async (): Promise<Task[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

export const saveTask = async (task: Task): Promise<void> => {
  try {
    const tasks = await getTasks();
    const existingIndex = tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving task:', error);
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const tasks = await getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};

export const toggleTaskComplete = async (taskId: string): Promise<Task | null> => {
  try {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      return tasks[taskIndex];
    }
    return null;
  } catch (error) {
    console.error('Error toggling task:', error);
    return null;
  }
};

export const toggleSubtaskComplete = async (taskId: string, subtaskId: string): Promise<void> => {
  try {
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      const subtaskIndex = tasks[taskIndex].subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex >= 0) {
        tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      }
    }
  } catch (error) {
    console.error('Error toggling subtask:', error);
  }
};

// Note operations
export const getNotes = async (): Promise<Note[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const saveNote = async (note: Note): Promise<void> => {
  try {
    const notes = await getNotes();
    const existingIndex = notes.findIndex(n => n.id === note.id);
    if (existingIndex >= 0) {
      notes[existingIndex] = { ...note, updatedAt: new Date().toISOString() };
    } else {
      notes.push(note);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving note:', error);
  }
};

export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const notes = await getNotes();
    const filtered = notes.filter(n => n.id !== noteId);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

export const toggleNotePin = async (noteId: string): Promise<void> => {
  try {
    const notes = await getNotes();
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex >= 0) {
      notes[noteIndex].pinned = !notes[noteIndex].pinned;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  } catch (error) {
    console.error('Error toggling note pin:', error);
  }
};

// Profile operations
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : getDefaultProfile();
  } catch (error) {
    console.error('Error getting profile:', error);
    return getDefaultProfile();
  }
};

export const saveProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

// Mood operations
export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MOOD);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting mood entries:', error);
    return [];
  }
};

export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  try {
    const entries = await getMoodEntries();
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.MOOD, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving mood entry:', error);
  }
};

// Streak operations
export const getStreak = async (): Promise<StreakData> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
    return data ? JSON.parse(data) : getDefaultStreak();
  } catch (error) {
    console.error('Error getting streak:', error);
    return getDefaultStreak();
  }
};

export const updateStreak = async (): Promise<StreakData> => {
  try {
    const streak = await getStreak();
    const today = getTodayISO();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (streak.lastActiveDate === today) {
      return streak; // Already updated today
    }

    if (streak.lastActiveDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }

    streak.totalDays += 1;
    streak.lastActiveDate = today;

    await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    return streak;
  } catch (error) {
    console.error('Error updating streak:', error);
    return getDefaultStreak();
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TASKS,
      STORAGE_KEYS.NOTES,
      STORAGE_KEYS.MOOD,
      STORAGE_KEYS.PROFILE,
      STORAGE_KEYS.STREAK,
      STORAGE_KEYS.INITIALIZED,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
