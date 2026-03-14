// TaskFlow Notification Service
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Task } from '../constants/types';
import { toggleTaskComplete, getTasks, saveTask } from './storage';

// Check if we're on web
const isWeb = Platform.OS === 'web';

// Configure notification behavior (only on native)
if (!isWeb) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// Request permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  // Skip on web
  if (isWeb) {
    console.log('Notifications are limited on web');
    return false;
  }

  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('task-reminders', {
          name: 'Task Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7C69EF',
          sound: 'default',
        });
      } catch (e) {
        console.log('Could not set notification channel:', e);
      }
    }

    return true;
  } catch (error) {
    console.log('Error requesting notification permissions:', error);
    return false;
  }
};

// Set up notification categories with action buttons
export const setupNotificationCategories = async (): Promise<void> => {
  // Skip on web
  if (isWeb) return;

  try {
    await Notifications.setNotificationCategoryAsync('task_reminder', [
      {
        identifier: 'done',
        buttonTitle: 'Done',
        options: { opensAppToForeground: false },
      },
      {
        identifier: 'snooze',
        buttonTitle: 'Snooze 10 min',
        options: { opensAppToForeground: false },
      },
    ]);
  } catch (error) {
    console.log('Error setting notification categories:', error);
  }
};

// Schedule a notification for a task
export const scheduleTaskNotification = async (task: Task): Promise<string | null> => {
  // Skip on web
  if (isWeb) return null;

  if (!task.reminderTime) return null;

  try {
    // Cancel existing notification if any
    if (task.notificationId) {
      await cancelNotification(task.notificationId);
    }

    const triggerDate = new Date(task.reminderTime);
    
    // Don't schedule if the time has passed
    if (triggerDate <= new Date()) {
      console.log('Reminder time has already passed');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${task.emoji} ${task.title}`,
        body: `Time to start: ${task.title}`,
        data: { taskId: task.id },
        categoryIdentifier: 'task_reminder',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'task-reminders' : undefined,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Schedule repeating notification
export const scheduleRepeatingNotification = async (task: Task): Promise<string | null> => {
  // Skip on web
  if (isWeb) return null;

  if (!task.reminderTime || task.repeat === 'none') return null;

  try {
    const triggerDate = new Date(task.reminderTime);
    const hours = triggerDate.getHours();
    const minutes = triggerDate.getMinutes();

    let trigger: Notifications.NotificationTriggerInput;

    switch (task.repeat) {
      case 'daily':
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hours,
          minute: minutes,
          channelId: Platform.OS === 'android' ? 'task-reminders' : undefined,
        };
        break;
      case 'weekly':
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: triggerDate.getDay() + 1, // 1-7 (Sunday-Saturday)
          hour: hours,
          minute: minutes,
          channelId: Platform.OS === 'android' ? 'task-reminders' : undefined,
        };
        break;
      default:
        return scheduleTaskNotification(task);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${task.emoji} ${task.title}`,
        body: `Time to start: ${task.title}`,
        data: { taskId: task.id },
        categoryIdentifier: 'task_reminder',
        sound: 'default',
      },
      trigger,
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling repeating notification:', error);
    return null;
  }
};

// Cancel a notification
export const cancelNotification = async (notificationId: string): Promise<void> => {
  // Skip on web
  if (isWeb) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

// Cancel all notifications
export const cancelAllNotifications = async (): Promise<void> => {
  // Skip on web
  if (isWeb) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

// Get all scheduled notifications
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  // Skip on web
  if (isWeb) return [];

  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

// Handle notification response (when user taps notification or action button)
export const handleNotificationResponse = async (
  response: Notifications.NotificationResponse
): Promise<void> => {
  const taskId = response.notification.request.content.data?.taskId as string;
  const actionIdentifier = response.actionIdentifier;

  if (!taskId) return;

  try {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    switch (actionIdentifier) {
      case 'done':
        // Mark task as complete
        await toggleTaskComplete(taskId);
        break;

      case 'snooze':
        // Reschedule for 10 minutes later
        const snoozeTime = new Date(Date.now() + 10 * 60 * 1000);
        const updatedTask = { ...task, reminderTime: snoozeTime.toISOString() };
        const newNotificationId = await scheduleTaskNotification(updatedTask);
        if (newNotificationId) {
          updatedTask.notificationId = newNotificationId;
          await saveTask(updatedTask);
        }
        break;

      default:
        // Default action - just open the app
        break;
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
};

// Set up notification listeners
export const setupNotificationListeners = (
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) => {
  // Skip on web
  if (isWeb) {
    return () => {}; // Return empty cleanup function
  }

  const receivedSubscription = Notifications.addNotificationReceivedListener(
    notification => {
      console.log('Notification received:', notification);
      onNotificationReceived?.(notification);
    }
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      console.log('Notification response:', response);
      handleNotificationResponse(response);
      onNotificationResponse?.(response);
    }
  );

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};
