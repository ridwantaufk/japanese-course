import { NextResponse } from "next/server";

/**
 * Google Cloud Text-to-Speech API Endpoint
 * Free tier: 1 million characters per month
 *
 * Setup:
 * 1. Enable Cloud Text-to-Speech API in Google Cloud Console
 * 2. Create API key or service account
 * 3. Add GOOGLE_TTS_API_KEY to .env.local
 */

export async function POST(request) {
  try {
    const {
      text,
      lang = "ja-JP",
      rate = 1.0,
      pitch = 0.0,
    } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    if (!apiKey) {
      console.warn(
        "Google TTS API key not configured, falling back to Web Speech API"
      );
      return NextResponse.json(
        { error: "Google TTS not configured" },
        { status: 503 }
      );
    }

    // Determine voice based on language
    const voiceConfig = getVoiceConfig(lang);

    // Call Google Cloud TTS API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.gender,
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: rate,
            pitch: pitch,
            volumeGainDb: 0.0,
            effectsProfileId: ["headphone-class-device"],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Google TTS API error:", error);
      return NextResponse.json(
        { error: "TTS generation failed" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(data.audioContent, "base64");

    // Return audio with appropriate headers
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Get voice configuration based on language
 */
function getVoiceConfig(lang) {
  const configs = {
    "ja-JP": {
      languageCode: "ja-JP",
      name: "ja-JP-Neural2-B", // Female voice, natural
      gender: "FEMALE",
    },
    ja: {
      languageCode: "ja-JP",
      name: "ja-JP-Neural2-B",
      gender: "FEMALE",
    },
    "en-US": {
      languageCode: "en-US",
      name: "en-US-Neural2-F",
      gender: "FEMALE",
    },
    "id-ID": {
      languageCode: "id-ID",
      name: "id-ID-Wavenet-A",
      gender: "FEMALE",
    },
  };

  return configs[lang] || configs["ja-JP"];
}
