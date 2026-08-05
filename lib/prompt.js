export function buildPrompt(repName, callName, transcript) {
  return `You are a sales call coach for GIM (Green Industry Masterminds), a coaching company for lawn and landscaping businesses. Analyze the following sales call transcript using the GIM 7 Sales Laws framework.

Scoring framework:
- Type 1 (No-Quote Call, max 30pts): Discovery (0-10), Call Flow (0-10), Build Value (0-10)
- Type 2 (Quote and Close Call, max 50pts): Discovery (0-10), Build Value (0-10), Discurgency (0-10), Close (0-10), Overcome Objections (0-10)
- Type 3 (Re-Close Call, max 50pts): Preparation and Context (0-10), Urgency (0-10), Overcome Objections (0-10), Close (0-10), Follow-Up (0-10)

Determine the call type from the transcript. Return ONLY valid JSON with no text before or after. Avoid apostrophes in all string values. Use double quotes only.

{
  "repName": "${repName}",
  "callName": "${callName}",
  "callType": 1,
  "callTypeLabel": "No-Quote Call",
  "maxScore": 30,
  "scores": {"Discovery": 6, "Call Flow": 7, "Build Value": 5},
  "total": 18,
  "percentage": 60,
  "feedback": {
    "Discovery": "detailed feedback text",
    "Call Flow": "detailed feedback text",
    "Build Value": "detailed feedback text"
  },
  "strengths": ["strength one with detail", "strength two with detail"],
  "improvements": [
    {
      "what": "improvement title",
      "why": "why it matters explanation",
      "how": "specific how to do it script or example"
    },
    {
      "what": "improvement title",
      "why": "why it matters explanation",
      "how": "specific how to do it script or example"
    }
  ],
  "verdict": "One sentence overall verdict about the call."
}

Transcript:
${transcript}`
}
