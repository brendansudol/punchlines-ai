import type { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai"
import { SuggestResponse } from "../../types"

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse<SuggestResponse>) {
  const { prompt } = req.body

  if (prompt == null || prompt.length < 5) {
    return res.status(500).json({
      status: "error",
      reason: "prompt",
    })
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-ada-001",
      prompt: "Hello world",
      max_tokens: 100,
      temperature: 0.5,
      n: 3,
      stop: [" END"],
    })

    return res.status(200).json({
      status: "success",
      results: completion.data.choices.map((choice) => choice.text).filter(isNonNullable),
    })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({
      status: "error",
      reason: err.message ?? err.toString() ?? "N/A",
    })
  }
}

function isNonNullable<T>(value: T | undefined | null): value is T {
  return value != null
}
