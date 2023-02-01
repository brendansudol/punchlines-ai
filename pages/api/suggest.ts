import type { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai"
import profanity from "leo-profanity"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { SuggestResponse } from "../../types"

const CACHE = new Map()
const MAX_REQUESTS_PER_USER = 8
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv() as any,
  limiter: Ratelimit.fixedWindow(MAX_REQUESTS_PER_USER, "6 h"),
  ephemeralCache: CACHE,
})

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

const FALLBACK_MODEL_ID = process.env.OPENAI_MODEL_ID ?? "__FALLBACK_MODEL_ID__"
const MODEL_IDS = {
  best: process.env.OPENAI_MODEL_ID_BEST ?? FALLBACK_MODEL_ID,
  good: process.env.OPENAI_MODEL_ID_GOOD ?? FALLBACK_MODEL_ID,
  okay: process.env.OPENAI_MODEL_ID_OKAY ?? FALLBACK_MODEL_ID,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuggestResponse>) {
  function errorResponse(reason: SuggestResponse.Error["reason"], statusCode = 500) {
    return res.status(statusCode).json({ status: "error", reason })
  }

  const { prompt } = req.body
  await sleep(500) // prevent loading ui flash

  // Validate prompt
  if (prompt == null || typeof prompt !== "string" || prompt.length < 5) {
    return errorResponse("prompt-too-short")
  } else if (prompt.length > 150) {
    return errorResponse("prompt-too-long")
  } else if (profanity.check(prompt)) {
    return errorResponse("profanity")
  }

  // IP-based rate limiting
  let modelId = MODEL_IDS.best // start w/ best model, but use cheaper ones if need be
  try {
    const ip = getIp(req)
    const { success, remaining } = await ratelimit.limit(ip)
    if (!success) return errorResponse("rate-limit-user", 429)
    if (remaining <= MAX_REQUESTS_PER_USER / 2) modelId = MODEL_IDS.good
  } catch (err) {
    console.log("Error with rate limiter", err)
    modelId = MODEL_IDS.okay
  }

  // Fetch and parse joke suggestions
  try {
    const completion = await openai.createCompletion({
      max_tokens: 100,
      model: modelId,
      n: 3,
      prompt: formatPrompt(prompt),
      stop: [" END", " THE_END"],
      temperature: 0.7,
    })

    const results = completion.data.choices.map(({ text }) => text?.trim()).filter(isNonNullable)
    return res.status(200).json({ status: "success", prompt, results })
  } catch (err: any) {
    if (typeof err === "object" && err?.response?.status === 429) {
      return errorResponse("rate-limit-global", 429)
    }

    console.log("Error getting suggestions", err)
    return errorResponse("unknown")
  }
}

function isNonNullable<T>(value: T | undefined | null): value is T {
  return value != null
}

function getIp(req: NextApiRequest): string {
  return (
    parseHeader(req.headers["x-real-ip"]) ??
    parseHeader(req.headers["x-forwarded-for"]) ??
    req.socket.remoteAddress ??
    "__FALLBACK_IP__"
  )
}

function parseHeader(header: string | string[] | undefined): string | undefined {
  if (header == null) return undefined
  return Array.isArray(header) ? header[0] : header
}

function formatPrompt(prompt: string): string {
  const promptCleaned = maybeAddPeriod(prompt.trim())
  return `${promptCleaned}\n\n###\n\n`
}

function maybeAddPeriod(str: string) {
  const lastChar = str.slice(-1)
  const punctuationMarks = [".", "!", "?", '"', "”", "…"]
  return punctuationMarks.includes(lastChar) ? str : `${str}.`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
