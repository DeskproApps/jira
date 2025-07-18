import isJiraErrorWithData from "./isJiraErrorWithData";
import { JiraError } from "./jiraRequest";

export default function extractErrorMessages(e: unknown) {
  if (e instanceof JiraError && isJiraErrorWithData(e.data)) {
    const { errorMessages, error, message, errors } = e.data

    if (Array.isArray(errorMessages) && errorMessages.length > 0) {
      return errorMessages.join("; ")
    }

    if (typeof error === "string" && error.length > 0) {
      return error
    }

    if (typeof message === "string" && message.length > 0) {
      return message
    }

    if (errors && typeof errors === "object") {
      return Object.entries(errors)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join("; ")
    }
  }

  if (e instanceof Error) {
    return e.message
  }

  return null
}