import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View, Text} from 'react-native';
import {Colors, Radius, Spacing} from '../utils/theme';

interface Props {
  progress: number; // 0–100
  message?: string;
  visible: boolean;
}

export default function ProgressBar({progress, message, visible}: Props) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginBottom: Spacing.lg},
  track: {
    height: 3,
    backgroundColor: Colors.surface2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent2,
    borderRadius: Radius.sm,
  },
  msg: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: 'center',
  },
});
