export async function POST(request) {
  try {
    const { input } = await request.json()

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
            content: `You are a thoughtful decision reflection assistant. Use clear, accessible language that is easy to understand but still insightful and substantive — not too academic, not too casual. Speak like a knowledgeable friend who respects your intelligence. Analyze this decision and return ONLY a valid JSON object, no other text, no markdown backticks. IMPORTANT: Respond in the same language as the user's input.
User decision: "${input}"

Return exactly this structure:
{
  "signal": {
    "state": "one of: Exploration Phase / Transition Phase / Commitment Phase / Crisis Point",
    "uncertainty": "one of: Low / Medium / High",
    "emotional_load": "one of: Low / Medium / High",
    "direction": "a short action phrase like 'Explore → Commit' or 'Pause → Reflect'"
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
}`,
          },
        ],
        temperature: 0.7,
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