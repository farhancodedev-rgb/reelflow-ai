import { useState } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  Captions,
  Crop,
  Film,
  Menu,
  Music2,
  Play,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import '../styles/landing.css'

const features = [
  {
    icon: Film,
    title: 'Video workspace',
    text: 'Bring your short-form video into one focused editing workspace.',
    tag: 'CORE WORKFLOW',
  },
  {
    icon: Captions,
    title: 'Caption drafting',
    text: 'Create caption and hashtag drafts to help prepare your next post.',
    tag: 'CONTENT TOOLS',
  },
  {
    icon: Crop,
    title: 'Social-ready formats',
    text: 'Prepare vertical, square and widescreen video layouts.',
    tag: 'FLEXIBLE FORMATS',
  },
  {
    icon: Music2,
    title: 'Audio-aware workflow',
    text: 'Preview your source video and prepare it for browser-based export.',
    tag: 'VIDEO WORKFLOW',
  },
  {
    icon: Sparkles,
    title: 'Creative tools',
    text: 'Explore cover concepts, text overlays and presentation settings.',
    tag: 'IN DEVELOPMENT',
  },
  {
    icon: ShieldCheck,
    title: 'Local-first prototype',
    text: 'Your selected video can be previewed locally in your browser.',
    tag: 'BROWSER-BASED',
  },
]

const workflow = [
  ['01', 'Bring your video', 'Choose a video from your device to begin.'],
  ['02', 'Customize the format', 'Adjust the presentation and available editor settings.'],
  ['03', 'Prepare your content', 'Draft captions, hashtags and a cover concept.'],
  ['04', 'Export your result', 'Export the supported video format from your browser.'],
]

const faqs = [
  {
    q: 'Is ReelFlow AI ready to use?',
    a: 'This is an evolving frontend prototype. Some editing and export tools are available, while advanced AI features are not yet fully integrated.',
  },
  {
    q: 'Does it upload my video to a server?',
    a: 'The current video workflow uses browser-based local preview and export. Avoid assuming that every future feature will remain local; check each feature before using it.',
  },
  {
    q: 'Can it automatically publish to Instagram, Facebook or YouTube?',
    a: 'Not currently. Publishing and scheduling are preparation/demo workflows, not live social-media publishing integrations.',
  },
  {
    q: 'Is the pricing final?',
    a: 'No. The plans shown below are placeholders for future planning, not active subscriptions or purchasable plans.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Explore the core workflow.',
    items: ['Local video preview', 'Basic editor workspace', 'Caption and hashtag drafts'],
  },
  {
    name: 'Creator',
    price: 'Coming soon',
    desc: 'A possible plan for regular creators.',
    items: ['Expanded creative tools', 'More workflow options', 'Future AI features'],
    featured: true,
  },
  {
    name: 'Studio',
    price: 'Coming soon',
    desc: 'A possible plan for growing teams.',
    items: ['Team-oriented workflows', 'Collaboration concepts', 'Future publishing integrations'],
  },
]

