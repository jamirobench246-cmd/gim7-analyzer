import { AssemblyAI } from 'assemblyai'
import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const form = new IncomingForm({ keepExtensions: true, maxFileSize: 100 * 1024 * 1024 })

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'File upload failed' })

    const file = files.audio?.[0] || files.audio
    if (!file) return res.status(400).json({ error: 'No audio file provided' })

    try {
      const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY })
      const filePath = file.filepath || file.path
      const audioData = fs.readFileSync(filePath)

      const uploadResponse = await client.files.upload(audioData)

      const transcript = await client.transcripts.transcribe({
        audio_url: uploadResponse,
        language_detection: true,
      })

      if (transcript.status === 'error') {
        return res.status(500).json({ error: transcript.error })
      }

      fs.unlinkSync(filePath)
      return res.status(200).json({ transcript: transcript.text })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: e.message })
    }
  })
}
