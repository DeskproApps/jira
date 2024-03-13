import { Context } from "@deskpro/app-sdk";
import { Reducer } from "react";
import { ADFEntity } from "@atlaskit/adf-utils";
import { IssueMeta } from "../../../types";

export type ApiRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export type StoreReducer = Reducer<State, Action>;

export type Dispatch = (action: Action) => void;

export type Page =
  | "home"
  | "link"
  | "view"
  | "create"
  | "edit"
  | "comment"
  | "view_permissions"
  | "verify_settings";

export interface State {
  page?: Page;
  pageParams?: any;
  context?: TicketContext;
  linkIssueSearchResults?: { loading: boolean; list: IssueSearchItem[] };
  linkedIssuesResults?: { loading: boolean; list: IssueItem[] };
  linkedIssueAttachments?: {
    loading: boolean;
    list: { [key: string]: IssueAttachment[] };
  };
  // ToDo: need typings
  dataDependencies?: any;
  hasGeneratedIssueFormSuccessfully?: boolean;
  isUnlinkingIssue?: boolean;
  issueComments?: Record<string, JiraComment[]>;
  _error?: Error | unknown;
}

export type Action =
  | { type: "changePage"; page: Page; params?: object }
  | { type: "loadContext"; context: Context }
  | { type: "linkIssueSearchListLoading" }
  | { type: "linkIssueSearchList"; list: IssueSearchItem[] }
  | { type: "linkIssueSearchListReset" }
  | { type: "linkedIssuesListLoading" }
  | { type: "linkedIssuesList"; list: IssueItem[] }
  | { type: "unlinkIssue"; key: string }
  | { type: "issueAttachmentsLoading" }
  | { type: "issueAttachments"; key: string; attachments: IssueAttachment[] }
  | { type: "loadDataDependencies"; deps: any }
  | { type: "failedToGenerateIssueForm" }
  | { type: "error"; error: string }
  | { type: "issueComments"; key: string; comments: JiraComment[] };

export interface TicketContext extends Context {
  data: { ticket: { id: string; permalinkUrl: string; subject: string } };
}

export interface SearchParams {
  withSubtask?: boolean;
  projectId?: string;
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
  }[];
  description?: ADFEntity;
  labels?: string[];
  customFields: Record<string, { value: any; meta: IssueMeta }>;
  parentKey?: string;
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
  issuetype: string;
  issue: string;
  project: string;
  reporter: string;
  assignee: string;
  labels: string[];
  priority: string;
  customFields?: Record<string, any>;
  attachments?: AttachmentFile[];
  parent: string;
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
  renderedBody: string;
}

export type User = {
  self: string;
  key: string;
  accountId: string;
  accountType: "atlassian";
  name: string;
  emailAddress: string;
  displayName: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  active: boolean;
  timeZone: string;
  groups: object;
  applicationRoles: object;
};

export type SearchResponse<T> = {
  nextPage: string;
  self: string;
  isLast: boolean;
  maxResults: number;
  startAt: number;
  total: number;
  values: T[];
};

export interface Field {
  id: string;
  key: keyof FullIssueFields;
  name: string;
  custom: boolean;
  orderable: boolean;
  navigable: boolean;
  searchable: boolean;
  clauseNames: string[];
  schema?: Schema;
  untranslatedName?: string;
  scope?: Scope;
}

export interface Schema {
  type: string;
  system?: string;
  custom?: string;
  customId?: number;
  items?: string;
  configuration?: Configuration;
}

export interface Configuration {
  "com.atlassian.jira.plugin.system.customfieldtypes:atlassian-team": boolean;
}

export interface Scope {
  type: string;
  project: Project;
}

export interface Project {
  id: string;
}

export interface FullIssue {
  expand: string;
  id: string;
  self: string;
  key: string;
  editmeta: Editmeta;
  fields: FullIssueFields;
}

export interface Editmeta {
  fields: EditmetaFields;
}

export interface EditmetaFields {
  summary: PurpleAssignee;
  issuetype: PurpleAssignee;
  parent: PurpleAssignee;
  description: PurpleAssignee;
  reporter: PurpleAssignee;
  customfield_10021: Customfield100;
  customfield_10000: Customfield100;
  labels: Issuelinks;
  customfield_10049: Customfield100;
  customfield_10029: Customfield100;
  environment: PurpleAssignee;
  customfield_10019: Customfield100;
  issuelinks: Issuelinks;
  assignee: PurpleAssignee;
}

