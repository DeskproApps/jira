import { Button, Stack } from "@deskpro/deskpro-ui";
import { extractErrorMessages } from "@/api/jiraRequest";
import { FallbackRender } from "@sentry/react";
import { faRefresh, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import Callout from "../Callout";

export const ErrorFallback: FallbackRender = ({
  error,
  resetError,
}) => {
  const { pathname } = useLocation();
  const isAdmin = pathname.includes("/admin");

  let errorMessage

  if (isAdmin) {
    // @todo: Improve this. Currently it labels all unhandled exceptions as field mapping errors which can be incorrect.
    errorMessage = "Wrong Settings. Please ensure you inserted the correct settings before using field mapping"
  } else {
    errorMessage = extractErrorMessages(error) ?? "An unknown error occurred."
  }

  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <Stack style={{ width: "100%" }} vertical gap={10} padding={12} role="alert">
      <Callout
        accent="red"
        headingText={"Something went wrong"}
        icon={faExclamationCircle}
        style={{ width: "100%" }}
      >
        {errorMessage}
      </Callout>
      <Button
        text="Reload"
        onClick={resetError}
        icon={faRefresh}
        intent="secondary"
      />
    </Stack>
  );;
};
