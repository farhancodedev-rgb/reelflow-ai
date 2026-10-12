import { useState } from 'react'
import { generateVideoScript } from '../utils/videoScriptApi.js'
import {
  Sparkles, Copy, Download, RotateCcw, Clapperboard, Clock3,
  MessageSquareText, ListVideo, CheckCircle2,
} from 'lucide-react'
import Button from '../components/Button.jsx'
import Toast from '../components/Toast.jsx'
import { useToast } from '../hooks/useToast.js'
import './video-script.css'

const platforms = [
  { id: 'instagram', label: 'Instagram Reels' },
  { id: 'facebook', label: 'Facebook Reels' },
  { id: 'youtube', label: 'YouTube Shorts' },
]

const tones = [
  { id: 'emotional', label: 'Emotional' },
  { id: 'funny', label: 'Funny' },
  { id: 'educational', label: 'Educational' },
  { id: 'promotional', label: 'Promotional' },
]

function buildLocalScript({ topic, platform, duration, language, tone }) {
  const urdu = language === 'ur';
  const subject = topic.trim();
  const count = duration === '15' ? 3 : duration === '60' ? 6 : 4;

  const stories = {
    emotional: {
      hook: urdu ? subject + ' کے ایک مشکل لمحے نے سب کچھ بدل دیا۔' : 'One difficult moment changed everything.',
      visuals: urdu
        ? ['کردار کو پریشان اور تنہا دکھائیں۔', 'اس کی مشکل کو چہرے کے تاثرات اور قریبی شاٹس سے واضح کریں۔', 'کسی مددگار کردار کو آگے بڑھ کر مدد کرتے دکھائیں۔', 'کردار کے چہرے پر امید اور سکون واپس آتا دکھائیں۔']
        : ['Show the character looking worried and alone.', 'Reveal the problem through expressions and close-up shots.', 'Introduce someone who offers genuine help.', 'Show hope returning through a warm final shot.'],
      voices: urdu
        ? ['وہ سمجھ نہیں پا رہا تھا کہ اب کیا کرے۔', 'کبھی کبھی ایک چھوٹی سی مشکل بھی بہت بڑی لگتی ہے۔', 'تبھی کسی نے اس کی پریشانی محسوس کی اور مدد کے لیے آگے آیا۔', 'ایک چھوٹی سی نیکی نے اس کے دل میں امید جگا دی۔']
        : ['The character did not know what to do next.', 'Sometimes a small problem feels huge when we face it alone.', 'Then someone noticed and stepped forward to help.', 'A little kindness brought back hope.']
    },
    funny: {
      hook: urdu ? subject + ' کے ساتھ ایسا ہوا جس کی کسی کو توقع نہیں تھی!' : 'Nobody expected what happened next!',
      visuals: urdu
        ? ['کردار کو اعتماد کے ساتھ منصوبہ بناتے دکھائیں۔', 'پہلی کوشش میں مزاحیہ گڑبڑ ہو جائے۔', 'کردار کا حیران کن اور مبالغہ آمیز ردعمل دکھائیں۔', 'ایک غیر متوقع مزاحیہ اختتام کریں۔']
        : ['Show the character confidently making a plan.', 'Let the first attempt go hilariously wrong.', 'Show an exaggerated reaction and comic pause.', 'Finish with an unexpected visual punchline.'],
      voices: urdu
        ? [subject + ' کے لیے ایک زبردست منصوبہ بنایا گیا۔', 'لیکن پہلی ہی کوشش میں سارا منصوبہ الٹ گیا!', 'ردعمل غلطی سے بھی زیادہ مزاحیہ تھا۔', 'یہ تو منصوبے میں شامل ہی نہیں تھا!']
        : ['The character had a brilliant plan.', 'But the first attempt went completely wrong!', 'The reaction was funnier than the mistake.', 'That was definitely not part of the plan!']
    },
    educational: {
      hook: urdu ? subject + ' کے بارے میں یہ اہم بات جاننا ضروری ہے۔' : 'Here is an important lesson about ' + subject + '.',
      visuals: urdu
        ? ['موضوع کی دلچسپ اور واضح مثال دکھائیں۔', 'بنیادی مسئلے کو آسان انداز میں پیش کریں۔', 'ایک مفید مرحلہ عملی طور پر دکھائیں۔', 'اہم سبق کو یاد رہ جانے والے منظر سے واضح کریں۔']
        : ['Introduce the topic with a clear visual example.', 'Explain the main problem in a simple way.', 'Demonstrate a useful step or practical solution.', 'Summarize the lesson with a memorable final shot.'],
      voices: urdu
        ? ['آئیے ' + subject + ' کو آسان انداز میں سمجھتے ہیں۔', 'سب سے پہلے بنیادی بات کو سمجھنا ضروری ہے۔', 'اب اس آسان مثال کو غور سے دیکھیں۔', 'اس اہم نکتے کو یاد رکھیں اور عملی طور پر آزمائیں۔']
        : ['Let us explore ' + subject + ' in a simple way.', 'First, understand the basic idea.', 'Now look at this practical example.', 'Remember the key lesson and put it into practice.']
    },
    promotional: {
      hook: urdu ? 'کیا آپ ' + subject + ' تلاش کر رہے ہیں؟ یہ آپ کے لیے ہے!' : 'Looking for ' + subject + '? Start here.',
      visuals: urdu
        ? ['پروڈکٹ یا خیال کو خوبصورت شاٹ میں دکھائیں۔', 'صارف کا عام مسئلہ سامنے لائیں۔', 'متعلقہ خصوصیت یا فائدے کا مظاہرہ کریں۔', 'واضح اگلے قدم کے ساتھ اختتام کریں۔']
        : ['Show the product or idea in a clean hero shot.', 'Present a common audience problem.', 'Demonstrate a relevant feature or benefit.', 'End with a clear and natural call to action.'],
      voices: urdu
        ? ['اگر آپ ' + subject + ' تلاش کر رہے ہیں تو یہ دیکھیں۔', 'بہت سے لوگ اس مسئلے کا آسان حل چاہتے ہیں۔', 'یہ خیال یا خصوصیت آپ کے لیے مفید ہو سکتی ہے۔', 'تفصیلات دیکھیں اور اپنی ضرورت کے مطابق فیصلہ کریں۔']
        : ['If you are looking for ' + subject + ', take a look.', 'Many people want a simpler way to solve this problem.', 'Here is how this idea or feature may help.', 'Explore the details and see if it suits your needs.']
    }
  };

  const story = stories[tone] || stories.emotional;
  const hook = story.hook;
  const sceneDuration = Number(duration) / count;

  const scenes = Array.from({ length: count }, (_, index) => ({
    title: urdu ? 'منظر ' + (index + 1) : 'Scene ' + (index + 1),
    time: Math.round(sceneDuration * index) + '–' + Math.round(sceneDuration * (index + 1)) + ' sec',
    visual: story.visuals[index % story.visuals.length],
    voice: index === 0 ? hook : story.voices[(index - 1) % story.voices.length]
  }));

  return {
    topic: subject,
    platform: platforms.find(item => item.id === platform)?.label || platform,
    duration: duration + ' seconds',
    hook,
    scenes,
    cta: urdu
      ? 'ویڈیو پسند آئی؟ اسے لائک کریں، دوستوں کے ساتھ شیئر کریں اور مزید ویڈیوز کے لیے فالو کریں۔'
      : 'Enjoyed this video? Like, share it with a friend, and follow for more.',
    disclaimer: urdu
      ? 'یہ مقامی ٹیمپلیٹ سے تیار کردہ ابتدائی ڈرافٹ ہے، AI-generated نتیجہ نہیں۔ پوسٹ کرنے سے پہلے اسے چیک اور ایڈٹ کریں۔'
      : 'This is a local template draft, not AI-generated. Review and edit before publishing.'
  };
}
export default function VideoScriptPage() {
  const { notice, showNotice, dismiss } = useToast()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [duration, setDuration] = useState('30')
  const [language, setLanguage] = useState('ur')
  const [tone, setTone] = useState('emotional')
  const [script, setScript] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  async function generate(event) {
    event.preventDefault()

    if (topic.trim().length < 3 || topic.trim().length > 500) {
      showNotice('Check your topic', 'Enter a topic between 3 and 500 characters.', 'error')
      return
    }

    setIsGenerating(true)

    try {
      const data = await generateVideoScript({
        topic: topic.trim(),
        platform,
        duration,
        language,
        tone,
      })

      if (
        !data.success ||
        !data.hook ||
        !Array.isArray(data.scenes) ||
        !data.scenes.length ||
        !data.cta
      ) {
        throw new Error('The API returned an invalid script. Please try again.')
      }

      setScript({
        ...data,
        source: 'ai',
        platform: platforms.find(item => item.id === data.platform)?.label || data.platform,
        duration: `${data.duration ?? duration} seconds`,
        disclaimer: language === 'ur'
          ? 'یہ اسکرپٹ AI سے تیار کیا گیا ہے۔ پوسٹ کرنے سے پہلے حقائق اور متن ضرور چیک کریں۔'
          : 'AI-generated draft. Review the wording and verify factual claims before publishing.',
      })

      showNotice('AI script ready', 'Script received from the backend. Review and edit it before publishing.', 'success')
    } catch (error) {
      setScript({
        ...buildLocalScript({ topic, platform, duration, language, tone }),
        source: 'local',
      })

      showNotice(
        'AI unavailable — local draft created',
        error.message || 'The AI service failed. This is a local template draft, not an AI result.',
        'error'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function formatScript() {
    if (!script) return ''
    return [
      `VIDEO SCRIPT: ${script.topic}`,
      `Platform: ${script.platform} | Duration: ${script.duration}`,
      '',
      `HOOK:\n${script.hook}`,
      '',
      ...script.scenes.flatMap(scene => [
        `${scene.title} (${scene.time})`,
        `Visual: ${scene.visual}`,
        `Voice-over: ${scene.voice}`,
        '',
      ]),
      `CALL TO ACTION:\n${script.cta}`,
      '',
      script.disclaimer,
    ].join('\n')
  }

  function downloadScript() {
    if (!script) return;

    const blob = new Blob([formatScript()], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (script.topic || 'video-script')
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'video-script';

    link.href = url;
    link.download = safeName + '-reelflow-script.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showNotice('Script downloaded', 'Your editable text script is ready.', 'success');
  }

  async function copyText(value, label) {
    try {
      await navigator.clipboard.writeText(value)
      showNotice(`${label} copied`, 'Text copied to clipboard.', 'success')
    } catch {
      showNotice('Copy unavailable', 'Select the text and copy it manually.', 'error')
    }
  }

  return (
    <div className="rf-page rf-script-page">
      <header className="rf-page-head">
        <div>
          <h1>Video Script Generator</h1>
          <p>Turn a simple idea into a hook, scene plan, voice-over and CTA.</p>
        </div>
        <span className="rf-script-badge"><Sparkles size={14} /> {script?.source === 'ai' ? 'AI-generated' : 'Local prototype'}</span>
      </header>

      <div className="rf-script-note">
        <MessageSquareText size={17} />
        <span>{script?.source === 'ai' ? 'AI-generated script received from the backend. Review it before publishing.' : 'If AI generation is unavailable, a local starter-template draft is shown instead.'}</span>
      </div>

      <div className="rf-script-grid">
        <form className="rf-card rf-script-form" onSubmit={generate}>
          <h2><Clapperboard size={18} /> Script brief</h2>

          <label className="rf-field">
            <span>Topic or story idea</span>
            <textarea
              rows={4}
              maxLength={500}
              value={topic}
              onChange={event => setTopic(event.target.value)}
              placeholder="e.g. A sad student finds help from a classmate..."
              required
            />
          </label>

          <div className="rf-field-row">
            <label className="rf-field">
              <span>Platform</span>
              <select value={platform} onChange={event => setPlatform(event.target.value)}>
                {platforms.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>

            <label className="rf-field">
              <span>Duration</span>
              <select value={duration} onChange={event => setDuration(event.target.value)}>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </label>

            <label className="rf-field">
              <span>Language</span>
              <select value={language} onChange={event => setLanguage(event.target.value)}>
                <option value="ur">Urdu</option>
                <option value="en">English</option>
              </select>
            </label>

            <label className="rf-field">
              <span>Tone</span>
              <select value={tone} onChange={event => setTone(event.target.value)}>
                {tones.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
          </div>

          <Button icon={Sparkles} type="submit" disabled={isGenerating}>{isGenerating ? "Generating..." : "Generate script draft"}</Button>
          <p className="rf-script-help">Your brief stays in this page. You can edit the topic and generate another draft at any time.</p>
        </form>

        <section className="rf-card rf-script-output" aria-labelledby="script-output-title">
          <div className="rf-script-output-head">
            <h2 id="script-output-title"><ListVideo size={18} /> Your script</h2>
            {script && (
              <>
                <Button variant="secondary" icon={Copy} onClick={() => copyText(formatScript(), 'Full script')}>
                  Copy all
                </Button>
                <Button variant="secondary" icon={Download} onClick={downloadScript}>
                  Download .txt
                </Button>
              </>
            )}
          </div>

          {!script ? (
            <div className="rf-script-empty">
              <span><Clapperboard size={25} /></span>
              <strong>Your next video starts here</strong>
              <p>Enter an idea and generate a draft to see the hook, scenes, voice-over and call to action.</p>
            </div>
          ) : (
            <div className="rf-script-result">
              <div className="rf-script-meta">
                <span><Clock3 size={14} /> {script.duration}</span>
                <span>{script.platform}</span>
              </div>

              <section className="rf-script-hook">
                <span className="rf-script-kicker">HOOK</span>
                <p dir="auto">{script.hook}</p>
                <button type="button" className="rf-script-copy" onClick={() => copyText(script.hook, 'Hook')} aria-label="Copy hook">
                  <Copy size={14} />
                </button>
              </section>

              <h3 className="rf-script-scenes-title">Scene-by-scene plan</h3>
              {script.scenes.map((scene, index) => (
                <article className="rf-script-scene" key={`${scene.title}-${index}`}>
                  <div className="rf-script-scene-top">
                    <strong>{scene.title}</strong>
                    <span>{scene.time}</span>
                  </div>
                  <label className="rf-field">
                    <span>Visual direction</span>
                    <textarea rows={2} dir="auto" value={scene.visual} onChange={event => setScript(current => ({
                      ...current,
                      scenes: current.scenes.map((item, itemIndex) => itemIndex === index ? { ...item, visual: event.target.value } : item),
                    }))} />
                  </label>
                  <label className="rf-field">
                    <span>Voice-over</span>
                    <textarea rows={2} dir="auto" value={scene.voice} onChange={event => setScript(current => ({
                      ...current,
                      scenes: current.scenes.map((item, itemIndex) => itemIndex === index ? { ...item, voice: event.target.value } : item),
                    }))} />
                  </label>
                  <button type="button" className="rf-script-copy" onClick={() => copyText(`${scene.title} (${scene.time})\nVisual: ${scene.visual}\nVoice-over: ${scene.voice}`, scene.title)}>
                    <Copy size={13} /> Copy scene
                  </button>
                </article>
              ))}

              <section className="rf-script-cta">
                <span className="rf-script-kicker">CALL TO ACTION</span>
                <textarea rows={3} dir="auto" value={script.cta} onChange={event => setScript(current => ({ ...current, cta: event.target.value }))} />
              </section>

              <p className="rf-script-disclaimer"><CheckCircle2 size={14} /> {script.disclaimer}</p>
              <div className="rf-script-bottom-actions">
                <Button variant="secondary" icon={Copy} onClick={() => copyText(script.cta, 'Call to action')}>Copy CTA</Button>
                <Button variant="secondary" icon={RotateCcw} onClick={() => setScript({
                  ...buildLocalScript({ topic, platform, duration, language, tone }),
                  source: 'local',
                })}>Regenerate draft</Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <Toast notice={notice} onDismiss={dismiss} />
    </div>
  )
}
