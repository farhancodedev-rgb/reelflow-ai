// Local fallback captions. These are templates, not AI inference.

const phrases = [
  [/my first reel flow ai project is almost complete/i, 'میرا پہلا ReelFlow AI پروجیکٹ تقریباً مکمل ہونے والا ہے'],
  [/my first reel flow project is almost complete/i, 'میرا پہلا ReelFlow پروجیکٹ تقریباً مکمل ہونے والا ہے'],
  [/my first reel flow project just about to complete/i, 'میرا پہلا ReelFlow پروجیکٹ تقریباً مکمل ہونے والا ہے'],
  [/my first project is almost complete/i, 'میرا پہلا پروجیکٹ تقریباً مکمل ہونے والا ہے'],
  [/almost complete|about to complete/i, 'تقریباً مکمل ہونے والا'],
  [/school story/i, 'اسکول کی کہانی'],
  [/funny story/i, 'مزاحیہ کہانی'],
  [/sad story/i, 'اداس کہانی'],
  [/motivational story/i, 'حوصلہ افزا کہانی'],
  [/artificial intelligence/i, 'مصنوعی ذہانت'],
  [/project/i, 'پروجیکٹ'],
  [/first/i, 'پہلا'],
  [/journey/i, 'سفر'],
  [/success/i, 'کامیابی'],
  [/hard work/i, 'محنت'],
  [/learning/i, 'سیکھنے کا عمل'],
];

function urduTopic(topic) {
  let result = topic.trim();
  for (const [pattern, replacement] of phrases) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

const hooks = {
  en: {
    professional: t => `Here's an important update about ${t}.`,
    friendly: t => `Let's talk about ${t}! 😊`,
    funny: t => `Nobody warned me about ${t}! 😅`,
    emotional: t => `${t} means a lot to me. ❤️`,
    promotional: t => `Here's a look at ${t}! ✨`,
  },
  ur: {
    professional: t => `${t} کے حوالے سے ایک اہم اپڈیٹ!`,
    friendly: t => `آئیے، ${t} کے بارے میں بات کرتے ہیں! 😊`,
    funny: t => `${t} کے ساتھ تو کمال ہی ہو گیا! 😅`,
    emotional: t => `${t} میرے لیے ایک خاص سفر ہے۔ ❤️`,
    promotional: t => `پیش ہے ${t} کی ایک جھلک! ✨`,
  },
};

const bodies = {
  en: {
    medium: 'Watch the full video to see more.',
    long: 'Every step is a learning experience. Share your thoughts in the comments!',
  },
  ur: {
    medium: 'مزید جاننے کے لیے پوری ویڈیو دیکھیں۔',
    long: 'ہر قدم سیکھنے کا ایک نیا موقع ہے۔ اپنی رائے کمنٹس میں ضرور بتائیں!',
  },
};

const ctas = {
  en: {
    instagram: ['Follow for more Reels.', 'Share this Reel with a friend.'],
    facebook: ['Share with someone who needs this.', 'Follow the page for more.'],
    youtube: ['Subscribe for more Shorts.', 'Like and subscribe.'],
  },
  ur: {
    instagram: ['مزید ریلز کے لیے فالو کریں۔', 'اس ریل کو دوست کے ساتھ شیئر کریں۔'],
    facebook: ['اس ویڈیو کو دوستوں کے ساتھ شیئر کریں۔', 'مزید ویڈیوز کے لیے پیج فالو کریں۔'],
    youtube: ['مزید شارٹس کے لیے سبسکرائب کریں۔', 'ویڈیو پسند آئے تو لائک کریں اور سبسکرائب کریں۔'],
  },
};

const platformTags = {
  instagram: ['#Reels', '#InstagramReels', '#Explore'],
  facebook: ['#FacebookReels', '#Reels', '#Viral'],
  youtube: ['#Shorts', '#YouTubeShorts', '#Subscribe'],
};

function topicTags(topic) {
  return topic
    .split(/\s+/)
    .map(word => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(word => word.length > 2)
    .slice(0, 3)
    .map(word => `#${word.replace(/\s/g, '')}`);
}

export const captionProvider = {
  name: 'Local templates',
  isRealAI: false,

  async generate({ topic, platform, language, tone, length, variant = 0 }) {
    const clean = topic.trim();
    if (clean.length < 3) {
      throw new Error('Please describe your topic in at least 3 characters.');
    }

    if (!hooks[language] || !hooks[language][tone] ||
        !ctas[language]?.[platform] || !bodies[language]) {
      throw new Error('Please select valid caption settings.');
    }

    const localizedTopic = language === 'ur' ? urduTopic(clean) : clean;
    const parts = [hooks[language][tone](localizedTopic)];

    if (length !== 'short') parts.push(bodies[language].medium);
    if (length === 'long') parts.push(bodies[language].long);

    const options = ctas[language][platform];
    parts.push(options[variant % options.length]);

    const tags = [...new Set([
      ...topicTags(clean),
      ...platformTags[platform],
      '#ContentCreator',
      '#ReelFlowAI',
    ])].slice(0, 10);

    return {
      caption: parts.join(length === 'long' ? '\n\n' : ' '),
      hashtags: tags.join(' '),
    };
  },
};
