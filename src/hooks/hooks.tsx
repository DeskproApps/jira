import { ADFEntity, map, reduce } from "@atlaskit/adf-utils";
import {
  Link,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { P1 } from "@deskpro/deskpro-ui";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIssueComments, listLinkedIssues } from "../api/api";
import { IssueAttachment, IssueItem, JiraComment } from "../api/types/types";
import { queryClient } from "../query";
import {
  testUrlRegex,
  ticketReplyEmailsSelectionStateKey,
  ticketReplyNotesSelectionStateKey,
} from "../utils/utils";
import { OAUTH2_ACCESS_TOKEN_PATH } from '../constants';
import { Settings, TicketData } from "../types";

export const useLinkIssues = () => {
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();
  const { client } = useDeskproAppClient();
  const [isLinking, setIsLinking] = useState(false);
  const navigate = useNavigate();

  const deskproTicket = context?.data?.ticket;

  const linkIssues = useCallback(async (issuesIds: string[]) => {
    if (!context || !client || !deskproTicket) {
      return;
    }

    setIsLinking(true);

    const commentOnNote =
      context.settings?.default_comment_on_ticket_note === true;
    const commentOnReply =
      context.settings?.default_comment_on_ticket_reply === true;

    await Promise.all(
      issuesIds.map((issueId) =>
        client
          ?.getEntityAssociation("linkedJiraIssues", deskproTicket.id)
          .set(issueId)
          .then(async () => {
            await client.setState(
              `jira/items/${issueId}`,
              (((await client.getState(`jira/items/${issueId}`))[0]
                ?.data as number) ?? 0) + 1,
            );
            commentOnNote &&
              (await client?.setState(
                ticketReplyNotesSelectionStateKey(deskproTicket.id, issueId),
                {
                  id: issueId,
                  selected: true,
                },
              ));
            commentOnReply &&
              (await client?.setState(
                ticketReplyEmailsSelectionStateKey(deskproTicket.id, issueId),
                {
                  id: issueId,
                  selected: true,
                },
              ));
          }),
      ),
    );

    queryClient.clear();

    navigate("/redirect");

    setIsLinking(false);
  }, [context, client, deskproTicket, navigate]);

  const getLinkedIssues = useCallback(async () => {
    if (!client || !deskproTicket) return;

    return await client
      .getEntityAssociation("linkedJiraIssues", deskproTicket.id)
      .list();
  }, [client, deskproTicket]);

  const unlinkIssues = useCallback(async (issues: string[]) => {
      if (!context || !client || !deskproTicket?.id) return;

      return Promise.all(
        issues.map(async (issue) => {
          client
            ?.getEntityAssociation("linkedJiraIssues", deskproTicket.id)
            .delete(issue);

          await client.setState(
            `jira/items/${issue}`,
            (
              ((await client.getState(`jira/items/${issue}`))[0]?.data as number) ?? 1
            ) - 1,
          );
        }),
      )
      .then(() => navigate("/redirect"));
    },
    [client, context, deskproTicket, navigate],
  );

  return {
    getLinkedIssues,
    linkIssues,
    isLinking,
    unlinkIssues,
    context,
    client,
  };
};

export const useGetLinkedIssuesData = () => {
  const { getLinkedIssues } = useLinkIssues();

  const issues = useQueryWithClient(["linkedIssues"], async (client) => {
    const linkedIssues = await getLinkedIssues();

    return listLinkedIssues(client, linkedIssues ?? []);
  });

  return issues;
};

export const useSetAppTitle = (title: string): void => {
  const { client } = useDeskproAppClient();
  useEffect(() => client?.setTitle(title), [client, title]);
};

export const useWhenNoLinkedItems = (onNoLinkedItems: () => void) => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();

  useEffect(() => {
    if (!client || !context?.data?.ticket.id) {
      return;
    }

    client.getEntityAssociation("linkedJiraIssues", context.data.ticket.id)
      .list()
      .then((items) => items.length === 0 && onNoLinkedItems());
  }, [client, context?.data?.ticket.id, onNoLinkedItems]);
};

