import {
  TwoButtonGroup,
  useDeskproAppEvents,
  useDeskproElements
} from "@deskpro/app-sdk";
import { useState } from "react";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { LinkContact } from "../../components/Link/Object";
import { MutateObject } from "../../components/Mutate/Object";
import { Container } from "../../components/Layout";
import { useLogOut } from '../../hooks';
import { Payload } from '../../types';

export const FindOrCreate = ({ pageParam }: { pageParam?: 0 | 1 }) => {
  const [page, setPage] = useState<0 | 1>(pageParam || 0);
  const { logOut } = useLogOut();

  useDeskproElements(({ deRegisterElement, registerElement }) => {
    deRegisterElement('menuButton');
    registerElement('addIssue', {type: 'plus_button'});
    registerElement('homeButton', {type: 'home_button'});
  });

  useDeskproAppEvents({
    // @ts-ignore
    onElementEvent(_: string, __: string, payload: Payload) {
      switch (payload.type) {
        case 'logOut':
          logOut();
      };
    }
  }, [logOut]);

  return (
    <Container>
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
      />
      {
        {
          0: <LinkContact />,
          1: <MutateObject />,
        }[page]
      }
    </Container>
  );
};