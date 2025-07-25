import {
  TwoButtonGroup,
  useDeskproAppEvents,
  useDeskproElements,
  useDeskproLatestAppContext
} from "@deskpro/app-sdk";
import { useState } from "react";
import { faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons";
import { LinkContact } from "../../components/Link/Object";
import { MutateObject } from "../../components/Mutate/Object";
import { Container } from "../../components/Layout";
import { useLogOut } from '../../hooks';
import { Payload } from '../../types';
import { ContextData, ContextSettings } from "@/types/deskpro";

export const FindOrCreate = ({ pageParam }: { pageParam?: 0 | 1 }) => {
  const [page, setPage] = useState<0 | 1>(pageParam || 0);
  const { logOut } = useLogOut();

  const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();

  useDeskproElements(({ deRegisterElement, registerElement, clearElements }) => {
    const isUsingOAuth2 = context?.settings.use_advanced_connect === false || context?.settings.use_api_key === false;

    clearElements();
    deRegisterElement('menuButton');
    registerElement('addIssue', { type: 'plus_button' });
    registerElement('homeButton', { type: 'home_button' });

    if (isUsingOAuth2) {
      registerElement('menu', {
        type: 'menu',
        items: [{
          title: 'Log Out',
          payload: {
            type: 'logOut'
          }
        }]
      });
    }
  }, [context?.settings.use_advanced_connect, context?.settings.use_api_key]);

  useDeskproAppEvents({
    // @ts-expect-error parameters
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
        twoLabel="Create Issue"
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