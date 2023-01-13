export type SuggestResponse =
  | {
      status: "error"
      reason: string
    }
  | {
      status: "success"
      results: string[]
    }
