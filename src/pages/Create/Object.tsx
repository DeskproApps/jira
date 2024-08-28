import { MutateObject } from "../../components/Mutate/Object";
import { Container } from "../../components/Layout";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";

export const CreateObject = () => {
  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("menuButton");
  });
  return (
    <Container>
      <MutateObject />
    </Container>
  );
};
