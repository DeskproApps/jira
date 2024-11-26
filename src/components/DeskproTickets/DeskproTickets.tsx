import { FC, useState } from "react";
import { P5 } from "@deskpro/deskpro-ui";
import { useInitialisedDeskproAppClient } from "@deskpro/app-sdk";
import { SearchIssueItem, IssueItem } from "../../api/types/types";


type Props = {
  issue: SearchIssueItem|IssueItem;
};

const DeskproTickets: FC<Props> = ({ issue }) => {
  const [ticketCount, setTicketCount] = useState<number>(0);

  useInitialisedDeskproAppClient((client) => {
    if (issue?.id || issue?.key) {
      Promise.all([
        client.entityAssociationCountEntities("linkedJiraIssues", issue.id),
        client.entityAssociationCountEntities("linkedJiraIssues", issue.key),
      ])
        .then(([idCount, keyCount]) => setTicketCount(idCount + keyCount))
        .catch(() => {});
    }
  }, [issue?.id, issue?.key]);

  return <P5>{ticketCount}</P5>;
};

export { DeskproTickets };
