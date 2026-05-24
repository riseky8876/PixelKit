import RNBlobUtil from 'react-native-blob-util';

const HF_API = 'https://api-inference.huggingface.co/models';

export const HF_MODELS: Record<string, string> = {
  colorize: 'ioclab/ioclab-colorization',
  upscale: 'caidas/swin2SR-realworld-sr-x4-64',
};

/**
 * Call Hugging Face Inference API with an image file.
 * Handles cold-start (503) with auto-retry after 25s.
 */
export async function callHuggingFace(
  model: string,
  imageUri: string,
  token: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!token) {
    throw new Error('Hugging Face token belum diset. Tap kunci di pojok kanan atas.');
  }

  onProgress?.(10);

  const filePath = imageUri.startsWith('file://')
    ? imageUri.replace('file://', '')
    : imageUri;

  const mimeType =
    filePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const base64 = await RNBlobUtil.fs.readFile(filePath, 'base64');
  onProgress?.(30);

  const doRequest = async (attempt: number): Promise<string> => {
    onProgress?.(attempt === 1 ? 35 : 55);

    const response = await RNBlobUtil.fetch(
      'POST',
      `${HF_API}/${model}`,
      {
        Authorization: `Bearer ${token}`,
        'Content-Type': mimeType,
      },
      base64,
    );

    const status = response.respInfo.status;

    if (status === 503) {
      if (attempt < 2) {
        onProgress?.(42);
        await new Promise<void>(resolve => setTimeout(resolve, 25000));
        return doRequest(attempt + 1);
      }
      throw new Error('Model masih loading. Coba lagi dalam 30 detik.');
    }

    if (status === 401) {
      throw new Error('Token tidak valid. Periksa HF Token kamu.');
    }

    if (status !== 200) {
      let msg = `HTTP ${status}`;
      try {
        const j = JSON.parse(response.text());
        msg = j.error || msg;
      } catch {}
      throw new Error(msg);
    }

    onProgress?.(88);

    const ext = model.includes('colorization') ? 'jpg' : 'png';
    const tempPath = `${RNBlobUtil.fs.dirs.CacheDir}/pixelkit_${Date.now()}.${ext}`;
    const b64Result = response.base64();
    await RNBlobUtil.fs.writeFile(tempPath, b64Result, 'base64');

    onProgress?.(100);
    return `file://${tempPath}`;
  };

  return doRequest(1);
}
