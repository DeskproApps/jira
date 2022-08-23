import { Context } from "@deskpro/app-sdk";
import { Reducer } from "react";
import { ADFEntity } from "@atlaskit/adf-utils";
import {IssueMeta} from "../../types";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type StoreReducer = Reducer<State, Action>;

export type Dispatch = (action: Action) => void;

export type Page =
  "home"
  | "link"
  | "view"
  | "create"
  | "edit"
  | "comment"
  | "view_permissions"
;

export interface State {
  page?: Page;
  pageParams?: any;
  context?: TicketContext;
  linkIssueSearchResults?: { loading: boolean, list: IssueSearchItem[] };
  linkedIssuesResults?: { loading: boolean, list: IssueItem[] };
  linkedIssueAttachments?: { loading: boolean, list: { [key: string]: IssueAttachment[] } };
  // ToDo: need typings
  dataDependencies?: any;
  hasGeneratedIssueFormSuccessfully?: boolean;
  isUnlinkingIssue?: boolean;
  issueComments?: Record<string, JiraComment[]>;
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
  | { type: "issueComments", key: string, comments: JiraComment[] }
;

export interface TicketContext extends Context {
  data: { ticket: { id: string, permalinkUrl: string, subject: string; } }
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
  assigneeId: string;
  assigneeName: string;
  assigneeAvatarUrl: string;
  epicKey?: string;
  epicName?: string;
  priority: string;
  priorityId: string;
  priorityIconUrl: string;
  sprints?: {
    sprintBoardId?: number;
    sprintName?: string;
    sprintState?: string;
  }[],
  description?: ADFEntity;
  labels?: string[];
  customFields: Record<string, { value: any, meta: IssueMeta }>;
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

export interface IssueFormData {
  summary: string;
  description: string;
  issueTypeId: string;
  projectId: string;
  reporterUserId: string;
  assigneeUserId: string;
  labels: string[],
  priority: string;
  customFields: Record<string, any>;
  attachments: AttachmentFile[];
}

export interface AttachmentFile {
  name: string;
  size: number;
  id?: number;
  file?: File;
  delete?: boolean;
}

export class InvalidRequestResponseError extends Error {
  constructor(message: string, private _response: any) {
    super(message);
  }

  get response() {
    return this._response;
  }
}

export interface JiraComment {
  id: string;
  created: Date;
  updated: Date;
  body: ADFEntity;
  author: {
    accountId: string;
    displayName: string;
    avatarUrl: string;
  };
  renderedBody: string
}