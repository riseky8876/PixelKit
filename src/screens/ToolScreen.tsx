import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors, Spacing, Radius} from '../utils/theme';
import {callHuggingFace, HF_MODELS} from '../utils/hfApi';
import {useHFToken} from '../hooks/useHFToken';
import {RootStackParamList} from '../../App';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

type Nav = StackNavigationProp<RootStackParamList, 'Tool'>;
type Route = RouteProp<RootStackParamList, 'Tool'>;

const TOOL_LABELS: Record<string, string> = {
  colorize: '🎨 Colorize',
  upscale: '✨ AI Upscale',
  enhance: '⚡ Enhance',
  resize: '↔️ Resize Image',
  convert: '🔄 Convert',
  ascii: '🅰️ ASCII Studio',
  qr: '▣ QR Studio',
  filter: '🌈 Filter',
};

const RUN_LABELS: Record<string, string> = {
  colorize: '🎨 Warnai Foto Sekarang',
  upscale: '✨ Upscale Sekarang',
  enhance: '⚡ Enhance Sekarang',
  resize: '↔️ Resize Sekarang',
  convert: '🔄 Convert Sekarang',
  ascii: '🅰️ Buat ASCII Art',
  qr: '▣ Generate QR Code',
  filter: '🌈 Apply Filter',
};

