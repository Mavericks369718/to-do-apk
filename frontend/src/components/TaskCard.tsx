// TaskFlow Task Card Component
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW, getPriorityColor } from '../constants/theme';
import { Task } from '../constants/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onPress?: (task: Task) => void;
  showSubtasks?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onDelete,
  onPress,
  showSubtasks = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteButtonOpacity = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

  const priorityColors = getPriorityColor(task.priority);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        translateX.setValue(Math.max(gestureState.dx, -80));
        deleteButtonOpacity.setValue(Math.min(Math.abs(gestureState.dx) / 80, 1));
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -40) {
        Animated.spring(translateX, {
          toValue: -80,
          useNativeDriver: true,
        }).start();
        Animated.timing(deleteButtonOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.timing(deleteButtonOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleToggleComplete = () => {
    Animated.timing(checkAnim, {
      toValue: task.completed ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onToggleComplete(task.id);
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;

  const formatDuration = () => {
    const { hours, minutes } = task.duration;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return '';
  };

  return (
    <View style={styles.container}>
      {/* Delete button behind */}
      <Animated.View
        style={[
          styles.deleteButton,
          { opacity: deleteButtonOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButtonInner}
          onPress={() => onDelete(task.id)}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateX }] },
          task.completed && styles.cardCompleted,
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => onPress?.(task)}
          activeOpacity={0.7}
        >
          {/* Emoji Icon */}
          <View style={[styles.emojiContainer, { backgroundColor: priorityColors.bg }]}>
            <Text style={styles.emoji}>{task.emoji}</Text>
          </View>

          {/* Task Info */}
          <View style={styles.taskInfo}>
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.taskTitleCompleted,
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>

            {/* Duration & Subtasks */}
            <View style={styles.taskMeta}>
              {formatDuration() && (
                <View style={styles.durationBadge}>
                  <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.durationText}>{formatDuration()}</Text>
                </View>
              )}

              {showSubtasks && totalSubtasks > 0 && (
                <View style={styles.subtaskProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${subtaskProgress * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.subtaskCount}>
                    {completedSubtasks}/{totalSubtasks}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleToggleComplete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View
              style={[
                styles.checkbox,
                {
                  backgroundColor: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['transparent', COLORS.primary],
                  }),
                  borderColor: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [COLORS.borderLight, COLORS.primary],
                  }),
                },
              ]}
            >
              {task.completed && (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
            </Animated.View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emojiContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  emoji: {
    fontSize: 22,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sansRegular,
  },
  subtaskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  subtaskCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: FONTS.sansRegular,
  },
  checkboxContainer: {
    marginLeft: SPACING.sm,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonInner: {
    backgroundColor: COLORS.error,
    width: 60,
    height: '80%',
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
