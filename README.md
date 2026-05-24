# PixelKit 📸

Aplikasi image toolkit lengkap dengan AI Colorize, Upscale, Enhance, Resize, Convert, ASCII Art, QR Studio, dan Filter.

---

## 🚀 Cara Build APK via GitHub (Tanpa PC/Mac!)

### Langkah 1 — Upload ke GitHub

1. Buat akun di [github.com](https://github.com) jika belum punya
2. Buat repository baru: **New Repository** → nama `PixelKit` → **Create**
3. Upload semua file ini ke repository tersebut

### Langkah 2 — Jalankan Build

1. Di repository GitHub, klik tab **Actions**
2. Klik workflow **"Build Android APK"**
3. Klik **"Run workflow"** → **Run workflow**
4. Tunggu ~10-15 menit

### Langkah 3 — Download APK

1. Setelah build selesai (✓ hijau), klik build tersebut
2. Scroll ke bawah ke bagian **Artifacts**
3. Download **PixelKit-debug-apk**
4. Extract ZIP → install `app-debug.apk` di HP

---

## ⚙️ Fitur

| Fitur | Deskripsi | Butuh Token |
|-------|-----------|-------------|
| 🎨 Colorize | Warnai foto B&W via AI | ✅ HF Token |
| ✨ AI Upscale | Tingkatkan resolusi | ✅ HF Token |
| ⚡ Enhance | Sharpen + kontras + brightness | ❌ |
| ↔️ Resize | Ubah ukuran gambar | ❌ |
| 🔄 Convert | Ganti format JPG/PNG/WEBP | ❌ |
| 🅰️ ASCII Studio | Foto jadi ASCII art | ❌ |
| ▣ QR Studio | Buat QR code dari teks/URL | ❌ |
| 🌈 Filter | Vintage, sepia, vivid, dll | ❌ |

---

## 🔑 Setup Hugging Face Token (untuk Colorize & Upscale)

1. Daftar gratis di [huggingface.co](https://huggingface.co)
2. Klik foto profil → **Settings** → **Access Tokens**
3. Klik **New Token** → pilih role **Read** → salin token
4. Di app, tap tombol **🔑 HF Token** di pojok kanan atas
5. Paste token → **Simpan**

> **Kenapa HF dan bukan API lain?**  
> Model computer vision di Hugging Face tidak punya content filter seperti LLM API — aman untuk foto budaya, foto lama, pakaian adat, dll.

---

## 🏗️ Struktur Project

```
PixelKit/
├── .github/
│   └── workflows/
│       └── build-apk.yml      ← GitHub Actions build script
├── android/                   ← Android native code
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx     ← Halaman utama + grid tools
│   │   ├── ToolScreen.tsx     ← Panel opsi tiap tool
│   │   └── ResultScreen.tsx   ← Tampilkan & download hasil
│   ├── utils/
│   │   ├── theme.ts           ← Warna & spacing
│   │   ├── tools.ts           ← Daftar tools
│   │   └── hfApi.ts           ← Hugging Face API client
│   └── hooks/
│       └── useHFToken.ts      ← Simpan token ke storage
├── App.tsx                    ← Root + navigation
├── index.js                   ← Entry point
└── package.json
```

---

## 🔐 Build Release APK (Opsional, untuk distribusi)

Untuk build APK yang bisa diupload ke Play Store, tambahkan secrets di GitHub:

1. Buat keystore: `keytool -genkey -v -keystore release.keystore -alias pixelkit -keyalg RSA -keysize 2048 -validity 10000`
2. Encode: `base64 release.keystore` (Linux/Mac) atau pakai tools online
3. Di GitHub → **Settings** → **Secrets and variables** → **Actions** → tambahkan:
   - `KEYSTORE_BASE64` — hasil base64 keystore
   - `KEYSTORE_PASSWORD` — password keystore
   - `KEY_ALIAS` — alias (pixelkit)
   - `KEY_PASSWORD` — password key

---

## 📱 Minimum Requirements

- Android 7.0+ (API 24+)
- Internet untuk fitur AI (Colorize, Upscale)
- Storage permission untuk simpan hasil

---

## 🛠️ Development Lokal (Opsional)

```bash
# Install dependencies
npm install

# Jalankan Metro bundler
npm start

# Build & install ke device/emulator
npm run android
```

Requirements: Node 18+, Java 17, Android SDK, Android device/emulator
