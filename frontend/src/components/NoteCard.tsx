// TaskFlow Note Card Component
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
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOW, getTagColor } from '../constants/theme';
import { Note, TAG_LABELS } from '../constants/types';

interface NoteCardProps {
  note: Note;
  onPress: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onPress,
  onDelete,
  onTogglePin,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteButtonOpacity = useRef(new Animated.Value(0)).current;

  const tagColors = getTagColor(note.tag);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
          onPress={() => onDelete(note.id)}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => onPress(note)}
          onLongPress={() => onTogglePin(note.id)}
          activeOpacity={0.7}
        >
          {/* Pin Icon */}
          {note.pinned && (
            <View style={styles.pinIcon}>
              <Ionicons name="pin" size={16} color={COLORS.primary} />
            </View>
          )}

          {/* Title */}
          <Text style={styles.noteTitle} numberOfLines={1}>
            {note.title || 'Untitled'}
          </Text>

          {/* Preview */}
          <Text style={styles.notePreview} numberOfLines={2}>
            {note.body || 'No content'}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            {note.tag !== 'none' && (
              <View style={[styles.tagBadge, { backgroundColor: tagColors.bg }]}>
                <Text style={[styles.tagText, { color: tagColors.color }]}>
                  {TAG_LABELS[note.tag]}
                </Text>
              </View>
            )}
            <Text style={styles.timestamp}>{formatDate(note.updatedAt)}</Text>
          </View>
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
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.card,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  pinIcon: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  noteTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    paddingRight: SPACING.xl,
  },
  notePreview: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  tagText: {
    fontSize: 10,
    fontFamily: FONTS.sansSemiBold,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
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
