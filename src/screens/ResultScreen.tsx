import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import {Colors, Spacing, Radius} from '../utils/theme';
import {RootStackParamList} from '../../App';

type Nav = StackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;

const {width} = Dimensions.get('window');

const TOOL_LABELS: Record<string, string> = {
  colorize: '🎨 Colorize',
  upscale: '✨ AI Upscale',
  enhance: '⚡ Enhance',
  resize: '↔️ Resize',
  convert: '🔄 Convert',
  ascii: '🅰️ ASCII Studio',
  qr: '▣ QR Studio',
  filter: '🌈 Filter',
};

export default function ResultScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {resultUri, tool} = route.params;

  const [saved, setSaved] = useState(false);
  const qrRef = useRef<any>(null);

  const isQr = resultUri.startsWith('qr:');
  const qrText = isQr ? resultUri.replace('qr:', '') : '';
  const imageUri = !isQr ? resultUri : null;

  const handleDownload = async () => {
    try {
      if (isQr) {
        // Save QR via svg ref
        Alert.alert('Info', 'Gunakan tombol Share untuk menyimpan QR code.');
        return;
      }

      const destPath = `${RNFS.PicturesDirectoryPath}/PixelKit_${Date.now()}.jpg`;
      await RNFS.copyFile(imageUri!.replace('file://', ''), destPath);
      setSaved(true);
      Alert.alert('Tersimpan! ✓', `File disimpan ke Gallery:\n${destPath}`);
    } catch (err: any) {
      Alert.alert('Gagal menyimpan', err.message);
    }
  };

  const handleShare = async () => {
    try {
      if (isQr) {
        await Share.share({message: `QR Code untuk: ${qrText}`});
        return;
      }
      await Share.share({
        url: imageUri!,
        message: `Hasil ${TOOL_LABELS[tool]} dari PixelKit`,
        title: 'PixelKit Result',
      });
    } catch (err: any) {
      Alert.alert('Gagal share', err.message);
    }
  };

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hasil</Text>
        <View style={styles.doneTag}>
          <Text style={styles.doneText}>✓ Selesai</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Result display */}
        <View style={styles.resultLabel}>
          <Text style={styles.sectionLabel}>HASIL</Text>
          <Text style={styles.successLabel}>✓ Selesai</Text>
        </View>

        <View style={styles.resultWrap}>
          {isQr ? (
            <View style={styles.qrWrap}>
              <QRCode
                value={qrText}
                size={240}
                color="#000"
                backgroundColor="#fff"
                getRef={ref => (qrRef.current = ref)}
              />
              <Text style={styles.qrText}>{qrText}</Text>
            </View>
          ) : (
            <Image
              source={{uri: imageUri!}}
              style={styles.resultImg}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Action buttons */}
        <TouchableOpacity
          style={[styles.downloadBtn, saved && styles.downloadBtnSaved]}
          onPress={handleDownload}>
          <Text style={[styles.downloadBtnText, saved && styles.downloadBtnTextSaved]}>
            {saved ? '✓ Tersimpan di Gallery' : '⬇️ Simpan ke Gallery'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnText}>↗️ Bagikan</Text>
        </TouchableOpacity>

        {/* Back to home */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => nav.navigate('Home')}>
          <Text style={styles.homeBtnText}>← Kembali ke Home</Text>
        </TouchableOpacity>

        <View style={{height: insets.bottom + Spacing.xxl}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: Colors.bg},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {color: Colors.text, fontSize: 20},
  headerTitle: {fontSize: 16, fontWeight: '700', color: Colors.text},
  doneTag: {
    backgroundColor: 'rgba(74,222,128,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  doneText: {fontSize: 11, color: Colors.success, fontWeight: '600'},
  scroll: {padding: Spacing.xxl},
  resultLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: Colors.muted,
  },
  successLabel: {fontSize: 10, color: Colors.success, fontWeight: '600'},
  resultWrap: {
    backgroundColor: Colors.surface2,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  resultImg: {
    width: width - Spacing.xxl * 2,
    height: 280,
    borderRadius: Radius.lg,
  },
  qrWrap: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  qrText: {
    color: Colors.muted,
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 260,
  },
  downloadBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  downloadBtnSaved: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(74,222,128,0.08)',
  },
  downloadBtnText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  downloadBtnTextSaved: {color: Colors.success},
  shareBtn: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  shareBtnText: {color: Colors.text, fontWeight: '600', fontSize: 14},
  homeBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  homeBtnText: {color: Colors.muted, fontSize: 13},
});
