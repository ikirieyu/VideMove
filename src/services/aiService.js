/**
 * aiService.js — Universal Multi-Provider AI Service for VideMove
 *
 * Supports: OpenAI, Pollinations, Gemini, Groq (chat), AIMLapi,
 *           AiHubMix, DeepSeek, Qwen, MiniMax, Moonshot, Grok, etc.
 */

// ─── Default provider configs (pre-filled from app config) ───────────────────
export const PROVIDER_DEFAULTS = {
  openai: {
    label: 'OpenAI',
    apiKey: '', // Enter your key in Settings
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini',
    type: 'openai',
  },
  pollinations: {
    label: 'Pollinations AI',
    apiKey: '', // Enter your key in Settings
    baseUrl: 'https://enter.pollinations.ai/v1',
    modelName: 'openai-fast',
    type: 'openai',
  },
  gemini: {
    label: 'Google Gemini',
    apiKey: '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    modelName: 'gemini-2.5-flash',
    type: 'gemini',
  },
  groq: {
    label: 'Groq',
    apiKey: '',
    baseUrl: 'https://api.groq.com/openai/v1',
    modelName: 'llama-3.3-70b-versatile',
    type: 'openai',
  },
  aihubmix: {
    label: 'AiHubMix',
    apiKey: '', // Enter your key in Settings
    baseUrl: 'https://aihubmix.com/v1',
    modelName: 'gpt-5.4-mini',
    type: 'openai',
  },
  aimlapi: {
    label: 'AI/ML API',
    apiKey: '', // Enter your key in Settings
    baseUrl: 'https://api.aimlapi.com/v1',
    modelName: 'openai/gpt-4o-mini',
    type: 'openai',
  },
  deepseek: {
    label: 'DeepSeek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    modelName: 'deepseek-chat',
    type: 'openai',
  },
  grok: {
    label: 'Grok (xAI)',
    apiKey: '',
    baseUrl: 'https://api.x.ai/v1',
    modelName: 'grok-4.3',
    type: 'openai',
  },
  moonshot: {
    label: 'Moonshot AI',
    apiKey: '',
    baseUrl: 'https://api.moonshot.cn/v1',
    modelName: 'moonshot-v1-8k',
    type: 'openai',
  },
  minimax: {
    label: 'MiniMax',
    apiKey: '',
    baseUrl: 'https://api.minimax.io/v1',
    modelName: 'MiniMax-M3',
    type: 'openai',
  },
  qwen: {
    label: 'Qwen (Alibaba)',
    apiKey: '',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelName: 'qwen-max',
    type: 'openai',
  },
};

// ─── Storage key ──────────────────────────────────────────────────────────────
export const SETTINGS_KEY = 'vm_settings';

// ─── Load/save settings ───────────────────────────────────────────────────────
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {
    activeProvider: 'openai',
    providers: PROVIDER_DEFAULTS,
    subtitleProvider: 'groq',
    groqApiKey: '',
    layoutSettings: getDefaultLayoutSettings(),
  };
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getDefaultLayoutSettings() {
  return {
    aspectRatio: '16:9',
    subtitlePosition: 'bottom',
    subtitleFontSize: 22,
    subtitleColor: '#FFFFFF',
    subtitleBgEnabled: true,
    subtitleBgColor: '#000000',
    subtitleBgOpacity: 0.55,
    titlePosition: 'bottom',
    titleFontSize: 36,
    titleColor: '#FFFFFF',
    titleUppercase: false,
  };
}

// Aspect ratio → width/height
export const ASPECT_RATIOS = {
  '16:9':  { label: '16:9 Landscape', width: 1920, height: 1080, icon: '▬' },
  '9:16':  { label: '9:16 Portrait',  width: 1080, height: 1920, icon: '▮' },
  '1:1':   { label: '1:1 Square',     width: 1080, height: 1080, icon: '■' },
  '4:3':   { label: '4:3 Classic',    width: 1440, height: 1080, icon: '⬜' },
  '21:9':  { label: '21:9 Cinematic', width: 2560, height: 1080, icon: '▬' },
};

