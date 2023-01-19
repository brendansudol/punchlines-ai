import type { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai"
import limiterFactory from "lambda-rate-limiter"
import { SuggestResponse } from "../../types"

const MAX_PER_INTERVAL = 10
const ONE_MINUTE_MS = 60_000
const rateLimiter = limiterFactory({ interval: ONE_MINUTE_MS * 10 })

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

const MODEL_ID = process.env.OPENAI_MODEL_ID ?? "text-ada-001"
const RESPONSE_COUNT = 3
const MAX_TOKENS = 100

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuggestResponse>) {
  // rudimentary rate limiting check
  try {
    await rateLimiter.check(MAX_PER_INTERVAL, cleanHeader(req.headers["x-real-ip"]) ?? "")
  } catch (_) {
    return res.status(429).json({ status: "error", reason: "rate-limit" })
  }

  const { prompt } = req.body
  await sleep(500) // prevent loading ui flash

  if (prompt == null || typeof prompt !== "string" || prompt.length < 5) {
    return res.status(500).json({ status: "error", reason: "prompt-too-short" })
  }

  try {
    const completion = await openai.createCompletion({
      max_tokens: MAX_TOKENS,
      model: MODEL_ID,
      n: RESPONSE_COUNT,
      prompt: formatPrompt(prompt),
      stop: [" END"],
      temperature: 0.75,
    })

    return res.status(200).json({
      status: "success",
      results: completion.data.choices.map(({ text }) => text?.trim()).filter(isNonNullable),
    })
  } catch (err: any) {
    console.log("Error when fetching suggestions", err)
    return res.status(500).json({ status: "error", reason: "unknown" })
  }
}

function isNonNullable<T>(value: T | undefined | null): value is T {
  return value != null
}

function cleanHeader(header: string | string[] | undefined): string | undefined {
  if (header == null) return undefined
  return Array.isArray(header) ? header[0] : header
}

function formatPrompt(prompt: string): string {
  const promptCleaned = prompt.trim()
  return `${promptCleaned}\n\n###\n\n`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
