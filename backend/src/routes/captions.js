import { Router } from 'express';

const router = Router();

const platforms = ['instagram', 'facebook', 'youtube'];
const languages = ['en', 'ur'];
const tones = ['professional', 'friendly', 'funny', 'emotional', 'promotional'];
const lengths = ['short', 'medium', 'long'];

router.post('/generate', async (req, res) => {
  const { topic, platform, language, tone, length } = req.body ?? {};

  if (typeof topic !== 'string' || topic.trim().length < 3 || topic.length > 300) {
    return res.status(400).json({
      success: false,
      message: 'Topic must be between 3 and 300 characters.'
    });
  }

  if (
    !platforms.includes(platform) ||
    !languages.includes(language) ||
    !tones.includes(tone) ||
    !lengths.includes(length)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid platform, language, tone, or caption length.'
    });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return res.status(503).json({
      success: false,
      code: 'AI_NOT_CONFIGURED',
      message: 'AI provider is not configured yet. Add OPENAI_API_KEY to the backend .env file.'
    });
  }

  const languageName = language === 'ur' ? 'Urdu' : 'English';
  const platformName = {
    instagram: 'Instagram Reels',
    facebook: 'Facebook Reels',
    youtube: 'YouTube Shorts'
  }[platform];

  const systemPrompt = [
    'You are a professional short-form social media copywriter.',
    `Write naturally in ${languageName}.`,
    `Platform: ${platformName}. Tone: ${tone}. Length: ${length}.`,
    'Return only valid JSON with exactly two string fields: caption and hashtags.',
    'The hashtags field must contain space-separated hashtags.',
    'Do not claim facts that are not provided. Avoid misleading engagement claims.'
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
          { role: 'user', content: `Create a caption and hashtags for this video topic:\n${topic.trim()}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: length === 'short' ? 250 : length === 'medium' ? 450 : 650
      }),
      signal: AbortSignal.timeout(30000)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'AI provider request failed:',
        response.status,
        data.error?.code || 'no_error_code',
        data.error?.message || 'No provider error details'
      );
      return res.status(502).json({
        success: false,
        message: 'AI provider request failed. Check the backend terminal for the provider error.'
      });
    }

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({
        success: false,
        message: 'AI provider returned an empty response.'
      });
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      return res.status(502).json({
        success: false,
        message: 'AI provider returned an invalid response format.'
      });
    }

    if (typeof result.caption !== 'string' || typeof result.hashtags !== 'string') {
      return res.status(502).json({
        success: false,
        message: 'AI provider response is missing caption or hashtags.'
      });
    }

    return res.json({
      success: true,
      provider: 'OpenAI',
      caption: result.caption.slice(0, 2200),
      hashtags: result.hashtags.slice(0, 1000)
    });
  } catch (error) {
    console.error('Caption generation error:', error.name);

    return res.status(504).json({
      success: false,
      message: 'Could not reach the AI provider. Please try again.'
    });
  }
});

export default router;
