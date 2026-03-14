// TaskFlow Me / Profile Screen
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Share,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../src/context/DataContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../src/constants/theme';

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    updateProfile,
    moodEntries,
    addMoodEntry,
    streak,
    clearAllData,
    isLoading,
    refreshAll,
  } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMoodDate, setSelectedMoodDate] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  // Get week days
  const weekDays = useMemo(() => {
    const days = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const moodEntry = moodEntries.find(e => e.date === dateStr);

      days.push({
        dayName: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
        date: dateStr,
        isToday: dateStr === today.toISOString().split('T')[0],
        isFuture: date > today,
        mood: moodEntry?.rating || 0,
      });
    }
    return days;
  }, [moodEntries]);

  const handleEditName = () => {
    setTempName(profile?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (profile && tempName.trim()) {
      await updateProfile({ ...profile, name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleMoodPress = (day: typeof weekDays[0]) => {
    if (!day.isFuture) {
      setSelectedMoodDate(day.date);
      setShowMoodModal(true);
    }
  };

  const handleMoodSelect = async (rating: number) => {
    await addMoodEntry({ date: selectedMoodDate, rating });
    setShowMoodModal(false);
  };

  const handleShareStreak = async () => {
    try {
      await Share.share({
        message: `I'm on a ${streak?.currentStreak || 0} day streak with TaskFlow! Total: ${streak?.totalDays || 0} productive days`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your tasks, notes, and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const handleToggleNotificationSound = async () => {
    if (profile) {
      await updateProfile({
        ...profile,
        notificationSoundEnabled: !profile.notificationSoundEnabled,
      });
    }
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
        {isEditingName ? (
          <View style={styles.nameEditContainer}>
            <TextInput
              style={styles.nameInput}
              value={tempName}
              onChangeText={setTempName}
              autoFocus
              onBlur={handleSaveName}
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity onPress={handleSaveName}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleEditName}>
            <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

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
        {/* Section Title */}
        <Text style={styles.sectionTitle}>My Weekly Insights</Text>

        {/* Mood Tracker Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood and Daily Reflections</Text>
          <View style={styles.moodWeek}>
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={styles.moodDay}
                onPress={() => handleMoodPress(day)}
                disabled={day.isFuture}
              >
                <Text style={styles.moodDayLabel}>{day.dayName}</Text>
                <View
                  style={[
                    styles.moodCircle,
                    day.isToday && styles.moodCircleToday,
                    day.mood > 0 && styles.moodCircleFilled,
                  ]}
                >
                  {day.mood > 0 ? (
                    <Text style={styles.moodStar}>★</Text>
                  ) : day.isFuture ? (
                    <Ionicons name="add" size={14} color={COLORS.textMuted} />
                  ) : (
                    <Ionicons name="add" size={14} color={day.isToday ? 'white' : COLORS.textMuted} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Streak Card */}
        <View style={styles.card}>
          <View style={styles.streakRow}>
            <View style={styles.streakBox}>
              <Text style={styles.streakNumber}>{streak?.currentStreak || 0}</Text>
              <View style={styles.streakLabelRow}>
                <Text style={styles.streakIcon}>🌱</Text>
                <Text style={styles.streakLabel}>DAYS IN A ROW</Text>
              </View>
            </View>
            <View style={[styles.streakBox, styles.streakBoxRight]}>
              <Text style={styles.streakNumber}>{streak?.totalDays || 0}</Text>
              <Text style={styles.streakLabel}>TOTAL DAYS</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareStreak}>
            <Text style={styles.shareButtonText}>Share</Text>
            <Ionicons name="arrow-up" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Settings</Text>

        <View style={styles.card}>
          {/* Notification Sound */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleToggleNotificationSound}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.settingLabel}>Notification sound</Text>
            </View>
            <View
              style={[
                styles.toggle,
                profile?.notificationSoundEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  profile?.notificationSoundEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Default Reminder */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={22} color={COLORS.textPrimary} />
              <Text style={styles.settingLabel}>Default reminder</Text>
            </View>
            <Text style={styles.settingValue}>{profile?.defaultReminderMinutes || 30} min before</Text>
          </View>

          {/* Clear Data */}
          <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
            <View style={styles.settingLeft}>
              <Ionicons name="trash-outline" size={22} color={COLORS.error} />
              <Text style={[styles.settingLabel, { color: COLORS.error }]}>
                Clear all data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Mood Selection Modal */}
      <Modal
        visible={showMoodModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoodModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMoodModal(false)}
        >
          <View style={styles.moodModalContent}>
            <Text style={styles.moodModalTitle}>How was your day?</Text>
            <View style={styles.moodOptions}>
              {[1, 2, 3, 4, 5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={styles.moodOption}
                  onPress={() => handleMoodSelect(rating)}
                >
                  <Text style={styles.moodStarLarge}>
                    {Array(rating).fill('★').join('')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: SPACING.lg,
  },
  userName: {
    fontSize: 28,
    fontFamily: FONTS.serifRegular,
    color: COLORS.textPrimary,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  nameInput: {
    fontSize: 28,
    fontFamily: FONTS.serifRegular,
    color: COLORS.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    minWidth: 150,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  moodWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodDay: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moodDayLabel: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  moodCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.noneBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodCircleToday: {
    backgroundColor: COLORS.textPrimary,
  },
  moodCircleFilled: {
    backgroundColor: '#FEF3C7',
  },
  moodStar: {
    fontSize: 16,
    color: '#F59E0B',
  },
  streakRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  streakBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  streakBoxRight: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  streakNumber: {
    fontSize: 36,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  streakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodModalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    width: '80%',
    alignItems: 'center',
  },
  moodModalTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  moodOptions: {
    width: '100%',
    gap: SPACING.sm,
  },
  moodOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.noneBg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  moodStarLarge: {
    fontSize: 24,
    color: '#F59E0B',
  },
});
