// TaskFlow Time Section Component (for Today screen)
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { Task, TIME_OF_DAY_ICONS, TIME_OF_DAY_LABELS } from '../constants/types';
import { TaskCard } from './TaskCard';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIME_COLORS = {
  morning: { color: '#F97316', bg: '#FFF7ED' },
  afternoon: { color: '#FBBF24', bg: '#FFFBEB' },
  evening: { color: '#6366F1', bg: '#EEF2FF' },
  anytime: { color: COLORS.textSecondary, bg: COLORS.noneBg },
};

interface TimeSectionProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
  onTaskPress?: (task: Task) => void;
}

export const TimeSection: React.FC<TimeSectionProps> = ({
  timeOfDay,
  tasks,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onTaskPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const rotateAnim = useRef(new Animated.Value(1)).current;
  const colors = TIME_COLORS[timeOfDay];

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const taskCount = tasks.length;
  const iconName = TIME_OF_DAY_ICONS[timeOfDay] as any;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerPill, { backgroundColor: colors.bg }]}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <Ionicons name={iconName} size={16} color={colors.color} />
          <Text style={[styles.headerLabel, { color: colors.color }]}>
            {TIME_OF_DAY_LABELS[timeOfDay].toUpperCase()} ({taskCount})
          </Text>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <Ionicons name="chevron-forward" size={16} color={colors.color} />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.bg }]}
          onPress={onAddTask}
        >
          <Ionicons name="add" size={18} color={colors.color} />
        </TouchableOpacity>
      </View>

      {/* Tasks List or Empty State */}
      {isExpanded && (
        <View style={styles.taskList}>
          {taskCount === 0 ? (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={onAddTask}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyText}>
                {timeOfDay === 'anytime' ? 'Anytime today works' : `No ${timeOfDay} tasks`}
              </Text>
              <View style={styles.emptyAddButton}>
                <Ionicons name="add" size={16} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onDelete={onDeleteTask}
                onPress={onTaskPress}
                showSubtasks={true}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  headerLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
    letterSpacing: 0.5,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskList: {
    marginTop: SPACING.xs,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xxl,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
  },
  emptyAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.noneBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
