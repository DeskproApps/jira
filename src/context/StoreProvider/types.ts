import { Context } from "@deskpro/app-sdk";
import { Reducer } from "react";
import { ADFEntity } from "@atlaskit/adf-utils";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type StoreReducer = Reducer<State, Action>;

export type Dispatch = (action: Action) => void;

export type Page =
  "home"
  | "link"
  | "view"
  | "create"
;

export interface State {
  page?: Page;
  pageParams?: any;
  context?: TicketContext;
  linkIssueSearchResults?: { loading: boolean, list: IssueSearchItem[] };
  linkedIssuesResults?: { loading: boolean, list: IssueItem[] };
  linkedIssueAttachments?: { loading: boolean, list: { [key: string]: IssueAttachment[] } };
  dataDependencies?: any;
  hasGeneratedIssueFormSuccessfully?: boolean;
  isUnlinkingIssue?: boolean;
  _error?: Error|unknown;
}

export type Action =
  | { type: "changePage", page: Page, params?: object }
  | { type: "loadContext", context: Context }
  | { type: "linkIssueSearchListLoading" }
  | { type: "linkIssueSearchList", list: IssueSearchItem[] }
  | { type: "linkIssueSearchListReset" }
  | { type: "linkedIssuesListLoading" }
  | { type: "linkedIssuesList", list: IssueItem[] }
  | { type: "unlinkIssue", key: string }
  | { type: "issueAttachmentsLoading" }
  | { type: "issueAttachments", key: string, attachments: IssueAttachment[] }
  | { type: "loadDataDependencies", deps: any }
  | { type: "failedToGenerateIssueForm" }
  | { type: "error", error: string }
;

export interface TicketContext extends Context {
  data: { ticket: { id: string, permalinkUrl: string } }
}

export interface IssueItem {
  id: number;
  key: string;
  summary: string;
  projectKey: string;
  projectName: string;
  status: string;
  reporterId: string;
  reporterName: string;
  reporterAvatarUrl: string;
  epicKey?: string;
  epicName?: string;
  sprints?: {
    sprintBoardId?: number;
    sprintName?: string;
    sprintState?: string;
  }[],
  description?: ADFEntity;
  labels?: string[];
  fields: Record<string, any>;
  editMeta: Record<string, IssueMeta>;
}

export interface IssueSearchItem extends IssueItem {
  keyHtml: string;
  summaryHtml: string;
}

export interface IssueAttachment {
  id: number;
  filename: string;
  sizeBytes: number;
  sizeMb: number;
  url: string;
}

export interface CreateIssueData {
  summary: string;
  description: string;
  issueTypeId: string;
  projectId: string;
  reporterUserId: string;
  customFields: Record<string, any>;
}

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
