// TaskFlow Priority Section Component
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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, getPriorityColor } from '../constants/theme';
import { Task, PRIORITY_LABELS } from '../constants/types';
import { TaskCard } from './TaskCard';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface PrioritySectionProps {
  priority: 'high' | 'medium' | 'low' | 'none';
  tasks: Task[];
  onToggleComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: () => void;
  onTaskPress?: (task: Task) => void;
}

export const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  tasks,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onTaskPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const rotateAnim = useRef(new Animated.Value(1)).current;
  const colors = getPriorityColor(priority);

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

  if (taskCount === 0) return null;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerPill, { backgroundColor: colors.bg }]}
          onPress={toggleExpand}
          activeOpacity={0.7}
        >
          <View style={[styles.dot, { backgroundColor: colors.color }]} />
          <Text style={[styles.headerLabel, { color: colors.color }]}>
            {PRIORITY_LABELS[priority]} ({taskCount})
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

      {/* Tasks List */}
      {isExpanded && (
        <View style={styles.taskList}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTask}
              onPress={onTaskPress}
            />
          ))}
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
});
