const rateLimit = new Map()
const WINDOW_MS = 60_000   // 1 minute
const MAX_REQUESTS = 5     // max 5 requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now()
  const record = rateLimit.get(ip) ?? { count: 0, resetAt: now + WINDOW_MS }
  if (now > record.resetAt) {
    record.count = 0
    record.resetAt = now + WINDOW_MS
  }
  record.count++
  rateLimit.set(ip, record)
  return record.count <= MAX_REQUESTS
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!checkRateLimit(ip)) {
      return Response.json(
        { success: false, error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      )
    }

    const { input } = await request.json()

    if (typeof input !== 'string' || input.trim().length < 5) {
      return Response.json(
        { success: false, error: 'Please describe your decision in a bit more detail.' },
        { status: 400 }
      )
    }

    if (input.length > 1000) {
      return Response.json(
        { success: false, error: 'Please keep your input under 1000 characters.' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: `You are a thoughtful decision reflection assistant. Use clear, accessible language that is easy to understand but still insightful and substantive — not too academic, not too casual. Speak like a knowledgeable friend who respects the user's intelligence. Analyze this decision and return ONLY a valid JSON object, no other text, no markdown backticks.

User decision: "${input}"

Return exactly this structure:
{
  "signal": {
    "state": "one of: Exploration Phase / Transition Phase / Commitment Phase / Crisis Point",
    "state_explained": "one sentence in plain language explaining what this state means for THIS user's specific situation - no jargon, refer to their actual decision",
    "uncertainty": "one of: Low / Medium / High",
    "uncertainty_explained": "one short sentence naming what specifically is still unknown in this decision",
    "emotional_load": "one of: Low / Medium / High",
    "emotional_load_explained": "one short sentence naming what is creating the emotional weight here",
    "direction": "a short action phrase like 'Explore → Commit' or 'Pause → Reflect'",
    "direction_explained": "one sentence saying what this suggests the user should do next, and why"
  },
  "scenarios": [
    {
      "type": "Safe Path",
      "emoji": "🛡️",
      "outcome": "one sentence describing the likely outcome",
      "risk": "one sentence describing the main risk",
      "emotion": "one sentence describing how this path might feel emotionally"
    },
    {
      "type": "Risky Path",
      "emoji": "⚡",
      "outcome": "one sentence describing the likely outcome",
      "risk": "one sentence describing the main risk",
      "emotion": "one sentence describing how this path might feel emotionally"
    },
    {
      "type": "Balanced Path",
      "emoji": "⚖️",
      "outcome": "one sentence describing the likely outcome",
      "risk": "one sentence describing the main risk",
      "emotion": "one sentence describing how this path might feel emotionally"
    }
  ],
  "pros": ["at least 3 specific pros"],
  "cons": ["at least 3 specific cons"],
  "risks": ["2-3 key risks to consider"],
  "bias_score": "one of: Low / Medium / High",
  "biases": [
    {
      "name": "bias name",
      "description": "one sentence explaining how this bias is affecting the decision",
      "overcome": "one concrete actionable suggestion to overcome this bias"
    }
  ],
  "questions": ["3 deep reflection questions to help think clearer"]
}

LANGUAGE RULE — read this last; it overrides the examples above.

The field descriptions above are written in English only to tell you WHAT to produce. They are not a language example.

Detect the language of the user's decision text. Write every free-text value you generate in that language. If the user wrote in Chinese, every sentence you output must be in Chinese.

EXCEPTION — these values must stay in English exactly as listed, because the interface matches on them:
- "state": Exploration Phase | Transition Phase | Commitment Phase | Crisis Point
- "uncertainty", "emotional_load", "bias_score": Low | Medium | High
- "type": Safe Path | Risky Path | Balanced Path

Every other field — all *_explained fields, outcome, risk, emotion, pros, cons, risks, bias name/description/overcome, and questions — must follow the user's language.`,
          },
        ],
        temperature: 0.3,
      }),
    })

    const json = await response.json()
    const text = json.choices[0].message.content
    const data = JSON.parse(text)

    return Response.json({ success: true, data })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