// ─── Core call functions ───────────────────────────────────────────────────────

/**
 * Call an OpenAI-compatible endpoint
 */
async function callOpenAICompat(baseUrl, apiKey, modelName, messages, systemPrompt) {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const url = `${cleanBase}/chat/completions`;

  const body = {
    model: modelName,
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `AI API error (${res.status}): ${url}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Call Google Gemini API
 */
async function callGemini(baseUrl, apiKey, modelName, messages, systemPrompt) {
  const model = modelName || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    ...(systemPrompt && { systemInstruction: { parts: [{ text: systemPrompt }] } }),
    generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 },
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

// ─── Main exported function ────────────────────────────────────────────────────

/**
 * callAI — universal entry point
 * @param {object} providerConfig  — { type, apiKey, baseUrl, modelName }
 * @param {string} userPrompt
 * @param {string} systemPrompt
 */
export async function callAI(providerConfig, userPrompt, systemPrompt = '') {
  const { type, apiKey, baseUrl, modelName } = providerConfig;

  if (!apiKey) throw new Error(`API key for "${providerConfig.label || type}" is missing. Please add it in Settings.`);

  const messages = [{ role: 'user', content: userPrompt }];

  if (type === 'gemini') {
    return callGemini(baseUrl, apiKey, modelName, messages, systemPrompt);
  }

  // openai-compatible (openai, pollinations, groq, aihubmix, aimlapi, deepseek, grok, etc.)
  return callOpenAICompat(baseUrl, apiKey, modelName, messages, systemPrompt);
}

/**
 * Get active provider config from settings
 */
export function getActiveProvider(settings) {
  const providerId = settings?.activeProvider || 'openai';
  const savedProviders = settings?.providers || {};
  const defaultCfg = PROVIDER_DEFAULTS[providerId] || PROVIDER_DEFAULTS.openai;
  const savedCfg = savedProviders[providerId] || {};
  return {
    ...defaultCfg,
    ...savedCfg,
    id: providerId,
  };
}

// ─── Higher-level AI tasks ────────────────────────────────────────────────────

/**
 * Suggest video clip timestamps from transcript
 */
export async function getClipSuggestions(settings, transcript, userPrompt, videoDuration) {
  const provider = getActiveProvider(settings);
  const systemPrompt = `You are a professional video editor AI.
Analyze video transcripts and suggest optimal clip timestamps based on user requirements.
Always respond with valid JSON only, no markdown or extra text.
Timestamps must be in seconds and within the video duration (0 to ${videoDuration}).`;

  const prompt = `Video transcript:
${transcript}

Total video duration: ${videoDuration} seconds

User request: "${userPrompt}"

Return a JSON array of clip objects:
[
  { "start": <seconds>, "end": <seconds>, "reason": "<why this segment is good>" }
]

Rules:
- Return 1-5 clips total
- Each clip at least 3 seconds long
- Ensure start < end and both within [0, ${videoDuration}]
- "reason" in the same language as the user request`;

  const response = await callAI(provider, prompt, systemPrompt);
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned unexpected format');
  const suggestions = JSON.parse(jsonMatch[0]);
  return suggestions.filter(
    (s) => typeof s.start === 'number' && typeof s.end === 'number' && s.start < s.end
  );
}

/**
 * Suggest caption/title for a video
 */
export async function suggestCaption(settings, prompt, platform, language = 'id') {
  const provider = getActiveProvider(settings);
  const langName = language === 'id' ? 'Indonesian' : 'English';
  const response = await callAI(
    provider,
    `Generate 3 engaging ${platform} captions/titles in ${langName} for a video about: "${prompt}". 
Return as JSON array: ["caption1", "caption2", "caption3"]`
  );
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [response];
  return JSON.parse(jsonMatch[0]);
}
