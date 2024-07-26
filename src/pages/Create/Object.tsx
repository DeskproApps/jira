import { Stack } from "@deskpro/deskpro-ui";
import { MutateObject } from "../../components/Mutate/Object";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";

export const CreateObject = () => {
  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("menuButton");
  });
  return (
    <Stack>
      <MutateObject />
    </Stack>
  );
};
