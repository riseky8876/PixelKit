import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius, Spacing} from '../utils/theme';
import {ToastType} from '../hooks/useToast';

interface Props {
  message: string;
  type: ToastType;
  visible: boolean;
}

export default function Toast({message, type, visible}: Props) {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const borderColor =
    type === 'success'
      ? Colors.success
      : type === 'error'
      ? Colors.danger
      : Colors.border;

  const textColor =
    type === 'success'
      ? Colors.success
      : type === 'error'
      ? Colors.danger
      : Colors.text;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {transform: [{translateY}], opacity, borderColor},
      ]}
      pointerEvents="none">
      <Text style={[styles.text, {color: textColor}]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    maxWidth: '90%',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  text: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
