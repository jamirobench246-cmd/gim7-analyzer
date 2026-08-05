# GIM 7 Sales Call Analyzer

AI-powered sales call scoring tool using the GIM 7 Sales Laws framework.

## Features
- Upload MP3/WAV audio files for automatic transcription
- OR paste a transcript directly
- Scores calls using Claude AI (Type 1, 2, or 3)
- Download a PDF report per call

## Deploy to Vercel

### Step 1 — Push to GitHub
1. Create a new repo on github.com
2. Upload all these files to the repo

### Step 2 — Connect to Vercel
1. Go to vercel.com and click "Add New Project"
2. Import your GitHub repo
3. Click "Deploy" (don't change any settings)

### Step 3 — Add Environment Variables
In your Vercel project settings → Environment Variables, add:
- `ANTHROPIC_API_KEY` — your Anthropic API key
- `ASSEMBLYAI_API_KEY` — your AssemblyAI API key

### Step 4 — Redeploy
After adding the env vars, go to Deployments and click "Redeploy".

That's it — your app is live!

## Local Development
```bash
npm install
cp .env.example .env.local
# Fill in your API keys in .env.local
npm run dev
```