export default function ToolScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const {tool, imageUri} = route.params;
  const {token} = useHFToken();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('Memproses...');

  // Tool option states
  const [colorizeMode, setColorizeMode] = useState<'hf' | 'canvas'>('hf');
  const [upscaleScale] = useState('4');
  const [sharpness, setSharpness] = useState(5);
  const [contrast, setContrast] = useState(110);
  const [brightness, setBrightness] = useState(100);
  const [resizeW, setResizeW] = useState('');
  const [resizeH, setResizeH] = useState('');
  const [resizeMode, setResizeMode] = useState('fit');
  const [convertFormat, setConvertFormat] = useState<'JPEG' | 'PNG' | 'WEBP'>('JPEG');
  const [quality, setQuality] = useState(92);
  const [asciiRes, setAsciiRes] = useState('120');
  const [qrMode, setQrMode] = useState<'create' | 'scan'>('create');
  const [qrText, setQrText] = useState('');
  const [qrSize, setQrSize] = useState('300');
  const [filterPreset, setFilterPreset] = useState('vintage');

  const runTool = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    try {
      let resultUri = '';

      switch (tool) {
        case 'colorize':
          resultUri = await runColorize();
          break;
        case 'upscale':
          resultUri = await runUpscale();
          break;
        case 'resize':
          resultUri = await runResize();
          break;
        case 'convert':
          resultUri = await runConvert();
          break;
        case 'enhance':
        case 'filter':
        case 'ascii':
          // These use imageUri directly with metadata passed via params
          resultUri = imageUri || '';
          break;
        case 'qr':
          resultUri = 'qr:' + qrText;
          break;
      }

      setLoading(false);
      if (resultUri) {
        nav.navigate('Result', {resultUri, tool});
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Error', err.message || 'Terjadi kesalahan');
    }
  }, [tool, imageUri, colorizeMode, token, qrText, resizeW, resizeH, resizeMode, convertFormat, quality]);

  const runColorize = async () => {
    if (colorizeMode === 'hf') {
      setProgressMsg('Mengirim ke Hugging Face AI...');
      return await callHuggingFace(
        HF_MODELS.colorize,
        imageUri!,
        token,
        p => setProgress(p),
      );
    } else {
      // Pass as-is, ResultScreen will do canvas sepia
      return 'sepia:' + imageUri;
    }
  };

  const runUpscale = async () => {
    setProgressMsg('Mengirim ke model Upscale AI...');
    return await callHuggingFace(
      HF_MODELS.upscale,
      imageUri!,
      token,
      p => setProgress(p),
    );
  };

  const runResize = async () => {
    const w = parseInt(resizeW) || 800;
    const h = parseInt(resizeH) || 600;
    setProgressMsg('Mengubah ukuran...');
    setProgress(30);
    const result = await ImageResizer.createResizedImage(
      imageUri!,
      w,
      h,
      'JPEG',
      90,
      0,
      RNFS.CachesDirectoryPath,
    );
    setProgress(100);
    return result.uri;
  };

  const runConvert = async () => {
    setProgressMsg('Mengkonversi format...');
    setProgress(30);
    const result = await ImageResizer.createResizedImage(
      imageUri!,
      2000,
      2000,
      convertFormat,
      quality,
      0,
      RNFS.CachesDirectoryPath,
    );
    setProgress(100);
    return result.uri;
  };

  const renderOptions = () => {
    switch (tool) {
      case 'colorize':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Mode Colorize</Text>
            <SegmentedControl
              options={[
                {label: 'HF AI (Akurat)', value: 'hf'},
                {label: 'Offline (Sepia)', value: 'canvas'},
              ]}
              value={colorizeMode}
              onChange={v => setColorizeMode(v as any)}
            />
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Mode HF AI menggunakan model{' '}
                <Text style={styles.infoAccent}>ioclab/ioclab-colorization</Text>{' '}
                — tidak ada content filter, aman untuk foto budaya/lama.
              </Text>
            </View>
          </View>
        );

      case 'upscale':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Skala Upscale</Text>
            <SegmentedControl
              options={[
                {label: '2× Cepat', value: '2'},
                {label: '4× Kualitas', value: '4'},
              ]}
              value={upscaleScale}
              onChange={() => {}}
            />
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Model:{' '}
                <Text style={styles.infoAccent}>caidas/swin2SR-realworld-sr-x4-64</Text>
              </Text>
            </View>
          </View>
        );

      case 'enhance':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Pengaturan Enhance</Text>
            <SliderRow
              label="Ketajaman"
              value={sharpness}
              min={0}
              max={10}
              onChange={setSharpness}
            />
            <SliderRow
              label={`Kontras: ${contrast}%`}
              value={contrast}
              min={50}
              max={200}
              onChange={setContrast}
            />
            <SliderRow
              label={`Kecerahan: ${brightness}%`}
              value={brightness}
              min={50}
              max={200}
              onChange={setBrightness}
            />
          </View>
        );

      case 'resize':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Ukuran Baru</Text>
            <View style={styles.row2}>
              <View style={styles.halfInput}>
                <Text style={styles.optLabel}>Lebar (px)</Text>
                <TextInput
                  style={styles.input}
                  value={resizeW}
                  onChangeText={setResizeW}
                  placeholder="800"
                  placeholderTextColor={Colors.muted}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.optLabel}>Tinggi (px)</Text>
                <TextInput
                  style={styles.input}
                  value={resizeH}
                  onChangeText={setResizeH}
                  placeholder="600"
                  placeholderTextColor={Colors.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <Text style={styles.optLabel}>Mode</Text>
            <SegmentedControl
              options={[
                {label: 'Stretch', value: 'stretch'},
                {label: 'Fit', value: 'fit'},
                {label: 'Fill+Crop', value: 'fill'},
              ]}
              value={resizeMode}
              onChange={setResizeMode}
            />
          </View>
        );

      case 'convert':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Konversi Format</Text>
            <Text style={styles.optLabel}>Format Output</Text>
            <SegmentedControl
              options={[
                {label: 'JPEG', value: 'JPEG'},
                {label: 'PNG', value: 'PNG'},
                {label: 'WEBP', value: 'WEBP'},
              ]}
              value={convertFormat}
              onChange={v => setConvertFormat(v as any)}
            />
            <SliderRow
              label={`Kualitas: ${quality}%`}
              value={quality}
              min={10}
              max={100}
              onChange={setQuality}
            />
          </View>
        );

      case 'ascii':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Pengaturan ASCII</Text>
            <Text style={styles.optLabel}>Resolusi Karakter</Text>
            <SegmentedControl
              options={[
                {label: 'Rendah', value: '80'},
                {label: 'Sedang', value: '120'},
                {label: 'Tinggi', value: '180'},
              ]}
              value={asciiRes}
              onChange={setAsciiRes}
            />
          </View>
        );

      case 'qr':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>QR Studio</Text>
            <SegmentedControl
              options={[
                {label: 'Buat QR', value: 'create'},
                {label: 'Scan QR', value: 'scan'},
              ]}
              value={qrMode}
              onChange={v => setQrMode(v as any)}
            />
            {qrMode === 'create' && (
              <>
                <Text style={[styles.optLabel, {marginTop: Spacing.md}]}>
                  Teks / URL
                </Text>
                <TextInput
                  style={styles.input}
                  value={qrText}
                  onChangeText={setQrText}
                  placeholder="https://example.com"
                  placeholderTextColor={Colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.optLabel}>Ukuran</Text>
                <SegmentedControl
                  options={[
                    {label: '200px', value: '200'},
                    {label: '300px', value: '300'},
                    {label: '400px', value: '400'},
                  ]}
                  value={qrSize}
                  onChange={setQrSize}
                />
              </>
            )}
          </View>
        );

      case 'filter':
        return (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Filter & Efek</Text>
            <Text style={styles.optLabel}>Pilih Filter</Text>
            <View style={styles.filterGrid}>
              {[
                {value: 'vintage', label: 'Vintage'},
                {value: 'bw', label: 'B&W'},
                {value: 'sepia', label: 'Sepia'},
                {value: 'vivid', label: 'Vivid'},
                {value: 'cold', label: 'Cold'},
                {value: 'warm', label: 'Warm'},
                {value: 'dramatic', label: 'Dramatic'},
                {value: 'none', label: 'Normal'},
              ].map(f => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.filterChip,
                    filterPreset === f.value && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterPreset(f.value)}>
                  <Text
                    style={[
                      styles.filterChipText,
                      filterPreset === f.value && styles.filterChipTextActive,
                    ]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canRun = tool === 'qr' ? (qrMode === 'create' ? qrText.trim().length > 0 : !!imageUri) : !!imageUri;

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => nav.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{TOOL_LABELS[tool] || tool}</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {renderOptions()}

        {/* Progress */}
        {loading && (
          <View style={styles.progressWrap}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {width: `${progress}%`}]} />
            </View>
            <Text style={styles.progressMsg}>{progressMsg}</Text>
          </View>
        )}

        {/* Run button */}
        <TouchableOpacity
          style={[styles.runBtn, (!canRun || loading) && styles.runBtnDisabled]}
          onPress={runTool}
          disabled={!canRun || loading}
          activeOpacity={0.85}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={Colors.bg} />
              <Text style={styles.runBtnText}>Memproses...</Text>
            </View>
          ) : (
            <Text style={styles.runBtnText}>
              {RUN_LABELS[tool] || 'Proses'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{height: insets.bottom + Spacing.xxl}} />
      </ScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: {label: string; value: string}[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={seg.wrap}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[seg.btn, value === opt.value && seg.btnActive]}
          onPress={() => onChange(opt.value)}>
          <Text style={[seg.text, value === opt.value && seg.textActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const seg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: Colors.surface2,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  btnActive: {backgroundColor: Colors.surface},
  text: {fontSize: 12, color: Colors.muted},
  textActive: {color: Colors.text, fontWeight: '600'},
});

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  // React Native doesn't have a built-in Slider — use a simple row with buttons
  const step = Math.max(1, Math.floor((max - min) / 20));
  return (
    <View style={slider.wrap}>
      <Text style={slider.label}>{label}</Text>
      <View style={slider.row}>
        <TouchableOpacity
          style={slider.stepBtn}
          onPress={() => onChange(Math.max(min, value - step))}>
          <Text style={slider.stepText}>−</Text>
        </TouchableOpacity>
        <View style={slider.track}>
          <View
            style={[
              slider.fill,
              {width: `${((value - min) / (max - min)) * 100}%`},
            ]}
          />
        </View>
        <TouchableOpacity
          style={slider.stepBtn}
          onPress={() => onChange(Math.min(max, value + step))}>
          <Text style={slider.stepText}>+</Text>
        </TouchableOpacity>
        <Text style={slider.val}>{value}</Text>
      </View>
    </View>
  );
}

