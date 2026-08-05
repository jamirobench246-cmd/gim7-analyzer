import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '../../lib/prompt'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { repName, callName, transcript } = req.body
  if (!repName || !callName || !transcript) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: buildPrompt(repName, callName, transcript),
        },
      ],
    })

    const raw = message.content[0].text.trim()
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) parsed = JSON.parse(match[0])
      else return res.status(500).json({ error: 'Could not parse AI response' })
    }

    return res.status(200).json(parsed)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
