import { useLocation } from "react-router-dom";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";

import { parseJsonErrorMessage } from "../../utils/utils";
import { Button, H1, H2, Stack } from "@deskpro/deskpro-ui";
import { FallbackRender } from "@sentry/react";

export const ErrorFallback: FallbackRender = ({
  error,
  resetError,
}) => {
  const { pathname } = useLocation();
  const isAdmin = pathname.includes("/admin");

  // eslint-disable-next-line no-console
  console.error(error);

  return (
    <Stack vertical gap={10} role="alert">
      <H1>Something went wrong:</H1>
      <H2 style={{ maxWidth: "100%" }}>
        {isAdmin
          // @todo: Improve this. Currently it labels all unhandled exceptions as field mapping errors which can be incorrect.
          ? "Wrong Settings. Please ensure you inserted the correct settings before using field mapping"
          : parseJsonErrorMessage((error as Error).message) || (error as unknown as string)
        }
      </H2>
      <Button
        text="Reload"
        onClick={resetError}
        icon={faRefresh}
        intent="secondary"
      />
    </Stack>
  );
};
