type SuccessResponse = {
  status: "success"
  prompt: string
  results: string[]
}

type ErrorResponse = {
  status: "error"
  reason: string
}

export type SuggestResponse = SuccessResponse | ErrorResponse

export namespace SuggestResponse {
  export type Success = SuccessResponse
  export type Error = ErrorResponse
}
