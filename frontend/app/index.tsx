// TaskFlow To-Do Screen
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../src/context/DataContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../src/constants/theme';
import { Task } from '../src/constants/types';
import { PrioritySection, CircularProgress, BlobMascot } from '../src/components';

export default function TodoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, isLoading, toggleTaskComplete, deleteTask, refreshAll } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  // Calculate stats
  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  // Group tasks by priority
  const groupedTasks = useMemo(() => {
    return {
      high: tasks.filter(t => t.priority === 'high' && !t.completed),
      medium: tasks.filter(t => t.priority === 'medium' && !t.completed),
      low: tasks.filter(t => t.priority === 'low' && !t.completed),
      none: tasks.filter(t => t.priority === 'none' && !t.completed),
    };
  }, [tasks]);

  const handleAddTask = (priority?: string) => {
    router.push({
      pathname: '/task-editor',
      params: priority ? { priority } : {},
    });
  };

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/task-editor',
      params: { taskId: task.id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {/* Task Count Badge */}
        <View style={styles.headerBadge}>
          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
          <Text style={styles.headerBadgeText}>
            {completedTasks} / {totalTasks}
          </Text>
        </View>

        {/* Progress & Add Button */}
        <View style={styles.headerRight}>
          <View style={styles.headerBadge}>
            <CircularProgress progress={progress} size={22} strokeWidth={3} />
          </View>
          <TouchableOpacity
            style={styles.addButtonSmall}
            onPress={() => handleAddTask()}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>To-do</Text>

      {/* Task List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PrioritySection
          priority="high"
          tasks={groupedTasks.high}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('high')}
          onTaskPress={handleTaskPress}
        />

        <PrioritySection
          priority="medium"
          tasks={groupedTasks.medium}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('medium')}
          onTaskPress={handleTaskPress}
        />

        <PrioritySection
          priority="low"
          tasks={groupedTasks.low}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('low')}
          onTaskPress={handleTaskPress}
        />

        <PrioritySection
          priority="none"
          tasks={groupedTasks.none}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask()}
          onTaskPress={handleTaskPress}
        />

        {totalTasks === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌟</Text>
            <Text style={styles.emptyTitle}>No tasks yet!</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first task</Text>
          </View>
        )}
      </ScrollView>

      {/* Blob Mascot */}
      <BlobMascot
        size={70}
        style={styles.blob}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    ...SHADOW.card,
  },
  headerBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  title: {
    fontSize: 48,
    fontFamily: FONTS.serifRegular,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
  },
  blob: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
});
