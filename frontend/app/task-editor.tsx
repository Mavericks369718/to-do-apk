// TaskFlow Task Editor Screen
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../src/context/DataContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW, getPriorityColor } from '../src/constants/theme';
import { Task, SubTask, PRIORITY_LABELS, TIME_OF_DAY_LABELS, TIME_OF_DAY_ICONS } from '../src/constants/types';
import { v4 as uuidv4 } from 'uuid';

const EMOJIS = ['📚', '🏠', '🏋️', '💼', '🛒', '📝', '📞', '✈️', '🎉', '🏖️', '🎮', '🎨', '🎵', '💡', '☕', '🍕', '🚗', '💪'];

export default function TaskEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    taskId?: string;
    priority?: string;
    timeOfDay?: string;
    date?: string;
  }>();
  const { tasks, addTask, updateTask } = useData();

  const existingTask = useMemo(() => {
    if (params.taskId) {
      return tasks.find(t => t.id === params.taskId);
    }
    return null;
  }, [params.taskId, tasks]);

  // Form state
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📚');
  const [priority, setPriority] = useState<Task['priority']>('none');
  const [timeOfDay, setTimeOfDay] = useState<Task['timeOfDay']>('anytime');
  const [date, setDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState({ hours: 0, minutes: 30 });
  const [repeat, setRepeat] = useState<Task['repeat']>('none');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  // UI state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  // Initialize form with existing task or params
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setEmoji(existingTask.emoji);
      setPriority(existingTask.priority);
      setTimeOfDay(existingTask.timeOfDay);
      setDate(new Date(existingTask.date));
      setReminderTime(existingTask.reminderTime ? new Date(existingTask.reminderTime) : null);
      setDuration(existingTask.duration);
      setRepeat(existingTask.repeat);
      setSubtasks(existingTask.subtasks);
    } else {
      if (params.priority) setPriority(params.priority as Task['priority']);
      if (params.timeOfDay) setTimeOfDay(params.timeOfDay as Task['timeOfDay']);
      if (params.date) setDate(new Date(params.date));
    }
  }, [existingTask, params]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    const task: Task = {
      id: existingTask?.id || uuidv4(),
      title: title.trim(),
      emoji,
      priority,
      timeOfDay,
      date: date.toISOString().split('T')[0],
      reminderTime: reminderTime?.toISOString() || null,
      duration,
      repeat,
      subtasks,
      completed: existingTask?.completed || false,
      notificationId: existingTask?.notificationId || null,
      createdAt: existingTask?.createdAt || new Date().toISOString(),
    };

    if (existingTask) {
      await updateTask(task);
    } else {
      await addTask(task);
    }

    router.back();
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { id: uuidv4(), title: '', emoji: '⭐', completed: false }]);
  };

  const handleUpdateSubtask = (id: string, newTitle: string) => {
    setSubtasks(subtasks.map(st => (st.id === id ? { ...st, title: newTitle } : st)));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const cyclePriority = () => {
    const priorities: Task['priority'][] = ['none', 'low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(priority);
    setPriority(priorities[(currentIndex + 1) % priorities.length]);
  };

  const cycleTimeOfDay = () => {
    const times: Task['timeOfDay'][] = ['anytime', 'morning', 'afternoon', 'evening'];
    const currentIndex = times.indexOf(timeOfDay);
    setTimeOfDay(times[(currentIndex + 1) % times.length]);
  };

  const cycleRepeat = () => {
    const repeats: Task['repeat'][] = ['none', 'daily', 'weekly', 'monthly'];
    const currentIndex = repeats.indexOf(repeat);
    setRepeat(repeats[(currentIndex + 1) % repeats.length]);
  };

  const priorityColors = getPriorityColor(priority);

  const formatDuration = () => {
    if (duration.hours > 0 && duration.minutes > 0) return `${duration.hours}h ${duration.minutes}m`;
    if (duration.hours > 0) return `${duration.hours}h`;
    if (duration.minutes > 0) return `${duration.minutes}m`;
    return 'Set duration';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {existingTask ? 'Edit task' : 'Add task'}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={22} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Task Name Row */}
          <View style={styles.nameRow}>
            <TextInput
              style={styles.nameInput}
              placeholder="Task name"
              placeholderTextColor={COLORS.textMuted}
              value={title}
              onChangeText={setTitle}
              autoFocus={!existingTask}
            />
            <TouchableOpacity
              style={[styles.emojiButton, { backgroundColor: priorityColors.bg }]}
              onPress={() => setShowEmojiPicker(true)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          <View style={styles.fields}>
            {/* Priority */}
            <TouchableOpacity style={styles.fieldRow} onPress={cyclePriority}>
              <Text style={styles.fieldLabel}>Priority</Text>
              <View style={[styles.fieldPill, { backgroundColor: priorityColors.bg }]}>
                <View style={[styles.fieldDot, { backgroundColor: priorityColors.color }]} />
                <Text style={[styles.fieldValue, { color: priorityColors.color }]}>
                  {PRIORITY_LABELS[priority]}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Time of Day */}
            <TouchableOpacity style={styles.fieldRow} onPress={cycleTimeOfDay}>
              <Text style={styles.fieldLabel}>Time of day</Text>
              <View style={styles.fieldPill}>
                <Ionicons
                  name={TIME_OF_DAY_ICONS[timeOfDay] as any}
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.fieldValue}>{TIME_OF_DAY_LABELS[timeOfDay]}</Text>
              </View>
            </TouchableOpacity>

            {/* Date */}
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.fieldPill}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.fieldValue}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Reminder */}
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.fieldLabel}>Reminder</Text>
              <View style={styles.fieldPill}>
                <Ionicons name="alarm-outline" size={16} color={COLORS.primary} />
                <Text style={styles.fieldValue}>
                  {reminderTime
                    ? reminderTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : 'Not set'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Duration */}
            <TouchableOpacity style={styles.fieldRow} onPress={() => setShowDurationPicker(true)}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.fieldPill}>
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                <Text style={styles.fieldValue}>{formatDuration()}</Text>
              </View>
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity style={styles.fieldRow} onPress={cycleRepeat}>
              <Text style={styles.fieldLabel}>Repeat</Text>
              <View style={styles.fieldPill}>
                <Ionicons name="repeat-outline" size={16} color={COLORS.primary} />
                <Text style={styles.fieldValue}>
                  {repeat === 'none' ? 'None' : repeat.charAt(0).toUpperCase() + repeat.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Subtasks Section */}
          <View style={styles.subtasksSection}>
            <Text style={styles.subtasksTitle}>Sub-tasks</Text>
            {subtasks.map((subtask, index) => (
              <View key={subtask.id} style={styles.subtaskRow}>
                <View style={styles.subtaskLeft}>
                  <Text style={styles.subtaskEmoji}>{subtask.emoji}</Text>
                  <TextInput
                    style={styles.subtaskInput}
                    value={subtask.title}
                    onChangeText={(text) => handleUpdateSubtask(subtask.id, text)}
                    placeholder="Subtask name"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <TouchableOpacity onPress={() => handleDeleteSubtask(subtask.id)}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addSubtaskButton} onPress={handleAddSubtask}>
              <Ionicons name="add" size={18} color={COLORS.primary} />
              <Text style={styles.addSubtaskText}>ADD NEW</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Emoji Picker Modal */}
        <Modal
          visible={showEmojiPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEmojiPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEmojiPicker(false)}
          >
            <View style={styles.emojiPickerContent}>
              <Text style={styles.emojiPickerTitle}>Select an emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJIS.map((e, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.emojiOption, emoji === e && styles.emojiOptionSelected]}
                    onPress={() => {
                      setEmoji(e);
                      setShowEmojiPicker(false);
                    }}
                  >
                    <Text style={styles.emojiOptionText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime || new Date()}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedTime) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedTime) {
                const newReminder = new Date(date);
                newReminder.setHours(selectedTime.getHours(), selectedTime.getMinutes());
                setReminderTime(newReminder);
              }
            }}
          />
        )}

        {/* Duration Picker Modal */}
        <Modal
          visible={showDurationPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDurationPicker(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDurationPicker(false)}
          >
            <View style={styles.durationPickerContent}>
              <Text style={styles.durationPickerTitle}>Set Duration</Text>
              <View style={styles.durationInputs}>
                <View style={styles.durationInput}>
                  <Text style={styles.durationLabel}>Hours</Text>
                  <View style={styles.durationControl}>
                    <TouchableOpacity
                      onPress={() => setDuration(d => ({ ...d, hours: Math.max(0, d.hours - 1) }))}
                    >
                      <Ionicons name="remove-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.durationValue}>{duration.hours}</Text>
                    <TouchableOpacity
                      onPress={() => setDuration(d => ({ ...d, hours: d.hours + 1 }))}
                    >
                      <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.durationInput}>
                  <Text style={styles.durationLabel}>Minutes</Text>
                  <View style={styles.durationControl}>
                    <TouchableOpacity
                      onPress={() => setDuration(d => ({ ...d, minutes: Math.max(0, d.minutes - 5) }))}
                    >
                      <Ionicons name="remove-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                    <Text style={styles.durationValue}>{duration.minutes}</Text>
                    <TouchableOpacity
                      onPress={() => setDuration(d => ({ ...d, minutes: Math.min(55, d.minutes + 5) }))}
                    >
                      <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.durationDone}
                onPress={() => setShowDurationPicker(false)}
              >
                <Text style={styles.durationDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  nameInput: {
    flex: 1,
    fontSize: 20,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  emojiText: {
    fontSize: 24,
  },
  fields: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fieldLabel: {
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
  },
  fieldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.noneBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  fieldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fieldValue: {
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  subtasksSection: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  subtasksTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subtaskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  subtaskEmoji: {
    fontSize: 18,
    width: 32,
    height: 32,
    backgroundColor: COLORS.noneBg,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  addSubtaskText: {
    fontSize: 13,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    width: '85%',
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  emojiOption: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  emojiOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  emojiOptionText: {
    fontSize: 24,
  },
  durationPickerContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    width: '80%',
  },
  durationPickerTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  durationInputs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  durationInput: {
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  durationControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  durationValue: {
    fontSize: 28,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  durationDone: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  durationDoneText: {
    fontSize: 16,
    fontFamily: FONTS.sansSemiBold,
    color: 'white',
  },
});
