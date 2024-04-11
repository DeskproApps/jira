import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";
import { Stack } from "@deskpro/deskpro-ui";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";

export const EditObject = () => {
  const { objectId } = useParams<{
    objectId: string;
  }>();

  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("menuButton");
  });

  return (
    <Stack>
      <MutateObject objectId={objectId} />
    </Stack>
  );
};
