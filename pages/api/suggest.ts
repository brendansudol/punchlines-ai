import type { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai"

type Data = any

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
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
      completion: completion.data.choices,
    })
  } catch (err: any) {
    console.error(err)
    return res.status(500).json({
      status: "error",
      error: err.message ?? err.toString() ?? "N/A",
    })
  }
}
