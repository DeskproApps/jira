import { parseISO } from "date-fns";
import { get, has, times, floor, flatten } from "lodash";
import { IDeskproClient } from "@deskpro/app-sdk";
import { State, SearchResponse } from "./context/StoreProvider/types";
import { JiraIssueType, JiraProject } from "./components/IssueForm/types";

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

export const isNeedField = ({ state, fieldName, projectId, issueTypeId }: {
    state: State,
    fieldName: string,
    projectId: JiraProject["id"],
    issueTypeId: JiraIssueType["id"],
}): boolean => {
    const projects = get(state, ["dataDependencies", "createMeta", "projects"], null);

    if (!Array.isArray(projects) || projects.length === 0) {
        return false;
    }

    const project = (projects).find(({ id }: JiraProject) => id === projectId);

    if (!project) {
        return false;
    }

    const issueType = project.issuetypes.find(({ id }: JiraIssueType) => id === issueTypeId);

    return has(issueType, ["fields", fieldName]);
};

export const isRequiredField = ({ state, fieldName, projectId, issueTypeId }: {
    state: State,
    fieldName: string,
    projectId: JiraProject["id"],
    issueTypeId: JiraIssueType["id"],
}): boolean => {
    const projects = get(state, ["dataDependencies", "createMeta", "projects"], null);

    if (!Array.isArray(projects) || projects.length === 0) {
        return false;
    }

    const project = (projects).find(({ id }: JiraProject) => id === projectId);

    if (!project) {
        return false;
    }

    const issueType = project.issuetypes.find(({ id }: JiraIssueType) => id === issueTypeId);

    return get(issueType, ["fields", fieldName, "required"]);
};

export const normalize = (source: undefined|any[], fieldName = "id") => {
    if (!Array.isArray(source)) {
        return {};
    }

    return source.reduce((acc, item) => {
        const key = item[fieldName];
        acc[key] = item;
        return acc;
    }, {});
};

export const registerReplyBoxNotesAdditionsTargetAction = (client: IDeskproClient, state: State) => {
    const ticketId = state?.context?.data.ticket.id;
    const linkedIssues = (state.linkedIssuesResults?.list ?? []);

    if (!ticketId) {
        return;
    }

    Promise
        .all(linkedIssues.map((issue) => client.getState<{ selected: boolean }>(ticketReplyNotesSelectionStateKey(ticketId, issue.id))))
        .then((flags) => {
            client.registerTargetAction("jiraReplyBoxNoteAdditions", "reply_box_note_item_selection", {
                title: "Add to JIRA",
                payload: (state.linkedIssuesResults?.list ?? []).map((issue, idx) => ({
                    id: issue.id,
                    title: issue.key,
                    selected: flags[idx][0]?.data?.selected ?? false,
                })),
            });
        })
    ;
};

export const registerReplyBoxEmailsAdditionsTargetAction = (client: IDeskproClient, state: State) => {
    const ticketId = state?.context?.data.ticket.id;
    const linkedIssues = (state.linkedIssuesResults?.list ?? []);

    if (!ticketId) {
        return;
    }

    Promise
        .all(linkedIssues.map((issue) => client.getState<{ selected: boolean }>(ticketReplyEmailsSelectionStateKey(ticketId, issue.id))))
        .then((flags) => {
            client.registerTargetAction("jiraReplyBoxEmailAdditions", "reply_box_email_item_selection", {
                title: "Add to JIRA",
                payload: (state.linkedIssuesResults?.list ?? []).map((issue, idx) => ({
                    id: issue.id,
                    title: issue.key,
                    selected: flags[idx][0]?.data?.selected ?? false,
                })),
            });
        })
    ;
};

export const ticketReplyNotesSelectionStateKey = (ticketId: string, issueId: string|number) => `tickets/${ticketId}/notes/selection/${issueId}`;
export const ticketReplyEmailsSelectionStateKey = (ticketId: string, issueId: string|number) => `tickets/${ticketId}/emails/selection/${issueId}`;

export const toBase64 = (payload: string): string => {
    if (window && typeof window.btoa === 'function') {
        return window.btoa(payload);
    }

    throw new Error('no base64 encoding method available');
}

export const retryUntilPagination = <T>(fn: (...args: any) => Promise<SearchResponse<T>>) => {
    const MAX = 50;

    return async (client: IDeskproClient, method: string, baseUrl: string) => {
        const firstResponses = await fn(client, method, `${baseUrl}?maxResults=${MAX}&startAt=0`)
        const { total } = firstResponses;

        if (total < MAX) {
            return firstResponses.values;
        }

        const requests = times(floor(total / MAX), (idx) =>
            fn(client, method, `${baseUrl}?maxResults=${MAX}&startAt=${(idx + 1) * MAX}`)
        );

        const responses = await Promise.all(requests);

        return [
            ...firstResponses.values,
            ...flatten(responses.map(({ values }) => values)),
        ];
    };
};
