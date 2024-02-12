import { useEffect, useState } from "react";
import { P5 } from "@deskpro/deskpro-ui";
import {
  Link,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import {
  getIssueAttachments,
  getIssueComments,
  getIssueDependencies,
  listLinkedIssues,
} from "./context/StoreProvider/api";
import { useStore } from "./context/StoreProvider/hooks";
import {
  IssueAttachment,
  IssueItem,
  JiraComment,
} from "./context/StoreProvider/types";
import { ADFEntity, reduce, map } from "@atlaskit/adf-utils";
import { testUrlRegex } from "./utils";

export const useSetAppTitle = (title: string): void => {
  useInitialisedDeskproAppClient((client) => {
    client.setTitle(title);
  }, [title]);
};

export const useWhenNoLinkedItems = (onNoLinkedItems: () => void) => {
  const { client } = useDeskproAppClient();
  const [state] = useStore();

  useEffect(() => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    client
      .getEntityAssociation("linkedJiraIssues", state.context?.data.ticket.id as string)
      .list()
      .then((items) => items.length === 0 && onNoLinkedItems());
  }, [client, state.context?.data.ticket.id, onNoLinkedItems]);
};

export const useLoadLinkedIssues = () => {
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();
  const [, dispatch] = useStore();

  return async () => {
    if (!client || !context?.data.ticket.id) {
      return;
    }

    try {
      const keys = await client.getEntityAssociation("linkedJiraIssues", context?.data.ticket.id).list();

      client.setBadgeCount(keys.length);

      const list = await listLinkedIssues(client, keys);

      const idToKeyUpdates = keys
        .filter((key) => /^[0-9]+$/.test(key.toString()))
        .map((id) => {
          const item = list.filter(
            (item) => item.id.toString() === id.toString()
          )[0];
          if (item) {
            return Promise.all([
              client
                .getEntityAssociation("linkedJiraIssues", context?.data.ticket.id as string)
                .delete(id),
              client
                .getEntityAssociation("linkedJiraIssues", context?.data.ticket.id as string)
                .set(item.key),
            ]);
          }

          return null;
        })
        .filter((update) => !!update);

      await Promise.all(idToKeyUpdates);

      dispatch({ type: "linkedIssuesList", list });
    } catch (e) {
      dispatch({ type: "error", error: `${e}` });
    }
  };
};

export const useLoadLinkedIssueAttachment = () => {
  const { client } = useDeskproAppClient();
  const [, dispatch] = useStore();

  return async (key: string) => {
    if (!client) {
      return;
    }

    dispatch({ type: "issueAttachmentsLoading" });

    try {
      const attachments = await getIssueAttachments(client, key);

      dispatch({ type: "issueAttachments", key, attachments });
    } catch (e) {
      dispatch({ type: "error", error: `${e}` });
    }
  };
};

export const useFindLinkedIssueByKey = () => {
  const [state] = useStore();

  return (key: string): IssueItem | null =>
    (state.linkedIssuesResults?.list ?? []).filter((r) => r.key === key)[0] ??
    null;
};

export const useFindLinkedIssueAttachmentsByKey = () => {
  const [state] = useStore();

  return (key: string): IssueAttachment[] =>
    (state.linkedIssueAttachments?.list ?? {})[key] ?? [];
};

export const parseJiraDescription = (description?: ADFEntity): any => {
  if (!description) return;

  return map(description, (node) => {
        switch (node.type) {
          case "text":
            if (testUrlRegex.test(node.text || "")) {
              return (
                <Link href={node.text} target="_blank">{node.text}</Link>
              );
            }
            return node.text?.split("\n").reduce((a: JSX.Element[],c) => {
              const item = testUrlRegex.test(c || "") ? (
                <Link href={c} target="_blank">{c}</Link>
              ) : <P5>{c}</P5>

              return [...a, item]
            }, [])
          case "hardBreak":
            return <br />;
          case "inlineCard":
            return (
              <Link href={node.attrs?.url} target="_blank">{node.attrs?.url}</Link>
            );
        }
      })

};

export const useAdfToPlainText = () => {
  return (document: ADFEntity): string => {
    if (!document) {
      return "";
    }

    return reduce(
      document,
      (acc, node) => {
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
      ""
    );
  };
};

export const useAdfToAnchoredText = () => {
  return (document: ADFEntity): string => {
    if (!document) {
      return "";
    }

    return reduce(
      document,
      (acc, node) => {
        if (node.type === "text") {
          if (node?.marks) {
            const links = (node.marks ?? []).filter(
              (m) => m.type === "link"
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
      ""
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

export const useLoadDataDependencies = () => {
  const { client } = useDeskproAppClient();
  const [, dispatch] = useStore();

  useEffect(() => {
    if (!client) {
      return;
    }

    getIssueDependencies(client).then((deps) =>
      dispatch({ type: "loadDataDependencies", deps })
    );
  }, [client, dispatch]);
};

export const useFindIssueComments = (
  issueKey: string
): JiraComment[] | null => {
  const [state, dispatch] = useStore();

  useInitialisedDeskproAppClient(
    (client) => {
      if (!issueKey) {
        return;
      }

      getIssueComments(client, issueKey).then((comments) =>
        dispatch({ type: "issueComments", key: issueKey, comments })
      );
    },
    [issueKey]
  );

  if (!state?.issueComments || !state?.issueComments[issueKey]) {
    return null;
  }

  return state?.issueComments[issueKey];
};
