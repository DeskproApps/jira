import { faRefresh } from "@fortawesome/free-solid-svg-icons";

import { AnyIcon, Button, H1, H2, Stack } from "@deskpro/deskpro-ui";

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  return (
    <Stack vertical gap={10} role="alert">
      <H1>Something went wrong:</H1>
      <H2 style={{ maxWidth: "100%" }}>{error?.message || error}</H2>
      <Button
        text="Reload"
        onClick={resetErrorBoundary}
        icon={faRefresh as AnyIcon}
        intent="secondary"
      />
    </Stack>
  );
};
