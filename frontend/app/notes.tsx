// TaskFlow Notes Screen
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../src/context/DataContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW } from '../src/constants/theme';
import { Note } from '../src/constants/types';
import { NoteCard, BlobMascot } from '../src/components';

export default function NotesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notes, isLoading, deleteNote, toggleNotePin, refreshAll } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  }, [refreshAll]);

  // Filter and group notes
  const { pinnedNotes, recentNotes } = useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = notes.filter(
        n =>
          n.title.toLowerCase().includes(query) ||
          n.body.toLowerCase().includes(query)
      );
    }

    // Sort by updated date (most recent first)
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return {
      pinnedNotes: sorted.filter(n => n.pinned),
      recentNotes: sorted.filter(n => !n.pinned),
    };
  }, [notes, searchQuery]);

  const handleNotePress = (note: Note) => {
    router.push({
      pathname: '/note-editor',
      params: { noteId: note.id },
    });
  };

  const handleAddNote = () => {
    router.push('/note-editor');
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
        <Text style={styles.title}>Notes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddNote}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notes List */}
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
        {/* Pinned Section */}
        {pinnedNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PINNED</Text>
            {pinnedNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={handleNotePress}
                onDelete={deleteNote}
                onTogglePin={toggleNotePin}
              />
            ))}
          </View>
        )}

        {/* Recent Section */}
        {recentNotes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RECENT</Text>
            {recentNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onPress={handleNotePress}
                onDelete={deleteNote}
                onTogglePin={toggleNotePin}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {notes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No notes yet!</Text>
            <Text style={styles.emptySubtitle}>Tap + to create your first note</Text>
          </View>
        )}

        {/* No Results */}
        {notes.length > 0 && pinnedNotes.length === 0 && recentNotes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
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
  title: {
    fontSize: 36,
    fontFamily: FONTS.serifRegular,
    color: COLORS.textPrimary,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.md,
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
