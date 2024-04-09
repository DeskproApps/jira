import { useParams } from "react-router-dom";
import { MutateObject } from "../../components/Mutate/Object";
import { Stack } from "@deskpro/deskpro-ui";

export const EditObject = () => {
  const { objectId } = useParams<{
    objectId: string;
  }>();

  return (
    <Stack>
      <MutateObject objectId={objectId} />
    </Stack>
  );
};
