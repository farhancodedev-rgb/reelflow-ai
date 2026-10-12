// DEMO provider. Nothing is sent to any social platform.
// A real backend would implement the same publish() / schedule() shape
// using official APIs and authorized accounts.

export const platformRules = {
  instagram: { name: 'Instagram Reels', captionMax: 2200, maxHashtags: 30 },
  facebook: { name: 'Facebook Reels', captionMax: 2200, maxHashtags: 30 },
  youtube: { name: 'YouTube Shorts', captionMax: 100, maxHashtags: 15 },
}

export function validatePost({ platform, caption, hashtags, scheduledAt, needsSchedule }) {
  const errors = []
  const rules = platformRules[platform]
  if (!rules) errors.push('Choose a platform.')
  if (!caption.trim()) errors.push('Write a caption.')
  if (rules && caption.length > rules.captionMax) {
    errors.push(`${rules.name} titles/captions should be ${rules.captionMax} characters or fewer.`)
  }
  const tagCount = hashtags.trim() ? hashtags.trim().split(/\s+/).length : 0
  if (rules && tagCount > rules.maxHashtags) errors.push(`Use ${rules.maxHashtags} hashtags or fewer.`)
  if (needsSchedule) {
    if (!scheduledAt) errors.push('Choose a date and time.')
    else if (Number.isNaN(Date.parse(scheduledAt)) || Date.parse(scheduledAt) <= Date.now()) errors.push('Choose a future date and time.')
  }
  return errors
}

export const publishProvider = {
  name: 'Demo (not connected)',
  connected: false,
  async publish() {
    return { ok: true, demo: true }
  },
  async schedule() {
    return { ok: true, demo: true }
  },
}
