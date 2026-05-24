import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Colors, Spacing, Radius} from '../utils/theme';
import {Tool} from '../utils/tools';

const {width} = Dimensions.get('window');
const CARD_SIZE = (width - Spacing.xxl * 2 - Spacing.md) / 2;

interface Props {
  tool: Tool;
  onPress: (id: string) => void;
}

export default function ToolCard({tool, onPress}: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(tool.id)}
      activeOpacity={0.72}>
      {tool.badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{tool.badge}</Text>
        </View>
      )}
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{tool.icon}</Text>
      </View>
      <Text style={styles.name}>{tool.name}</Text>
      <Text style={styles.desc}>{tool.desc}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.bg,
    letterSpacing: 0.5,
  },
  iconWrap: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surface2,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: {fontSize: 18},
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  desc: {fontSize: 11, color: Colors.muted},
});
