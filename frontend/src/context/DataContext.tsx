// TaskFlow Data Context
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Task, Note, MoodEntry, UserProfile, StreakData } from '../constants/types';
import * as Storage from '../services/storage';
import * as NotificationService from '../services/notifications';

interface DataContextType {
  // Tasks
  tasks: Task[];
  loadTasks: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  toggleSubtaskComplete: (taskId: string, subtaskId: string) => Promise<void>;
  
  // Notes
  notes: Note[];
  loadNotes: () => Promise<void>;
  addNote: (note: Note) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  toggleNotePin: (noteId: string) => Promise<void>;
  
  // Profile
  profile: UserProfile | null;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  
  // Mood
  moodEntries: MoodEntry[];
  loadMoodEntries: () => Promise<void>;
  addMoodEntry: (entry: MoodEntry) => Promise<void>;
  
  // Streak
  streak: StreakData | null;
  loadStreak: () => Promise<void>;
  updateStreak: () => Promise<void>;
  
  // Utility
  isLoading: boolean;
  refreshAll: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app on mount
  useEffect(() => {
    const init = async () => {
  try {
    await Storage.initializeApp();
    await NotificationService.requestNotificationPermissions();
    await NotificationService.setupNotificationCategories();
    await refreshAll();
  } catch (error) {
    console.error('Init error:', error);
  } finally {
    setIsLoading(false);
  }
};
    init();

    // Set up notification listeners
    const cleanup = NotificationService.setupNotificationListeners(
      undefined,
      () => {
        // Refresh tasks when notification action is taken
        loadTasks();
      }
    );

    return cleanup;
  }, []);

  // Task functions
  const loadTasks = useCallback(async () => {
    const data = await Storage.getTasks();
    setTasks(data);
  }, []);

  const addTask = useCallback(async (task: Task) => {
    // Schedule notification if reminder time is set
    if (task.reminderTime) {
      const notificationId = task.repeat !== 'none'
        ? await NotificationService.scheduleRepeatingNotification(task)
        : await NotificationService.scheduleTaskNotification(task);
      task.notificationId = notificationId;
    }
    await Storage.saveTask(task);
    await loadTasks();
  }, [loadTasks]);

  const updateTask = useCallback(async (task: Task) => {
    // Update notification if reminder time changed
    if (task.notificationId) {
      await NotificationService.cancelNotification(task.notificationId);
    }
    if (task.reminderTime && !task.completed) {
      const notificationId = task.repeat !== 'none'
        ? await NotificationService.scheduleRepeatingNotification(task)
        : await NotificationService.scheduleTaskNotification(task);
      task.notificationId = notificationId;
    }
    await Storage.saveTask(task);
    await loadTasks();
  }, [loadTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.notificationId) {
      await NotificationService.cancelNotification(task.notificationId);
    }
    await Storage.deleteTask(taskId);
    await loadTasks();
  }, [tasks, loadTasks]);

  const toggleTaskComplete = useCallback(async (taskId: string) => {
    const updatedTask = await Storage.toggleTaskComplete(taskId);
    if (updatedTask?.completed && updatedTask.notificationId) {
      await NotificationService.cancelNotification(updatedTask.notificationId);
    }
    await loadTasks();
    await updateStreak();
  }, [loadTasks]);

  const toggleSubtaskComplete = useCallback(async (taskId: string, subtaskId: string) => {
    await Storage.toggleSubtaskComplete(taskId, subtaskId);
    await loadTasks();
  }, [loadTasks]);

  // Note functions
  const loadNotes = useCallback(async () => {
    const data = await Storage.getNotes();
    setNotes(data);
  }, []);

  const addNote = useCallback(async (note: Note) => {
    await Storage.saveNote(note);
    await loadNotes();
  }, [loadNotes]);

  const updateNote = useCallback(async (note: Note) => {
    await Storage.saveNote(note);
    await loadNotes();
  }, [loadNotes]);

  const deleteNote = useCallback(async (noteId: string) => {
    await Storage.deleteNote(noteId);
    await loadNotes();
  }, [loadNotes]);

  const toggleNotePin = useCallback(async (noteId: string) => {
    await Storage.toggleNotePin(noteId);
    await loadNotes();
  }, [loadNotes]);

  // Profile functions
  const loadProfile = useCallback(async () => {
    const data = await Storage.getProfile();
    setProfile(data);
  }, []);

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    await Storage.saveProfile(newProfile);
    setProfile(newProfile);
  }, []);

  // Mood functions
  const loadMoodEntries = useCallback(async () => {
    const data = await Storage.getMoodEntries();
    setMoodEntries(data);
  }, []);

  const addMoodEntry = useCallback(async (entry: MoodEntry) => {
    await Storage.saveMoodEntry(entry);
    await loadMoodEntries();
  }, [loadMoodEntries]);

  // Streak functions
  const loadStreak = useCallback(async () => {
    const data = await Storage.getStreak();
    setStreak(data);
  }, []);

  const updateStreak = useCallback(async () => {
    const data = await Storage.updateStreak();
    setStreak(data);
  }, []);

  // Utility functions
  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadTasks(),
      loadNotes(),
      loadProfile(),
      loadMoodEntries(),
      loadStreak(),
    ]);
  }, [loadTasks, loadNotes, loadProfile, loadMoodEntries, loadStreak]);

  const clearAllData = useCallback(async () => {
    await NotificationService.cancelAllNotifications();
    await Storage.clearAllData();
    setTasks([]);
    setNotes([]);
    setProfile(null);
    setMoodEntries([]);
    setStreak(null);
  }, []);

  return (
    <DataContext.Provider
      value={{
        tasks,
        loadTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        toggleSubtaskComplete,
        notes,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        toggleNotePin,
        profile,
        loadProfile,
        updateProfile,
        moodEntries,
        loadMoodEntries,
        addMoodEntry,
        streak,
        loadStreak,
        updateStreak,
        isLoading,
        refreshAll,
        clearAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
