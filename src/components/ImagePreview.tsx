import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {Colors, Spacing, Radius} from '../utils/theme';

interface Props {
  uri: string | null;
  onPick: () => void;
  onRemove: () => void;
}

export default function ImagePreview({uri, onPick, onRemove}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={uri ? 1 : 0.8}
      style={[styles.zone, uri && styles.zoneHasImage]}
      onPress={uri ? undefined : onPick}>
      {uri ? (
        <View style={styles.previewWrap}>
          <Image source={{uri}} style={styles.img} resizeMode="cover" />
          <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Foto terpilih ✓</Text>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🖼️</Text>
          <Text style={styles.emptyTitle}>Tap untuk upload foto</Text>
          <Text style={styles.emptySub}>JPG, PNG, WEBP</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  zone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  zoneHasImage: {
    borderStyle: 'solid',
    minHeight: 220,
  },
  previewWrap: {width: '100%', position: 'relative'},
  img: {width: '100%', height: 220, borderRadius: Radius.lg},
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  overlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  overlayText: {color: Colors.success, fontSize: 11, fontWeight: '600'},
  empty: {alignItems: 'center', padding: Spacing.xxl},
  emptyIcon: {fontSize: 40, marginBottom: Spacing.md},
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySub: {fontSize: 12, color: Colors.muted},
});
