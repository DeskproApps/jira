import {
  TwoButtonGroup,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useState } from "react";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { LinkContact } from "../../components/Link/Object";
import { Stack } from "@deskpro/deskpro-ui";
import { MutateObject } from "../../components/Mutate/Object";

export const FindOrCreate = ({ pageParam }: { pageParam?: 0 | 1 }) => {
  const [page, setPage] = useState<0 | 1>(pageParam || 0);

  useInitialisedDeskproAppClient((client) => {
    client.deregisterElement("menuButton");
  });

  return (
    <Stack vertical>
      <Stack style={{ alignSelf: "center" }}>
        <TwoButtonGroup
          selected={
            {
              0: "one",
              1: "two",
            }[page] as "one" | "two"
          }
          oneIcon={faMagnifyingGlass}
          twoIcon={faPlus}
          oneLabel="Find Issues"
          twoLabel="Create Issues"
          oneOnClick={() => setPage(0)}
          twoOnClick={() => setPage(1)}
        ></TwoButtonGroup>
      </Stack>

      {
        {
          0: <LinkContact />,
          1: <MutateObject />,
        }[page]
      }
    </Stack>
  );
};
