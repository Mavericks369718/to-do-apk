// TaskFlow Today Schedule Screen
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
import { TimeSection, CircularProgress, BlobMascot } from '../src/components';

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, isLoading, toggleTaskComplete, deleteTask, refreshAll } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];

  // Get day name and formatted date
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  // Add ordinal suffix
  const day = today.getDate();
  const suffix = ['th', 'st', 'nd', 'rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10];
  const dateWithSuffix = formattedDate.replace(String(day), `${day}${suffix}`);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  // Filter tasks for today
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.date === todayISO && !t.completed);
  }, [tasks, todayISO]);

  // Group by time of day
  const groupedTasks = useMemo(() => {
    return {
      anytime: todayTasks.filter(t => t.timeOfDay === 'anytime'),
      morning: todayTasks.filter(t => t.timeOfDay === 'morning'),
      afternoon: todayTasks.filter(t => t.timeOfDay === 'afternoon'),
      evening: todayTasks.filter(t => t.timeOfDay === 'evening'),
    };
  }, [todayTasks]);

  // Calculate stats for today
  const todayTasksAll = tasks.filter(t => t.date === todayISO);
  const completedToday = todayTasksAll.filter(t => t.completed).length;
  const totalToday = todayTasksAll.length;
  const progress = totalToday > 0 ? completedToday / totalToday : 0;

  const handleAddTask = (timeOfDay?: string) => {
    router.push({
      pathname: '/task-editor',
      params: { timeOfDay: timeOfDay || 'anytime', date: todayISO },
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
            {completedToday} / {totalToday}
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

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{dayName}</Text>
        <Text style={styles.subtitle}>{dateWithSuffix}</Text>
      </View>

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
        <TimeSection
          timeOfDay="anytime"
          tasks={groupedTasks.anytime}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('anytime')}
          onTaskPress={handleTaskPress}
        />

        <TimeSection
          timeOfDay="morning"
          tasks={groupedTasks.morning}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('morning')}
          onTaskPress={handleTaskPress}
        />

        <TimeSection
          timeOfDay="afternoon"
          tasks={groupedTasks.afternoon}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('afternoon')}
          onTaskPress={handleTaskPress}
        />

        <TimeSection
          timeOfDay="evening"
          tasks={groupedTasks.evening}
          onToggleComplete={toggleTaskComplete}
          onDeleteTask={deleteTask}
          onAddTask={() => handleAddTask('evening')}
          onTaskPress={handleTaskPress}
        />
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
  titleSection: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 48,
    fontFamily: FONTS.serifRegular,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
  },
  blob: {
    position: 'absolute',
    bottom: 100,
    right: 20,
  },
});
