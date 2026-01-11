# Text-to-Speech Setup Guide

## Overview

Sistem TTS menggunakan pendekatan multi-layer dengan fallback otomatis untuk kualitas terbaik:

1. **Google Cloud TTS** (Prioritas Utama) - Kualitas terbaik, gratis 1 juta karakter/bulan
2. **Web Speech API** - Built-in browser, selalu tersedia

## Setup Google Cloud TTS (Recommended)

### Langkah 1: Buat Project di Google Cloud

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang ada
3. Enable billing (tetap gratis untuk 1M chars/month)

### Langkah 2: Enable Text-to-Speech API

1. Buka [Cloud Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com)
2. Klik "Enable API"
3. Tunggu sampai activated

### Langkah 3: Buat API Key

1. Buka [Credentials](https://console.cloud.google.com/apis/credentials)
2. Klik "Create Credentials" → "API Key"
3. Copy API key yang dihasilkan
4. (Opsional) Restrict API key untuk keamanan:
   - Application restrictions: HTTP referrers
   - API restrictions: Cloud Text-to-Speech API

### Langkah 4: Konfigurasi di Aplikasi

1. Copy `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Tambahkan API key ke `.env.local`:
   ```env
   GOOGLE_TTS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. Restart development server:
   ```bash
   npm run dev
   ```

### Langkah 5: Verifikasi

Buka browser console dan test:
```javascript
import { speak } from '@/lib/tts';
await speak('こんにちは');
```

Jika berhasil, akan terdengar suara dengan kualitas tinggi.

## Fallback Behavior

Jika Google Cloud TTS gagal atau tidak dikonfigurasi, sistem akan otomatis menggunakan Web Speech API built-in browser dengan voice Jepang terbaik yang tersedia.

## Voice Selection

### Google Cloud TTS Voices

- `ja-JP-Neural2-B` - Female, natural (default)
- `ja-JP-Neural2-C` - Male, natural
- `ja-JP-Wavenet-A` - Female, high quality
- `ja-JP-Wavenet-B` - Female, high quality
- `ja-JP-Standard-A` - Female, standard quality

### Web Speech API Voices (Browser)

Otomatis memilih voice terbaik yang tersedia:
- Microsoft Nanami (Windows)
- Microsoft Ayumi (Windows)
- Google 日本語 (Chrome)
- Kyoko (macOS)
- Otoya (macOS)

## Performance Tips

1. **Caching**: Audio results dicache otomatis untuk mengurangi API calls
2. **Preloading**: Gunakan `preloadTTS()` untuk preload text yang sering digunakan
3. **Rate Limiting**: Google Cloud TTS free tier limit: 1M chars/month

## Usage Examples

### Basic Usage
```javascript
import { speak, playAudioWithFallback } from '@/lib/tts';

// Simple TTS
await speak('漢字を勉強します');

// TTS dengan opsi
await speak('こんにちは', {
  lang: 'ja-JP',
  rate: 0.85,
  pitch: 1.0,
  volume: 1.0
});

// Audio file dengan TTS fallback
await playAudioWithFallback(
  '/audio/greeting.mp3',
  'こんにちは',
  { lang: 'ja-JP' }
);
```

### Advanced Usage
```javascript
import { speak, getJapaneseVoices, clearTTSCache } from '@/lib/tts';

// List available voices
const voices = getJapaneseVoices();
console.log(voices);

// Clear cache
clearTTSCache();

// Preload common phrases
import { preloadTTS } from '@/lib/tts';
await preloadTTS([
  'こんにちは',
  'ありがとう',
  'さようなら'
]);
```

## Troubleshooting

### Google TTS tidak bekerja

1. Cek API key di `.env.local`
2. Cek quota di [Google Cloud Console](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas)
3. Cek browser console untuk error messages

### Web Speech API tidak ada suara

1. Cek browser support (Chrome/Edge recommended)
2. Cek volume sistem
3. Test di browser lain

### Audio quality rendah

1. Pastikan Google Cloud TTS API configured
2. Cek koneksi internet
3. Clear cache dengan `clearTTSCache()`

## Cost Analysis

### Google Cloud TTS (Recommended)

| Feature | Free Tier | Paid |
|---------|-----------|------|
| Standard voices | 0-1M chars free | $4/1M chars |
| WaveNet voices | 0-1M chars free | $16/1M chars |
| Neural2 voices | 0-1M chars free | $16/1M chars |

**Estimasi**: 1 juta karakter = ~500,000 kata = ~100,000 kalimat

Untuk aplikasi pembelajaran dengan 1000 users aktif yang masing-masing speak 100 kalimat/hari = **GRATIS** (masih di bawah 1M chars/month)

### Web Speech API

**Gratis selamanya**, kualitas tergantung browser dan OS.

## Best Practices

1. ✅ Gunakan Google Cloud TTS untuk production
2. ✅ Cache hasil TTS untuk performa
3. ✅ Preload common phrases
4. ✅ Monitor usage di Google Cloud Console
5. ✅ Set API key restrictions untuk keamanan
6. ❌ Jangan expose API key di client-side
7. ❌ Jangan generate TTS untuk text > 5000 chars sekaligus

## Security Notes

- API key disimpan di server-side (`.env.local`)
- Tidak pernah exposed ke client
- Request melalui API endpoint `/api/tts/google`
- Gunakan API key restrictions di Google Cloud Console
