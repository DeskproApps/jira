import { ADFEntity } from "@atlaskit/adf-utils";
import { IDeskproClient, useDeskproAppClient } from "@deskpro/app-sdk";
import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { parseISO } from "date-fns";
import { ProjectElement } from "../api/types/createMeta";
import { FieldMeta, IssueBean, IssueItem } from "../api/types/types";
import { JiraIssueType, JiraProject } from "../components/Mutate/types";
import { useAdfToPlainText } from "../hooks/hooks";
import { Layout, Settings, FieldType, DateTime } from "../types";
import { JiraIssueSchema } from "../schema/schema";
import { UserBean } from "../api/types/fieldsValue";

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

export const normalize = <T extends { id: string }>(
  source: undefined|T[],
  fieldName: keyof T = "id",
): Record<string, T> => {
  if (!Array.isArray(source)) {
    return {};
  }

  return source.reduce<Record<string, T>>((acc, item) => {
    const key = item[fieldName] as string;
    acc[key] = item;
    return acc;
  }, {});
};

export const registerReplyBoxNotesAdditionsTargetAction = async (
  client: IDeskproClient,
  ticketId: string,
  linkedIssues: IssueItem[],
) => {
  if (!ticketId) {
    return;
  }

  await Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyNotesSelectionStateKey(ticketId, issue.id),
      ),
    ),
  ).then((flags) => {
    return client.registerTargetAction(
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

export const registerReplyBoxEmailsAdditionsTargetAction = async (
  client: IDeskproClient,
  ticketId: string,
  linkedIssues: IssueItem[],
) => {
  if (!ticketId) {
    return;
  }

  await Promise.all(
    linkedIssues.map((issue) =>
      client.getState<{ selected: boolean }>(
        ticketReplyEmailsSelectionStateKey(ticketId, issue.id),
      ),
    ),
  ).then((flags) => {
    return client.registerTargetAction(
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
    const parsedError = JSON.parse(error) as { status: string; message: string };

    if (parsedError.status && parsedError.message) {
      return `Status: ${parsedError.status} \n Message: ${parsedError.message}`;
    }

    return error;
  } catch {
    return error;
  }
};

export const makeFirstLetterUppercase = (str: string) => {
  if (!str) return str;

  if (typeof str === "object") return "-";

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const isNil = (value: unknown): value is null|undefined => {
  return value === null || value === undefined;
};

export const isPrimitive = (value: unknown): value is string|number|boolean => {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
};

export const substitutePlaceholders = (
  string: string,
  obj: Pick<Settings, "domain"|"username"|"api_key"> & Partial<IssueItem>,
): string => {
  if (!obj) return string;

  for (const [key, value] of Object.entries(obj)) {
    if (isPrimitive(value)) {
      string = string.replace(`__${key}__`, String(value));
    }
  }
  return string;
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

  const issueType = project.issuetypes.find(({ id }) => id === issueTypeId);

  return issueType?.fields?.[fieldName] !== undefined;
};

export const jiraIssueToFormValues = (
  issue: IssueBean["fields"],
  usableFields: FieldMeta[],
) => {
  const values = Object.keys(issue).reduce<JiraIssueSchema>((acc, key) => {
    const usableField = usableFields.find((e) => e.key === key)

    if (!usableField) {
      return acc;
    }

    switch (usableField?.schema?.type) {
      case "user": {
        acc[key] = {
          id: (issue[key] as UserBean)?.accountId,
        };

        break;
      }

      case "date":
      case "datetime": {
        if (!issue[key]) break;
        acc[key] = new Date(issue[key] as DateTime);

        break;
      }

      case "string": {
        if (usableField.schema.system === "description" || usableField.schema.custom === FieldType.TEXT_PARAGRAPH) {
          acc[key] = useAdfToPlainText(issue[key] as ADFEntity);

          break;
        }
      }
      // eslint-disable-next-line no-fallthrough
      default:
        acc[key] = issue[key];
    }

    return acc;
  }, {} as JiraIssueSchema);

  return values;
};

export const errorToStringWithoutBraces = (
  obj: Record<string, string>,
  metaMap: Record<FieldMeta["key"], FieldMeta>,
) => {
  return Object.entries(obj)
    .map(([key, value]) => `${metaMap[key]?.name || key}: ${value}`)
    .join("; ");
};

export const getLayout = (mapping: Settings["mapping"]): Layout => {
  const settingsLayout = mapping || "{}";
  let data: Layout;

  try {
    data = JSON.parse(settingsLayout) as Layout;

    if (Array.isArray(data.detailView) && Array.isArray(data.listView)) {
      // eslint-disable-next-line no-console
      console.error("Invalid Layout JSON");
      data = { detailView: [], listView: [] };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Invalid Layout JSON:", error);
    data = { detailView: [], listView: [] };
  }

  return data;
};
