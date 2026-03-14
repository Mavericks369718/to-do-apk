// TaskFlow Note Editor Screen
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../src/context/DataContext';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW, getTagColor } from '../src/constants/theme';
import { Note, TAG_LABELS } from '../src/constants/types';
import { v4 as uuidv4 } from 'uuid';

const TAGS: Note['tag'][] = ['work', 'personal', 'ideas', 'none'];

export default function NoteEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ noteId?: string }>();
  const { notes, addNote, updateNote } = useData();

  const existingNote = useMemo(() => {
    if (params.noteId) {
      return notes.find(n => n.id === params.noteId);
    }
    return null;
  }, [params.noteId, notes]);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tag, setTag] = useState<Note['tag']>('none');

  // Initialize form with existing note
  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setBody(existingNote.body);
      setTag(existingNote.tag);
    }
  }, [existingNote]);

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      Alert.alert('Empty Note', 'Please add a title or content to save.');
      return;
    }

    const note: Note = {
      id: existingNote?.id || uuidv4(),
      title: title.trim() || 'Untitled',
      body: body.trim(),
      tag,
      pinned: existingNote?.pinned || false,
      createdAt: existingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingNote) {
      await updateNote(note);
    } else {
      await addNote(note);
    }

    router.back();
  };

  const cycleTag = () => {
    const currentIndex = TAGS.indexOf(tag);
    setTag(TAGS[(currentIndex + 1) % TAGS.length]);
  };

  const tagColors = getTagColor(tag);

  const formatDate = () => {
    const date = existingNote ? new Date(existingNote.updatedAt) : new Date();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Rich text toolbar actions (simplified)
  const handleBold = () => {
    setBody(body + '**bold text**');
  };

  const handleItalic = () => {
    setBody(body + '*italic text*');
  };

  const handleUnderline = () => {
    setBody(body + '__underlined text__');
  };

  const handleBulletList = () => {
    setBody(body + '\n- Item 1\n- Item 2\n- Item 3');
  };

  const handleNumberedList = () => {
    setBody(body + '\n1. Item 1\n2. Item 2\n3. Item 3');
  };

  const handleCheckbox = () => {
    setBody(body + '\n[ ] Task item');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {/* Tag Selector */}
          <TouchableOpacity style={styles.tagRow} onPress={cycleTag}>
            <View style={[styles.tagPill, { backgroundColor: tagColors.bg }]}>
              <Text style={[styles.tagText, { color: tagColors.color }]}>
                {TAG_LABELS[tag]}
              </Text>
            </View>
            <Text style={styles.dateText}>{formatDate()}</Text>
          </TouchableOpacity>

          {/* Body Input */}
          <TextInput
            style={styles.bodyInput}
            placeholder="Start writing..."
            placeholderTextColor={COLORS.textMuted}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        {/* Rich Text Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.toolButton} onPress={handleBold}>
            <Text style={styles.toolButtonTextBold}>B</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={handleItalic}>
            <Text style={styles.toolButtonTextItalic}>I</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={handleUnderline}>
            <Text style={styles.toolButtonTextUnderline}>U</Text>
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolButton} onPress={handleBulletList}>
            <Ionicons name="list" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={handleNumberedList}>
            <Ionicons name="reorder-three" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={handleCheckbox}>
            <Ionicons name="checkbox-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton}>
            <Ionicons name="image-outline" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: FONTS.sansSemiBold,
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 100,
  },
  titleInput: {
    fontSize: 32,
    fontFamily: FONTS.serifRegular,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    lineHeight: 40,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tagPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
  },
  bodyInput: {
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 300,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  toolButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  toolButtonTextBold: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
    color: COLORS.textSecondary,
  },
  toolButtonTextItalic: {
    fontSize: 18,
    fontStyle: 'italic',
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
  },
  toolButtonTextUnderline: {
    fontSize: 18,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  toolDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
});
