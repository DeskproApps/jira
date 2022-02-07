import { DependencyList, useEffect, useState } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import {getIssueAttachments, getIssueDependencies, listLinkedIssues} from "./context/StoreProvider/api";
import { useStore } from "./context/StoreProvider/hooks";
import { IssueAttachment, IssueItem } from "./context/StoreProvider/types";
import { ADFEntity, reduce } from "@atlaskit/adf-utils";

export const useSetAppTitle = (title: string, deps: DependencyList|undefined = []): void => {
  const { client } = useDeskproAppClient();
  useEffect(() => client?.setTitle(title), deps);
};

export const useLoadLinkedIssues = () => {
  const { client } = useDeskproAppClient();
  const [ state, dispatch ] = useStore();

  return async () => {
    if (!client || !state.context?.data.ticket.id) {
      return;
    }

    try {
      const keys = await client
        .getEntityAssociation("linkedJiraIssues", state.context?.data.ticket.id as string)
        .list()
      ;

      client.setBadgeCount(keys.length);

      const list = await listLinkedIssues(client, keys);
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

      dispatch({ type: "issueAttachments", key, attachments })
    } catch (e) {
      dispatch({ type: "error", error: `${e}` });
    }
  };
};

export const useFindLinkedIssueByKey = () => {
  const [ state ] = useStore();

  return (key: string): IssueItem|null => (state.linkedIssuesResults?.list ?? [])
    .filter((r) => r.key === key)[0] ?? null
  ;
}

export const useFindLinkedIssueAttachmentsByKey = () => {
  const [ state ] = useStore();

  return (key: string): IssueAttachment[] => (state.linkedIssueAttachments?.list ?? {})[key] ?? [];
}

export const useAdfToPlainText = () => {
  return (document: ADFEntity): string => reduce(document, (acc, node) => {
    if (node.type === "text") {
      acc += node.text;
    }

    return acc;
  }, "");
};

export const useAssociatedEntityCount = (key: string) => {
  const { client } = useDeskproAppClient();
  const [entityCount, setEntityCount] = useState<number>(0);

  useEffect(() => {
    client?.entityAssociationCountEntities("linkedJiraIssues", key).then(setEntityCount);
  }, [client, key]);

  return entityCount;
}

export const useLoadDataDependencies = () => {
  const { client } = useDeskproAppClient();
  const [ , dispatch ] = useStore();

  useEffect(() => {
    if (!client) {
      return;
    }

    getIssueDependencies(client)
        .then((deps) => dispatch({ type: "loadDataDependencies", deps }))
    ;
  }, [client, dispatch]);
};
