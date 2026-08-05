import { AssemblyAI } from 'assemblyai'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { audioBase64, mimeType } = req.body
    if (!audioBase64) return res.status(400).json({ error: 'No audio data provided' })

    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })

    const buffer = Buffer.from(audioBase64, 'base64')
    const uploadUrl = await client.files.upload(buffer, { 'Content-Type': mimeType || 'audio/mpeg' })

    const transcript = await client.transcripts.transcribe({
      audio_url: uploadUrl,
      language_detection: true,
    })

    if (transcript.status === 'error') {
      return res.status(500).json({ error: transcript.error })
    }

    return res.status(200).json({ transcript: transcript.text })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: e.message })
  }
}
