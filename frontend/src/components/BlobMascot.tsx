// TaskFlow Blob Mascot Component
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface BlobMascotProps {
  size?: number;
  style?: any;
}

export const BlobMascot: React.FC<BlobMascotProps> = ({ size = 80, style }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const eyeSize = size * 0.08;
  const eyeOffsetX = size * 0.12;
  const eyeOffsetY = size * 0.1;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: bounceAnim }] },
        style,
      ]}
    >
      <View style={[styles.blobContainer, { width: size, height: size * 1.1 }]}>
        <Svg width={size} height={size * 1.1} viewBox="0 0 100 110">
          {/* Main blob body */}
          <Path
            d="M50 10 C80 10 95 30 95 55 C95 80 75 95 50 95 C25 95 5 80 5 55 C5 30 20 10 50 10"
            fill="url(#blobGradient)"
          />
          {/* Speech bubble tail */}
          <Path
            d="M60 90 Q70 100 65 108 Q55 102 55 92"
            fill="white"
            opacity={0.9}
          />
          {/* Define gradient */}
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>
        </Svg>
        {/* Eyes */}
        <View style={[
          styles.eye,
          {
            width: eyeSize,
            height: eyeSize,
            left: size / 2 - eyeOffsetX - eyeSize / 2,
            top: size * 0.35,
          }
        ]} />
        <View style={[
          styles.eye,
          {
            width: eyeSize,
            height: eyeSize,
            left: size / 2 + eyeOffsetX - eyeSize / 2,
            top: size * 0.35,
          }
        ]} />
        {/* Blush cheeks */}
        <View style={[
          styles.blush,
          {
            width: eyeSize * 1.5,
            height: eyeSize * 0.8,
            left: size / 2 - eyeOffsetX * 1.8,
            top: size * 0.48,
          }
        ]} />
        <View style={[
          styles.blush,
          {
            width: eyeSize * 1.5,
            height: eyeSize * 0.8,
            left: size / 2 + eyeOffsetX * 0.8,
            top: size * 0.48,
          }
        ]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobContainer: {
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    backgroundColor: '#1F2937',
    borderRadius: 100,
  },
  blush: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 182, 193, 0.5)',
    borderRadius: 100,
  },
});
