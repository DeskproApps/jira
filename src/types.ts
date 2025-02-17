import type { Context } from "@deskpro/app-sdk";

/** common */
export type RequiredProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** An ISO-8601 encoded UTC date time string. Example value: `"2022-07-26T14:30:00.000+0100"` */
export type DateTime = string;

/** request */
export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

/** Deskpro */
export type TicketData = {
  ticket: { id: string; permalinkUrl: string; subject: string }
};
export interface TicketContext extends Context {
  data: TicketData;
};

export type Settings = {
  use_deskpro_saas?: boolean;
  domain?: string;
  username?: string;
  api_key?: string;
  verify_settings?: string;
  default_comment_on_ticket_reply?: boolean;
  default_comment_on_ticket_note?: boolean;
  ticket_subject_as_issue_summary?: boolean;
  mapping?: string; // "{ "detailView": [], "listView": [] }"
};

export type Layout = {
  detailView: string[];
  listView: string[];
  project?: string;
  issuetype?: string;
};

/** Jira */
export enum FieldType {
    REQUEST_LANG = "com.atlassian.servicedesk.servicedesk-lingo-integration-plugin:sd-request-language",
    TEXT_PLAIN = "com.atlassian.jira.plugin.system.customfieldtypes:textfield",
    TEXT_PARAGRAPH = "com.atlassian.jira.plugin.system.customfieldtypes:textarea",
    DATE = "com.atlassian.jira.plugin.system.customfieldtypes:datepicker",
    DATETIME = "com.atlassian.jira.plugin.system.customfieldtypes:datetime",
    CHECKBOXES = "com.atlassian.jira.plugin.system.customfieldtypes:multicheckboxes",
    LABELS = "com.atlassian.jira.plugin.system.customfieldtypes:labels",
    NUMBER = "com.atlassian.jira.plugin.system.customfieldtypes:float",
    RADIO_BUTTONS = "com.atlassian.jira.plugin.system.customfieldtypes:radiobuttons",
    SELECT_CASCADE = "com.atlassian.jira.plugin.system.customfieldtypes:cascadingselect",
    SELECT_MULTI = "com.atlassian.jira.plugin.system.customfieldtypes:multiselect",
    SELECT_SINGLE = "com.atlassian.jira.plugin.system.customfieldtypes:select",
    URL = "com.atlassian.jira.plugin.system.customfieldtypes:url",
    USER_PICKER = "com.atlassian.jira.plugin.system.customfieldtypes:userpicker",
    EPIC = "com.pyxis.greenhopper.jira:gh-epic-link",
    SPRINT = "com.pyxis.greenhopper.jira:gh-sprint",
}

export type IssueMeta = {
        type: FieldType.TEXT_PLAIN;
        key: string;
        name: string;
        required: boolean;
    } | {
        type: FieldType.DATE;
        key: string;
        name: string;
        required: boolean;
    } | {
        type: FieldType.DATETIME;
        key: string;
        name: string;
        required: boolean;
    } | {
        type: FieldType.REQUEST_LANG;
        key: string;
        name: string;
        required: boolean;
        allowedValues: {
            languageCode: string;
            displayName: string;
        }[];
    } | {
        type: FieldType.CHECKBOXES;
        key: string;
        name: string;
        required: boolean;
        allowedValues: {
            id: string;
            value: string;
        }[];
    } | {
        type: FieldType.LABELS;
        key: string;
        name: string;
        required: boolean;
        autoCompleteUrl: string;
    } | {
        type: FieldType.NUMBER;
        key: string;
        name: string;
        required: boolean;
    } | {
        type: FieldType.TEXT_PARAGRAPH;
        key: string;
        name: string;
        required: boolean;
    } | {
        type: FieldType.RADIO_BUTTONS;
        key: string;
        name: string;
        required: boolean;
        allowedValues: {
            id: string;
            value: string;
        }[];
    } | {
        type: FieldType.SELECT_CASCADE;
        key: string;
        name: string;
        required: boolean;
        allowedValues: {
            id: string;
            value: string;
        }[];
    } | {
        type: FieldType.SELECT_MULTI;
        key: string;
        name: string;
        required: boolean;
        allowedValues: {
            id: string;
            value: string;
        }[];
    } | {
        type: FieldType.SELECT_SINGLE;
        key: string;
        name: string;
        required: boolean;
        allowedValues: {
            id: string;
            value: string;
        }[];
    } | {
        type: FieldType.URL;
        key: string;
        name: string;
        required: boolean;
    } | {
        type: FieldType.USER_PICKER;
        key: string;
        name: string;
        required: boolean;
        autoCompleteUrl: string;
    }
;

export interface ReplyBoxSelection {
    id: string;
    selected: boolean;
}

export interface ReplyBoxOnReplyNote {
    note: string;
}

export interface ReplyBoxOnReplyEmail {
  email: string;
}

export type JiraIssueSchema = {
  project: { id: string };
  issuetype: { id: string };
  [key: string]: unknown;
};
