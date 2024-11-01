import { IDeskproClient, useDeskproAppClient } from "@deskpro/app-sdk";
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { Assignee, Attachment, ProjectElement } from "../api/types/createMeta";
import { IssueItem } from "../api/types/types";
import { JiraIssueType, JiraProject } from "../components/Mutate/types";
import { useAdfToPlainText } from "../hooks/hooks";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  ticketId: string,
  linkedIssues: IssueItem[],
) => {
  if (!ticketId) {
    return;
  }

  Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyNotesSelectionStateKey(ticketId, issue.id),
      ),
    ),
  ).then((flags) => {
    client.registerTargetAction(
      "jiraReplyBoxNoteAdditions",
      "reply_box_note_item_selection",
      {
        title: "Add to JIRA",
        payload: (linkedIssues ?? []).map((issue, idx) => ({
          id: issue.id,
          title: issue.key,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      },
    );
  });
};

export const registerReplyBoxEmailsAdditionsTargetAction = (
  client: IDeskproClient,
  ticketId: string,
  linkedIssues: IssueItem[],
) => {
  if (!ticketId) {
    return;
  }

  Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyEmailsSelectionStateKey(ticketId, issue.id),
      ),
    ),
  ).then((flags) => {
    client.registerTargetAction(
      "jiraReplyBoxEmailAdditions",
      "reply_box_email_item_selection",
      {
        title: "Add to JIRA",
        payload: (linkedIssues ?? []).map((issue, idx) => ({
          id: issue.id,
          title: issue.key,
          selected: flags[idx][0]?.data?.selected ?? false,
        })),
      },
    );
  });
};

export const ticketReplyNotesSelectionStateKey = (
  ticketId: string,
  issueId: string | number,
) => `tickets/${ticketId}/notes/selection/${issueId}`;
export const ticketReplyEmailsSelectionStateKey = (
  ticketId: string,
  issueId: string | number,
) => `tickets/${ticketId}/emails/selection/${issueId}`;

export const toBase64 = (payload: string): string => {
  if (window && typeof window.btoa === "function") {
    return window.btoa(payload);
  }

  throw new Error("no base64 encoding method available");
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

export const useQueryWithClient = <
  TQueryFnData = unknown,
  TError = unknown,
  TData extends TQueryFnData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  queryKey: string[],
  queryFn: (client: IDeskproClient) => Promise<TQueryFnData>,
  options?: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >,
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
    },
  );
};

export const parseJsonErrorMessage = (error: string) => {
  try {
    const parsedError = JSON.parse(error);

    return `Status: ${parsedError.status} \n Message: ${parsedError.message}`;
  } catch {
    return error;
  }
};

export const parseJsonResponse = (response?: string) => {
  try {
    if (!response) return undefined;
    return JSON.parse(response);
  } catch {
    return undefined;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getObjectValue = (obj: any, keyString: string) => {
  const keys = keyString.split(".");

  let value = obj;

  for (const key of keys) {
    value = value[key];

    if (value === undefined) {
      return undefined;
    }
  }

  return value;
};

export const makeFirstLetterUppercase = (str: string) => {
  if (!str) return str;

  if (typeof str === "object") return "-";

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const substitutePlaceholders = (
  string: string,
  obj: Record<string, string>,
) => {
  if (!obj) return string;

  for (const [key, value] of Object.entries(obj)) {
    string = string.replace(`__${key}__`, value);
  }
  return string;
};

export const deleteRegexGroups = (string: string, regex: RegExp) => {
  return string.replace(regex, function (match, group1, group2) {
    // Return the match without the capture groups
    return match.replace(group1, "").replace(group2, "");
  });
};

export const isNeedField = ({
  projects,
  fieldName,
  projectId,
  issueTypeId,
}: {
  projects: ProjectElement[];
  fieldName: string;
  projectId: JiraProject["id"];
  issueTypeId: JiraIssueType["id"];
}): boolean => {
  if (!Array.isArray(projects) || projects.length === 0) {
    return false;
  }

  const project = projects.find(({ id }: JiraProject) => id === projectId);

  if (!project) {
    return false;
  }

  const issueType = project.issuetypes.find(
    ({ id }: JiraIssueType) => id === issueTypeId,
  );

  return issueType?.fields?.[fieldName] !== undefined;
};

export const jiraIssueToFormValues = (
  issue: Record<string, any>,
  usableFields: (Assignee | Attachment)[],
) => {
  const values = Object.keys(issue).reduce(
    (acc, key) => {
      if (!usableFields.find((e) => e.key === key)) return acc;

      const usableField = usableFields.find((e) => e.key === key);

      switch (usableField?.schema.type) {
        case "user": {
          acc[key] = {
            id: issue[key as keyof IssueItem]?.accountId,
          };

          break;
        }

        case "date":
        case "datetime": {
          if (!issue[key as keyof IssueItem]) break;
          acc[key] = new Date(issue[key as keyof IssueItem]);

          break;
        }

        case "string": {
          if (
              usableField.schema.system === "description"
              || usableField.schema.custom === "com.atlassian.jira.plugin.system.customfieldtypes:textarea"
            ) {
            acc[key] = useAdfToPlainText(issue[key as keyof IssueItem]);

            break;
          }
        }
        // eslint-disable-next-line no-fallthrough
        default:
          acc[key] = issue[key as keyof IssueItem];
      }

      return acc;
    },
    {} as Record<string, unknown>,
  );

  return values;
};

export const objectToStringWithoutBraces = (obj: Record<string, string>) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" ");
};
