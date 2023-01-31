type SuccessResponse = {
  status: "success"
  prompt: string
  results: string[]
}

type ErrorResponse = {
  status: "error"
  reason:
    | "prompt-too-short"
    | "prompt-too-long"
    | "profanity"
    | "rate-limit-user"
    | "rate-limit-global"
    | "unknown"
}

export type SuggestResponse = SuccessResponse | ErrorResponse

export namespace SuggestResponse {
  export type Success = SuccessResponse
  export type Error = ErrorResponse
}
