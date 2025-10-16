// Server-side API route to record consent to Supabase via REST (PostgREST)
// Expects POST { anonymousId?: string, consent: boolean, source?: string }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const SUPABASE_URL = process.env.SUPABASE_URL
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY missing)' })
  }

  try {
    const body = req.body || {}
    const consent = body.consent === true || body.consent === 'granted' || body.consent === '1'
    const anonymous_id = body.anonymousId || null
    const source = body.source || 'client'

    // Minimal payload for analytics_consent table
    const payload = [{ anonymous_id, consent, source }]

    const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/analytics_consent`

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    })

    const text = await resp.text()
    if (!resp.ok) {
      return res.status(resp.status || 500).json({ error: 'Supabase insert failed', details: text })
    }

    // Return inserted rows (PostgREST returns JSON array)
    let json
    try { json = JSON.parse(text) } catch(e) { json = text }
    return res.status(200).json({ inserted: json })
  } catch (err) {
    console.error('Consent API error', err)
    const isProd = process.env.NODE_ENV === 'production';
    // Sanitize error details for non-production
    let details = err.stack || '';
    if (!isProd) {
      // Redact any SUPABASE keys/URLs from error details
      const redact = (str) => {
        let redacted = str;
        if (process.env.SUPABASE_SERVICE_KEY && process.env.SUPABASE_SERVICE_KEY.length > 0) {
          // Use split/join to avoid regex injection
          redacted = redacted.split(process.env.SUPABASE_SERVICE_KEY).join('[REDACTED_KEY]');
        }
        if (process.env.SUPABASE_URL && process.env.SUPABASE_URL.length > 0) {
          redacted = redacted.split(process.env.SUPABASE_URL).join('[REDACTED_URL]');
        }
        return redacted;
      };
      if (process.env.SUPABASE_SERVICE_KEY) details = redact(details);
      if (process.env.SUPABASE_URL) details = redact(details);
    }
    return res.status(500).json({
      error: isProd ? 'Internal server error' : (err.message || 'Internal server error'),
      ...(isProd ? {} : { details })
    });
  }
}
