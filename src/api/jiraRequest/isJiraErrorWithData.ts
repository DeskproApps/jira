interface JiraErrorData {
  error?: string
  errorMessages?: string[]
  /**
   * This is only available when parsing an error response fails.
   */
  message?: string
  errors?: Record<string, unknown>
}

export default function isJiraErrorWithData(data: unknown): data is JiraErrorData {
  if (
    typeof data === "object" &&
    data !== null &&
    (
      ("error" in data && typeof data.error === "string") ||
      ("errorMessages" in data && Array.isArray(data.errorMessages)) ||
      ("errors" in data && typeof data.errors === "object" && data.errors !== null) ||
      ("message" in data && typeof data.message === "string")
    )
  ) {
    return true
  }
  return false
}