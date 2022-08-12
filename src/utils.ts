import { parseISO } from "date-fns";
import { get, has } from "lodash";
import { IDeskproClient } from "@deskpro/app-sdk";
import { State } from "./context/StoreProvider/types";
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

export const isNeedPriority = (
    state: State,
    selectedProjects: JiraProject["id"],
    issueTypeId: JiraIssueType["id"],
): boolean => {
    const projects = get(state, ["dataDependencies", "createMeta", "projects"], null);

    if (!Array.isArray(projects) || projects.length === 0) {
        return false;
    }

    if (!selectedProjects) {
        return false;
    }

    const project = (projects).find(({ id }: JiraProject) => id === selectedProjects);

    if (!project) {
        return false;
    }

    const issueType = project.issuetypes.find(({ id }: JiraIssueType) => id === issueTypeId);

    return has(issueType, ["fields", "priority"]);
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
