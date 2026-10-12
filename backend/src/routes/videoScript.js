import { Router } from 'express';

const router = Router();

const platforms = ['instagram', 'facebook', 'youtube'];
const durations = ['15', '30', '60'];
const languages = ['ur', 'en'];
const tones = ['emotional', 'funny', 'educational', 'promotional'];

router.post('/generate', async (req, res) => {
  const { topic, platform, duration, language, tone } = req.body ?? {};

  if (
    typeof topic !== 'string' ||
    topic.trim().length < 3 ||
    topic.trim().length > 500
  ) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_TOPIC',
      message: 'Topic must be between 3 and 500 characters.'
    });
  }

  if (
    !platforms.includes(platform) ||
    !durations.includes(String(duration)) ||
    !languages.includes(language) ||
    !tones.includes(tone)
  ) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_OPTIONS',
      message: 'Invalid platform, duration, language, or tone.'
    });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return res.status(503).json({
      success: false,
      code: 'AI_NOT_CONFIGURED',
      message: 'AI provider is not configured. Add an API key in backend/.env.'
    });
  }

  const platformName = {
    instagram: 'Instagram Reels',
    facebook: 'Facebook Reels',
    youtube: 'YouTube Shorts'
  }[platform];

  const languageName = language === 'ur' ? 'Urdu' : 'English';
  const sceneCount = duration === '15' ? 3 : duration === '60' ? 6 : 4;

  const systemPrompt = [
    'You are a professional short-form video scriptwriter.',
    `Write naturally in ${languageName}.`,
    `Platform: ${platformName}. Duration: ${duration} seconds. Tone: ${tone}.`,
    `Create exactly ${sceneCount} scenes.`,
    'Return valid JSON only with fields: hook (string), scenes (array), cta (string).',
    'Each scene must contain title, time, visual, and voice as strings.',
    'Keep voice-over concise enough for the requested duration.',
    'Use the requested language for all viewer-facing script text.',
    'Do not invent factual claims or present assumptions as facts.'
  ].join(' ');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Create a video script for this topic:\n${topic.trim()}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: duration === '15' ? 700 : duration === '30' ? 1200 : 2200
      }),
      signal: AbortSignal.timeout(30000)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Video script AI provider error:',
        JSON.stringify({
          status: response.status,
          type: data.error?.type || 'unknown',
          code: data.error?.code || 'unknown',
          message: String(data.error?.message || 'No provider message')
            .slice(0, 300)
        })
      );

      return res.status(502).json({
        success: false,
        code: 'AI_PROVIDER_ERROR',
        message: 'AI provider request failed. Check credits, API key, and backend logs.'
      });
    }

    const content = data.choices?.[0]?.message?.content;
    let result;

    try {
      result = JSON.parse(content || '');
    } catch {
      return res.status(502).json({
        success: false,
        code: 'INVALID_AI_RESPONSE',
        message: 'AI provider returned an invalid script format.'
      });
    }

    if (
      typeof result.hook !== 'string' ||
      typeof result.cta !== 'string' ||
      !Array.isArray(result.scenes) ||
      result.scenes.length !== sceneCount ||
      result.scenes.some(scene =>
        !scene ||
        typeof scene.title !== 'string' ||
        typeof scene.time !== 'string' ||
        typeof scene.visual !== 'string' ||
        typeof scene.voice !== 'string'
      )
    ) {
      return res.status(502).json({
        success: false,
        code: 'INVALID_SCRIPT_SHAPE',
        message: 'AI provider returned an incomplete script.'
      });
    }

    return res.json({
      success: true,
      provider: 'OpenAI',
      topic: topic.trim(),
      platform,
      duration: Number(duration),
      language,
      tone,
      hook: result.hook,
      scenes: result.scenes,
      cta: result.cta
    });
  } catch (error) {
    console.error('Video script request error:', error.name);

    return res.status(504).json({
      success: false,
      code: 'AI_REQUEST_TIMEOUT',
      message: 'Could not reach the AI provider. Please try again.'
    });
  }
});

export default router;
