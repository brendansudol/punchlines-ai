import type { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  return res.status(200).json({
    "x-real-ip": req.headers["x-real-ip"],
    "x-forwarded-for": req.headers["x-forwarded-for"],
    "x-vercel-ip-latitude": req.headers["x-vercel-ip-latitude"],
    "x-vercel-ip-longitude": req.headers["x-vercel-ip-longitude"],
    remoteAddress: req.connection.remoteAddress,
    remoteAddress2: req.socket.remoteAddress,
  })
}
