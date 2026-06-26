// Gemini API Service for VideMove
// Uses Gemini 1.5 Flash (free tier: 15 RPM, 1M tokens/day)

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-1.5-flash';

export async function callGemini(apiKey, prompt, systemInstruction = '') {
  if (!apiKey) throw new Error('Gemini API key is required');

  const url = `${GEMINI_API_BASE}/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    systemInstruction: systemInstruction
      ? { parts: [{ text: systemInstruction }] }
      : undefined,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/**
 * Analyze transcript and suggest clip timestamps based on user prompt
 * Returns array of: { start, end, reason }
 */
export async function getClipSuggestions(apiKey, transcript, userPrompt, videoDuration) {
  const systemInstruction = `You are a professional video editor AI. 
Analyze video transcripts and suggest optimal clip timestamps based on user requirements.
Always respond with valid JSON only, no markdown or extra text.
Timestamps must be in seconds and within the video duration (0 to ${videoDuration}).`;

  const prompt = `Video transcript:
${transcript}

Total video duration: ${videoDuration} seconds

User request: "${userPrompt}"

Analyze the transcript and suggest the best clip segments. 
Return a JSON array of clip objects with this format:
[
  { "start": <seconds>, "end": <seconds>, "reason": "<why this segment is good>" },
  ...
]

Rules:
- Return 1-5 clips total
- Each clip should be at least 3 seconds long
- Prioritize engaging, relevant content
- Ensure start < end and both are within [0, ${videoDuration}]
- The "reason" should be in the same language as the user request`;

  const response = await callGemini(apiKey, prompt, systemInstruction);

  // Parse JSON from response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Gemini returned unexpected format');

  const suggestions = JSON.parse(jsonMatch[0]);
  return suggestions.filter(
    (s) => typeof s.start === 'number' && typeof s.end === 'number' && s.start < s.end
  );
}

/**
 * Generate subtitle text from transcript
 */
export async function generateSubtitleFromTranscript(apiKey, transcript) {
  const systemInstruction = `You are a subtitle formatting expert. Convert raw transcripts into clean, properly timed SRT subtitle format.`;

  const prompt = `Convert this raw transcript to SRT subtitle format:
${transcript}

Return ONLY the SRT content, no additional text.`;

  return await callGemini(apiKey, prompt, systemInstruction);
}

/**
 * Suggest title/caption for the clip
 */
export async function suggestCaption(apiKey, prompt, platform, language = 'id') {
  const langName = language === 'id' ? 'Indonesian' : 'English';

  const response = await callGemini(
    apiKey,
    `Generate 3 engaging ${platform} captions/titles in ${langName} for a video about: "${prompt}". 
Return as JSON array: ["caption1", "caption2", "caption3"]`
  );

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [response];
  return JSON.parse(jsonMatch[0]);
}
