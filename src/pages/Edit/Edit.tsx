import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { Container } from "../../components/Layout";

export const EditObject = () => {
  const { objectId } = useParams<{
    objectId: string;
  }>();

  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("menuButton");
  });

  return (
    <Container>
      <MutateObject objectId={objectId} />
    </Container>
  );
};
