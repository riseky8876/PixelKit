import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {launchImageLibrary} from 'react-native-image-picker';
import {Colors, Spacing, Radius} from '../utils/theme';
import {TOOLS} from '../utils/tools';
import {useHFToken} from '../hooks/useHFToken';
import {RootStackParamList} from '../../App';

type Nav = StackNavigationProp<RootStackParamList, 'Home'>;
const {width} = Dimensions.get('window');
const CARD_SIZE = (width - Spacing.xxl * 2 - Spacing.md) / 2;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const {token, saveToken} = useHFToken();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tokenModal, setTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const pickImage = useCallback(() => {
    if (imageUri) return;
    launchImageLibrary(
      {mediaType: 'photo', quality: 1, includeBase64: false},
      res => {
        if (res.assets && res.assets[0]?.uri) {
          setImageUri(res.assets[0].uri);
        }
      },
    );
  }, [imageUri]);

  const removeImage = useCallback(() => {
    setImageUri(null);
  }, []);

  const handleToolPress = useCallback(
    (toolId: string) => {
      const tool = TOOLS.find(t => t.id === toolId);
      if (!tool) return;

      // QR create doesn't need image
      if (tool.requiresImage && !imageUri) {
        Alert.alert(
          'Upload Foto Dulu',
          'Tap area foto di atas untuk pilih gambar.',
          [{text: 'OK'}],
        );
        return;
      }

      if (tool.requiresHFToken && !token) {
        Alert.alert(
          'Butuh HF Token',
          'Fitur ini memerlukan Hugging Face API token. Set token dulu?',
          [
            {text: 'Batal', style: 'cancel'},
            {
              text: 'Set Token',
              onPress: () => {
                setTokenInput('');
                setTokenModal(true);
              },
            },
          ],
        );
        return;
      }

      nav.navigate('Tool', {tool: toolId, imageUri: imageUri || undefined});
    },
    [imageUri, token, nav],
  );

  const handleSaveToken = () => {
    if (!tokenInput.trim()) {
      Alert.alert('Error', 'Masukkan token dulu');
      return;
    }
    saveToken(tokenInput.trim());
    setTokenModal(false);
    Alert.alert('Berhasil', 'Token tersimpan! ✓');
  };

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          Pixel<Text style={styles.logoAccent}>Kit</Text>
        </Text>
        <TouchableOpacity
          style={[styles.tokenBtn, token ? styles.tokenBtnSet : {}]}
          onPress={() => {
            setTokenInput(token);
            setTokenModal(true);
          }}>
          <Text style={[styles.tokenBtnText, token ? styles.tokenBtnTextSet : {}]}>
            {token ? '✓ HF Token' : '🔑 HF Token'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Upload Zone */}
        <TouchableOpacity
          activeOpacity={imageUri ? 1 : 0.8}
          style={[styles.uploadZone, imageUri && styles.uploadZoneHasImage]}
          onPress={pickImage}>
          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{uri: imageUri}} style={styles.previewImg} resizeMode="cover" />
              <TouchableOpacity style={styles.removeBtn} onPress={removeImage}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadContent}>
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadTitle}>Tap untuk upload foto</Text>
              <Text style={styles.uploadSub}>JPG, PNG, WEBP</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tools Label */}
        <Text style={styles.sectionLabel}>Pilih Fitur</Text>

        {/* Tools Grid */}
        <View style={styles.grid}>
          {TOOLS.map(tool => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => handleToolPress(tool.id)}
              activeOpacity={0.75}>
              {tool.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tool.badge}</Text>
                </View>
              )}
              <View style={styles.toolIcon}>
                <Text style={styles.toolIconText}>{tool.icon}</Text>
              </View>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolDesc}>{tool.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{height: insets.bottom + Spacing.xxl}} />
      </ScrollView>

      {/* HF Token Modal */}
      <Modal
        visible={tokenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setTokenModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setTokenModal(false)}>
          <Pressable style={styles.modal} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>🔑 Hugging Face API Token</Text>
            <Text style={styles.modalDesc}>
              Token diperlukan untuk fitur AI (Colorize, Upscale).{'\n'}
              Daftar gratis di{' '}
              <Text style={styles.modalLink}>huggingface.co</Text>
              {' '}→ Settings → Access Tokens → New Token (Read).
            </Text>
            <TextInput
              style={styles.modalInput}
              value={tokenInput}
              onChangeText={setTokenInput}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxx"
              placeholderTextColor={Colors.muted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setTokenModal(false)}>
                <Text style={styles.btnGhostText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleSaveToken}>
                <Text style={styles.btnPrimaryText}>Simpan Token</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  logoAccent: {color: Colors.accent},
  tokenBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  tokenBtnSet: {borderColor: Colors.success},
  tokenBtnText: {fontSize: 12, color: Colors.muted},
  tokenBtnTextSet: {color: Colors.success},
  scroll: {
    padding: Spacing.xxl,
  },
  // Upload
  uploadZone: {
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
  uploadZoneHasImage: {
    borderStyle: 'solid',
    minHeight: 220,
    padding: 0,
  },
  uploadContent: {alignItems: 'center', padding: Spacing.xxl},
  uploadIcon: {fontSize: 40, marginBottom: Spacing.md},
  uploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  uploadSub: {fontSize: 12, color: Colors.muted},
  previewWrap: {width: '100%', position: 'relative'},
  previewImg: {
    width: '100%',
    height: 220,
    borderRadius: Radius.lg,
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {color: Colors.white, fontSize: 14},
  // Section
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  toolCard: {
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
  toolIcon: {
    width: 36,
    height: 36,
    backgroundColor: Colors.surface2,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  toolIconText: {fontSize: 18},
  toolName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  toolDesc: {fontSize: 11, color: Colors.muted},
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.muted,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalLink: {color: Colors.accent2},
  modalInput: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    color: Colors.text,
    padding: Spacing.md,
    fontSize: 13,
    marginBottom: Spacing.md,
    fontFamily: 'monospace',
  },
  modalActions: {flexDirection: 'row', gap: Spacing.md},
  btnGhost: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnGhostText: {color: Colors.muted, fontSize: 14},
  btnPrimary: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: Colors.bg,
    fontWeight: '700',
    fontSize: 14,
  },
});