export const useLoadLinkedIssues = () => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();

  return async () => {
    if (!client || !context?.data?.ticket) {
      return [];
    }

    const keys = await client
      .getEntityAssociation("linkedJiraIssues", context.data.ticket.id)
      .list();

    const list = await listLinkedIssues(client, keys);

    client.setBadgeCount(list.length);

    const idToKeyUpdates = keys
      .filter((key) => /^[0-9]+$/.test(key.toString()))
      .map((id) => {
        const item = list.filter((item) => {
          return item.id.toString() === id.toString();
        })[0];
        if (item && context.data?.ticket) {
          return Promise.all([
            client.getEntityAssociation("linkedJiraIssues", context.data.ticket.id)
              .delete(id),
            client.getEntityAssociation("linkedJiraIssues", context.data.ticket.id)
              .set(item.key),
          ]);
        }

        return null;
      })
      .filter((update) => !!update);

    await Promise.all(idToKeyUpdates);

    return list;
  };
};

export const useFindLinkedIssueByKey = (linkedIssues: IssueItem[]) => {
  return (key: string): IssueItem | null =>
    (linkedIssues ?? []).filter((r: { key: string }) => r.key === key)[0] ??
    null;
};

export const useFindLinkedIssueAttachmentsByKey = (linkedIssueAttachments: {
  [key: string]: IssueAttachment[];
}) => {
  return (key: string): IssueAttachment[] =>
    (linkedIssueAttachments ?? {})[key] ?? [];
};

export const parseJiraDescription = (description: ADFEntity) => {
  if (!description) return;

  return map(description, (node) => {
    switch (node.type) {
      case "text":
        if (testUrlRegex.test(node.text || "")) {
          return (
            <Link href={node.text} target="_blank">
              {node.text}
            </Link>
          );
        }
        return node.text?.split("\n").reduce((a: JSX.Element[], c) => {
          const item = testUrlRegex.test(c || "") ? (
            <Link href={c} target="_blank">
              {c}
            </Link>
          ) : (
            <P1>{c}</P1>
          );

          return [...a, item];
        }, []);
      case "hardBreak":
        return <br />;
      case "inlineCard":
        if (node.attrs?.url) {
          return (
            <Link href={node.attrs.url as string} target="_blank">
              {node.attrs?.url}
            </Link>
          );
        } else {
          return "";
        }
    }
  });
};

export const useAdfToPlainText = (document: ADFEntity): string => {
  if (!document) {
    return "";
  }

  return reduce(
    document,
    (acc: string, node) => {
      switch (node.type) {
        case "text":
          acc += node.text;
          break;
        case "hardBreak":
          acc += "\n";
          break;
        case "inlineCard":
          acc += node.attrs?.url;
          break;
      }

      return acc;
    },
    "",
  );
};

export const useAdfToAnchoredText = () => {
  return (document: ADFEntity): string => {
    if (!document) {
      return "";
    }

    return reduce(
      document,
      (acc: string, node) => {
        if (node.type === "text") {
          if (node?.marks) {
            const links = (node.marks ?? []).filter(
              (m: { type: string }) => m.type === "link",
            )[0];
            if (links && links.attrs?.href) {
              acc += `<a href="${links.attrs.href}" target="_blank">${node.text}</a>`;
              return acc;
            }
          }

          acc += node.text;
        }

        return acc;
      },
      "",
    );
  };
};

export const useAssociatedEntityCount = (key: string) => {
  const { client } = useDeskproAppClient();
  const [entityCount, setEntityCount] = useState<number>(0);

  useEffect(() => {
    client
      ?.entityAssociationCountEntities("linkedJiraIssues", key)
      .then(setEntityCount);
  }, [client, key]);

  return entityCount;
};

export const useFindIssueComments = (
  issueKey: string,
): JiraComment[] | null => {
  const [comments, setComments] = useState<JiraComment[] | null>(null);

  useInitialisedDeskproAppClient((client) => {
    if (!issueKey) {
      return;
    }

    getIssueComments(client, issueKey)
      .then((comments) => setComments(comments));
  }, [issueKey]);

  return comments;
};

export function useLogOut() {
  const { client } = useDeskproAppClient();
  const navigate = useNavigate();

  const logOut = useCallback(() => {
    if (!client) {
      return;
    };

    client.setBadgeCount(0);
    client.deleteUserState(OAUTH2_ACCESS_TOKEN_PATH)
      .finally(() => {
        navigate('/log_in');
      });
  }, [client, navigate]);

  return { logOut };
};