const slider = StyleSheet.create({
  wrap: {marginBottom: Spacing.md},
  label: {fontSize: 12, color: Colors.muted, marginBottom: 6},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  stepBtn: {
    width: 32,
    height: 32,
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepText: {color: Colors.text, fontSize: 18, lineHeight: 20},
  track: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.surface2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {height: '100%', backgroundColor: Colors.accent, borderRadius: 4},
  val: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
});

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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  scroll: {padding: Spacing.xxl},
  panel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoBox: {
    backgroundColor: 'rgba(91,143,255,0.08)',
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoText: {fontSize: 11, color: Colors.muted, lineHeight: 17},
  infoAccent: {color: Colors.accent2, fontWeight: '600'},
  optLabel: {fontSize: 12, color: Colors.muted, marginBottom: 6},
  row2: {flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md},
  halfInput: {flex: 1},
  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    color: Colors.text,
    padding: Spacing.md,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  filterChipActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(232,197,71,0.12)',
  },
  filterChipText: {fontSize: 12, color: Colors.muted},
  filterChipTextActive: {color: Colors.accent, fontWeight: '600'},
  progressWrap: {marginBottom: Spacing.lg},
  progressBar: {
    height: 3,
    backgroundColor: Colors.surface2,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent2,
    borderRadius: 3,
  },
  progressMsg: {fontSize: 12, color: Colors.muted, textAlign: 'center'},
  runBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  runBtnDisabled: {opacity: 0.4},
  runBtnText: {
    color: Colors.bg,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
