import { parseISO } from "date-fns";
import { get, has, times, floor, flatten } from "lodash";
import { IDeskproClient, useDeskproAppClient } from "@deskpro/app-sdk";
import { State, SearchResponse } from "./context/StoreProvider/types/types";
import { JiraIssueType, JiraProject } from "./components/IssueForm/types";

export const testUrlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;

export const getDateFromValue = (value: unknown): Date => {
  if (typeof value === "string") {
    return parseISO(value);
  } else if (typeof value === "number") {
    // to small to be ms, so its probably s
    if (value < 999999999999) {
      return new Date(value * 1000);
    } else {
      return new Date(value);
    }
  } else if (value instanceof Date) {
    return value;
  } else {
    throw new Error();
  }
};

export const isNeedField = ({
  state,
  fieldName,
  projectId,
  issueTypeId,
}: {
  state: State;
  fieldName: string;
  projectId: JiraProject["id"];
  issueTypeId: JiraIssueType["id"];
}): boolean => {
  const projects = get(
    state,
    ["dataDependencies", "createMeta", "projects"],
    null
  );

  if (!Array.isArray(projects) || projects.length === 0) {
    return false;
  }

  const project = projects.find(({ id }: JiraProject) => id === projectId);

  if (!project) {
    return false;
  }

  const issueType = project.issuetypes.find(
    ({ id }: JiraIssueType) => id === issueTypeId
  );

  return has(issueType, ["fields", fieldName]);
};

export const isRequiredField = ({
  state,
  fieldName,
  projectId,
  issueTypeId,
}: {
  state: State;
  fieldName: string;
  projectId: JiraProject["id"];
  issueTypeId: JiraIssueType["id"];
}): boolean => {
  const projects = get(
    state,
    ["dataDependencies", "createMeta", "projects"],
    null
  );

  if (!Array.isArray(projects) || projects.length === 0) {
    return false;
  }

  const project = projects.find(({ id }: JiraProject) => id === projectId);

  if (!project) {
    return false;
  }

  const issueType = project.issuetypes.find(
    ({ id }: JiraIssueType) => id === issueTypeId
  );

  return get(issueType, ["fields", fieldName, "required"]);
};

export const normalize = (source: undefined | any[], fieldName = "id") => {
  if (!Array.isArray(source)) {
    return {};
  }

  return source.reduce((acc, item) => {
    const key = item[fieldName];
    acc[key] = item;
    return acc;
  }, {});
};

export const registerReplyBoxNotesAdditionsTargetAction = (
  client: IDeskproClient,
  state: State
) => {
  const ticketId = state?.context?.data.ticket.id;
  const linkedIssues = state.linkedIssuesResults?.list ?? [];

  if (!ticketId) {
    return;
  }

  Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyNotesSelectionStateKey(ticketId, issue.id)
      )
    )
  ).then((flags) => {
    client.registerTargetAction(
      "jiraReplyBoxNoteAdditions",
      "reply_box_note_item_selection",
      {
        title: "Add to JIRA",
        payload: (state.linkedIssuesResults?.list ?? []).map((issue, idx) => ({
          id: issue.id,
          title: issue.key,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      }
    );
  });
};

export const registerReplyBoxEmailsAdditionsTargetAction = (
  client: IDeskproClient,
  state: State
) => {
  const ticketId = state?.context?.data.ticket.id;
  const linkedIssues = state.linkedIssuesResults?.list ?? [];

  if (!ticketId) {
    return;
  }

  Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyEmailsSelectionStateKey(ticketId, issue.id)
      )
    )
  ).then((flags) => {
    client.registerTargetAction(
      "jiraReplyBoxEmailAdditions",
      "reply_box_email_item_selection",
      {
        title: "Add to JIRA",
        payload: (state.linkedIssuesResults?.list ?? []).map((issue, idx) => ({
          id: issue.id,
          title: issue.key,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      }
    );
  });
};

export const ticketReplyNotesSelectionStateKey = (
  ticketId: string,
  issueId: string | number
) => `tickets/${ticketId}/notes/selection/${issueId}`;
export const ticketReplyEmailsSelectionStateKey = (
  ticketId: string,
  issueId: string | number
) => `tickets/${ticketId}/emails/selection/${issueId}`;

export const toBase64 = (payload: string): string => {
  if (window && typeof window.btoa === "function") {
    return window.btoa(payload);
  }

  throw new Error("no base64 encoding method available");
};

export const fetchAll = <T>(
  fn: (...args: any) => Promise<SearchResponse<T>>
) => {
  const MAX = 50;

  return async (client: IDeskproClient, method: string, baseUrl: string) => {
    const firstResponses = await fn(
      client,
      method,
      `${baseUrl}?maxResults=${MAX}&startAt=0`
    );
    const { total } = firstResponses;

    if (total < MAX) {
      return firstResponses.values;
    }

    const requests = times(floor(total / MAX), (idx) =>
      fn(
        client,
        method,
        `${baseUrl}?maxResults=${MAX}&startAt=${(idx + 1) * MAX}`
      )
    );

    const responses = await Promise.all(requests);

    return [
      ...firstResponses.values,
      ...flatten(responses.map(({ values }) => values)),
    ];
  };
};

export const addBlankTargetToLinks = (htmlString: string): string => {
  if (typeof DOMParser === "undefined") {
    return htmlString;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const links = doc.getElementsByTagName("a");

  for (let i = 0; i < links.length; i++) {
    links[i].setAttribute("target", "_blank");
  }

  return doc.documentElement.outerHTML;
};

import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export const useQueryWithClient = <
  TQueryFnData = unknown,
  TError = unknown,
  TData extends TQueryFnData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: string[],
  queryFn: (client: IDeskproClient) => Promise<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >
): UseQueryResult<TData> => {
  const { client } = useDeskproAppClient();

  const key = Array.isArray(queryKey) ? queryKey : [queryKey];

  return useQuery(
    [client, ...key] as unknown as TQueryKey,
    () => (client && queryFn(client)) as Promise<TQueryFnData>,
    {
      ...(options ?? {}),
      enabled:
        options?.enabled === undefined ? !!client : true && options?.enabled,
    }
  );
};