export interface PurpleAssignee {
  required: boolean;
  schema: AssigneeSchema;
  name: string;
  key: string;
  autoCompleteUrl?: string;
  operations: string[];
  allowedValues?: Issuetype[];
  hasDefaultValue?: boolean;
}

export interface Issuetype {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
  entityId: string;
  hierarchyLevel: number;
}

export interface AssigneeSchema {
  type: string;
  system: string;
}

export interface Customfield100 {
  required: boolean;
  schema: Customfield10000_Schema;
  name: string;
  key: string;
  operations: string[];
  allowedValues?: AllowedValue[];
}

export interface AllowedValue {
  self: string;
  value: string;
  id: string;
}

export interface Customfield10000_Schema {
  type: string;
  custom: string;
  customId: number;
  items?: string;
}

export interface Issuelinks {
  required: boolean;
  schema: IssuelinksSchema;
  name: string;
  key: string;
  autoCompleteUrl: string;
  operations: string[];
}

export interface IssuelinksSchema {
  type: string;
  items: string;
  system: string;
}

export interface FullIssueFields {
  statuscategorychangedate: string;
  issuetype: Issuetype;
  timespent: null;
  customfield_10030: null;
  project: Project;
  customfield_10031: null;
  customfield_10032: null;
  fixVersions: any[];
  customfield_10033: null;
  customfield_10034: null;
  aggregatetimespent: null;
  resolution: null;
  customfield_10035: any[];
  customfield_10036: null;
  customfield_10037: null;
  customfield_10029: null;
  resolutiondate: null;
  workratio: number;
  lastViewed: null;
  watches: Watches;
  created: string;
  customfield_10020: null;
  customfield_10021: null;
  customfield_10022: null;
  customfield_10023: null;
  priority: Priority;
  customfield_10024: null;
  customfield_10025: null;
  labels: any[];
  customfield_10016: null;
  customfield_10017: null;
  customfield_10018: Customfield10018;
  customfield_10019: string;
  timeestimate: null;
  aggregatetimeoriginalestimate: null;
  versions: any[];
  issuelinks: any[];
  assignee: AssigneeClass;
  updated: string;
  status: Status;
  components: any[];
  customfield_10050: null;
  timeoriginalestimate: null;
  description: null;
  customfield_10010: null;
  customfield_10014: null;
  customfield_10015: null;
  customfield_10005: null;
  customfield_10006: null;
  security: null;
  customfield_10007: null;
  customfield_10008: null;
  customfield_10009: null;
  aggregatetimeestimate: null;
  summary: string;
  creator: AssigneeClass;
  subtasks: any[];
  customfield_10040: null;
  customfield_10041: null;
  customfield_10042: null;
  reporter: AssigneeClass;
  customfield_10043: null;
  customfield_10044: null;
  aggregateprogress: Progress;
  customfield_10000: string;
  customfield_10001: null;
  customfield_10002: null;
  customfield_10046: any[];
  customfield_10003: null;
  customfield_10047: null;
  customfield_10048: null;
  customfield_10004: null;
  customfield_10038: null;
  customfield_10039: null;
  environment: null;
  duedate: null;
  progress: Progress;
  votes: Votes;
}

export interface Progress {
  progress: number;
  total: number;
}

export interface AssigneeClass {
  self: string;
  accountId: string;
  avatarUrls: { [key: string]: string };
  displayName: string;
  active: boolean;
  timeZone: string;
  accountType: string;
}

export interface Customfield10018 {
  hasEpicLinkFieldDependency: boolean;
  showField: boolean;
  nonEditableReason: NonEditableReason;
}

export interface NonEditableReason {
  reason: string;
  message: string;
}

export interface Priority {
  self: string;
  iconUrl: string;
  name: string;
  id: string;
}

export interface Status {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: StatusCategory;
}

export interface StatusCategory {
  self: string;
  id: number;
  key: string;
  colorName: string;
  name: string;
}

export interface Votes {
  self: string;
  votes: number;
  hasVoted: boolean;
}

export interface Watches {
  self: string;
  watchCount: number;
  isWatching: boolean;
}
