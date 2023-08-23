import type { NextApiRequest, NextApiResponse } from "next"
import OpenAI from "openai"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { SuggestResponse } from "../../types"
import { profanity } from "../../utils/profanity"

const CACHE = new Map()
const MAX_REQUESTS_PER_USER = 10
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv() as any,
  limiter: Ratelimit.fixedWindow(MAX_REQUESTS_PER_USER, "6 h"),
  ephemeralCache: CACHE,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  try {
    const ip = getIp(req)
    const { success } = await ratelimit.limit(ip)
    if (!success) return errorResponse("rate-limit-user", 429)
  } catch (err) {
    console.error("Error with rate limiter", err)
    // todo: early exit?
  }

  // Fetch and parse joke suggestions
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID ?? "",
      max_tokens: 100,
      n: 3,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "You are a creative and hilarious comedy writer that loves to craft jokes",
        },
        {
          role: "user",
          content: formatPrompt(prompt),
        },
      ],
    })

    const results = completion.choices
      .map(({ message }) => message.content?.trim())
      .filter(isNonNullable)

    return res.status(200).json({ status: "success", prompt, results })
  } catch (err: any) {
    if (typeof err === "object" && err?.response?.status === 429) {
      return errorResponse("rate-limit-global", 429)
    }

    console.error("Error getting suggestions", err)
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
  return maybeAddPeriod(prompt.trim())
}

function maybeAddPeriod(str: string) {
  const lastChar = str.slice(-1)
  const punctuationMarks = [".", "!", "?", '"', "”", "…"]
  return punctuationMarks.includes(lastChar) ? str : `${str}.`
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