export default function LandingPage() {

  return (
    <div className="lp">


      <main id="top">
        <section className="lp-hero lp-container">
          <div className="lp-hero-copy">
            <div className="lp-eyebrow"><span /> YOUR SHORT-FORM VIDEO WORKSPACE</div>
            <h1>Make your next video <span>ready for the spotlight.</span></h1>
            <p className="lp-hero-text">
              A focused workspace for preparing short-form videos, drafting captions
              and shaping content for Reels and Shorts.
            </p>
            <div className="lp-hero-actions">
              <a className="lp-button lp-button-primary" href="#/dashboard">
                Explore workspace <ArrowRight size={17} />
              </a>
              <a className="lp-button lp-button-secondary" href="#how-it-works">
                <Play size={15} /> See how it works
              </a>
            </div>
            <div className="lp-trust-points">
              <span><CheckCircle2 size={15} /> Browser-based preview</span>
              <span><CheckCircle2 size={15} /> Creator-focused tools</span>
              <span><CheckCircle2 size={15} /> Prototype access</span>
            </div>
          </div>

          <div className="lp-hero-visual" aria-label="Illustration of a short-form video editor">
            <div className="lp-orb lp-orb-one" />
            <div className="lp-orb lp-orb-two" />
            <div className="lp-editor-window">
              <div className="lp-window-top">
                <div className="lp-window-dots"><i /><i /><i /></div>
                <span>REELFLOW STUDIO</span>
                <span className="lp-window-status"><span /> READY</span>
              </div>
              <div className="lp-preview-layout">
                <div className="lp-fake-video">
                  <div className="lp-video-sun" />
                  <div className="lp-video-mountain lp-mountain-a" />
                  <div className="lp-video-mountain lp-mountain-b" />
                  <div className="lp-video-ground" />
                  <div className="lp-video-person" />
                  <div className="lp-play-button"><Play size={18} fill="currentColor" /></div>
                  <span className="lp-video-label">YOUR NEXT BIG MOMENT</span>
                </div>
                <div className="lp-preview-details">
                  <span className="lp-detail-label">PROJECT OVERVIEW</span>
                  <strong>Untitled video</strong>
                  <span className="lp-detail-muted">Your creative workspace</span>
                  <div className="lp-mini-stat"><Film size={15} /><span>Video project</span><Check size={14} /></div>
                  <div className="lp-mini-stat"><Captions size={15} /><span>Caption draft</span><Check size={14} /></div>
                  <div className="lp-mini-stat"><Crop size={15} /><span>Format settings</span><Check size={14} /></div>
                </div>
              </div>
              <div className="lp-timeline">
                <div className="lp-timeline-label"><span>TIMELINE PREVIEW</span><span>00:30</span></div>
                <div className="lp-timeline-track">
                  <i /><i /><i /><i /><i /><i /><i /><i /><i />
                </div>
              </div>
            </div>
            <div className="lp-float-card lp-float-top"><Sparkles size={16} /><span><strong>Creative workflow</strong><small>Tools in one workspace</small></span></div>
            <div className="lp-float-card lp-float-bottom"><Zap size={16} /><span><strong>Made for short-form</strong><small>Reels · Shorts · More</small></span></div>
          </div>
        </section>

        <section className="lp-proof-strip lp-container" aria-label="Supported workflow highlights">
          <span>BUILT AROUND YOUR WORKFLOW</span>
          <div><Film size={17} /> Video editing</div>
          <div><Captions size={17} /> Caption drafts</div>
          <div><Crop size={17} /> Flexible formats</div>
          <div><ShieldCheck size={17} /> Local preview</div>
        </section>

        <section className="lp-section lp-container" id="features">
          <div className="lp-section-heading">
            <span className="lp-section-kicker">TOOLS FOR CREATORS</span>
            <h2>Your content workflow, <span>more organized.</span></h2>
            <p>Start with the essentials and explore more capabilities as ReelFlow develops.</p>
          </div>
          <div className="lp-feature-grid">
            {features.map(({ icon: Icon, title, text, tag }) => (
              <article className="lp-feature-card" key={title}>
                <div className="lp-feature-icon"><Icon size={21} /></div>
                <span className="lp-card-tag">{tag}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href="#/dashboard" aria-label={`Explore ${title}`}>Explore workspace <ArrowRight size={14} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-process-section" id="how-it-works">
          <div className="lp-container">
            <div className="lp-section-heading">
              <span className="lp-section-kicker">A SIMPLE WORKFLOW</span>
              <h2>From raw clip to <span>ready-to-share.</span></h2>
              <p>Four straightforward steps to prepare your short-form content.</p>
            </div>
            <div className="lp-process-grid">
              {workflow.map(([number, title, text]) => (
                <article className="lp-process-card" key={number}>
                  <span className="lp-process-number">{number}</span>
                  <div className="lp-process-line" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-container" id="pricing">
          <div className="lp-section-heading">
            <span className="lp-section-kicker">FUTURE PLANS</span>
            <h2>Plans designed to <span>grow with you.</span></h2>
            <p>These are proposed plan concepts only. No payment or subscription is enabled.</p>
          </div>
          <div className="lp-pricing-grid">
            {plans.map(plan => (
              <article className={`lp-plan-card ${plan.featured ? 'lp-plan-featured' : ''}`} key={plan.name}>
                {plan.featured && <span className="lp-plan-badge">PROPOSED PLAN</span>}
                <h3>{plan.name}</h3>
                <p className="lp-plan-desc">{plan.desc}</p>
                <div className="lp-plan-price">{plan.price}</div>
                <div className="lp-plan-divider" />
                <ul>
                  {plan.items.map(item => <li key={item}><Check size={15} /> {item}</li>)}
                </ul>
                <a className={`lp-plan-button ${plan.featured ? 'lp-plan-button-primary' : ''}`} href="#/dashboard">
                  Explore prototype <ArrowRight size={15} />
                </a>
              </article>
            ))}
          </div>
          <p className="lp-pricing-note"><ShieldCheck size={15} /> No active billing, charges or paid plans are offered on this prototype.</p>
        </section>

        <section className="lp-faq-section" id="faq">
          <div className="lp-container lp-faq-layout">
            <div className="lp-faq-intro">
              <span className="lp-section-kicker">GOOD TO KNOW</span>
              <h2>Questions, <span>answered.</span></h2>
              <p>Here is what to expect from the current ReelFlow AI prototype.</p>
              <a href="#/dashboard" className="lp-faq-link">Explore the workspace <ArrowRight size={15} /></a>
            </div>
            <div className="lp-faq-list">
              {faqs.map(({ q, a }) => (
                <details key={q} className="lp-faq-item">
                  <summary>{q}<ChevronDown size={18} /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-bottom-cta lp-container">
          <div className="lp-cta-panel">
            <div className="lp-cta-icon"><Clapperboard size={24} /></div>
            <span className="lp-section-kicker">YOUR NEXT VIDEO STARTS HERE</span>
            <h2>Ready to create your next short?</h2>
            <p>Open the workspace and explore the tools available in the current prototype.</p>
            <a className="lp-button lp-button-primary" href="#/dashboard">
              Open ReelFlow AI <ArrowRight size={17} />
            </a>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <a className="lp-brand" href="#top">
          <span className="lp-brand-icon"><Clapperboard size={19} /></span>
          <span>ReelFlow<span className="lp-brand-accent"> AI</span></span>
        </a>
        <p>Built for the short-form video workflow.</p>
        <span className="lp-footer-note">Prototype · Features may be incomplete</span>
      </footer>
    </div>
  )
}
