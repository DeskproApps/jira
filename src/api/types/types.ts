import { ADFEntity } from "@atlaskit/adf-utils";
import { components } from "./schema";
import { RequiredProps, DateTime, FieldType } from "../../types";
import { Issuetype, Project, Watches, Priority, UserBean, Components, Progress, Status, Votes } from "./fieldsValue";
import { SprintValue, CustomFieldsValues, CustomFieldValue } from "./customFieldsValue";

export type Schemas = components["schemas"];

export type IssuePicker = Required<components["schemas"]["SuggestedIssue"]>;

export type PickerSection = Omit<
  components["schemas"]["IssuePickerSuggestionsIssueType"],
  "id"|"issues"
> & {
  id: string;
  issues: IssuePicker[];
};

export type IssuesPicker = Omit<components["schemas"]["IssuePickerSuggestions"], "sections"> & {
  sections: PickerSection[];
};

export type FieldsValues = {
  description: ADFEntity;
  summary: string;
  issuetype: Issuetype;
  project: Project;
  workratio: number;
  watches: Watches;
  priority: Priority;
  labels: string[];
  fixVersions: { id: number }[];
  versions: { id: number }[];
  assignee: UserBean;
  creator: UserBean;
  reporter: UserBean;
  created: DateTime;
  updated: DateTime;
  resolutiondate: DateTime;
  statuscategorychangedate: DateTime;
  components: Components[];
  duedate: DateTime;
  status: Status;
  votes: Votes;
  timespent: string|null;
  subtasks: [];
  aggregateprogress: Progress;
  timeoriginalestimate: null;
  security: null;
  resolution: null;
  lastViewed: null;
  timeestimate: null;
  aggregatetimespent: null;
  aggregatetimeoriginalestimate: null;
  aggregatetimeestimate: null;
  environment: null;
  progress: Progress;
} & CustomFieldsValues;

export type IssueBean = RequiredProps<
  components["schemas"]["IssueBean"],
  "id"|"key"|"self"|"expand"
> & {
  fields: FieldsValues;
  editmeta: {
    fields: Record<FieldMeta["key"], FieldMeta>;
  };
};

export type SearchIssues = Omit<components["schemas"]["SearchResults"], "issues"> & {
  issues: IssueBean[];
};

export type AvatarUrls = Required<components["schemas"]["AvatarUrlsBean"]>;

export type SearchIssueItem = Omit<
  FieldsValues,
  "summary"|"status"
> & {
  id: string;
  key: string;
  keyHtml?: string;
  summary: string;
  summaryHtml?: string;
  status: string;
  projectKey?: string;
  projectName?: string;
  reporterId?: string;
  reporterName?: string;
  reporterAvatarUrl?: string;
  epicKey?: string;
  epicName?: string;
  linkedCount?: number;
};

export type IssueItem = SearchIssueItem & {
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatarUrl?: string;
  priority?: Priority;
  priorityId?: string;
  priorityIconUrl?: string;
  sprints?: {
    sprintBoardId: SprintValue["boardId"];
    sprintName: SprintValue["name"];
    sprintState: SprintValue["state"];
  }[];
  description?: ADFEntity;
  labels?: string[];
  parentKey?: string;
  customFields?: Record<FieldMeta["key"], { value: CustomFieldValue, meta: FieldMeta }>;
}

export type IssueComment = {
  id: string;
  author: UserBean;
  created: DateTime;
  updated: DateTime;
  renderedBody: string;
  body: ADFEntity;
};

export type Version = RequiredProps<
  components["schemas"]["Version"],
  "archived"|"description"|"id"|"name"|"projectId"|"released"|"self"
>;

export interface SearchParams {
  withSubtask?: boolean;
  projectId?: string;
}

export interface IssueAttachment {
  id: number;
  filename: string;
  sizeBytes: number;
  sizeMb: number;
  url: string;
}

export type IssueFormData = {
  summary?: string;
  description?: string;
  issuetype?: string;
  issue?: string;
  project?: string;
  reporter?: string;
  assignee?: string;
  labels?: string[];
  priority?: string;
  customFields?: Record<FieldMeta["key"], unknown>;
  attachments?: AttachmentFile[];
  parent?: string;
} & Record<FieldMeta["key"], unknown>

export interface AttachmentFile {
  name: string;
  size: number;
  id?: number;
  file?: File;
  delete?: boolean;
}

export type ErrorResponse = {
  errorMessages: [],
  errors: Record<FieldMeta["key"], string>;
};

export class InvalidRequestResponseError extends Error {
  public _response: ErrorResponse;

  constructor(message: string, _response: ErrorResponse) {
    super(message);
    this._response = _response;
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
    accountId: UserBean["accountId"];
    displayName: UserBean["displayName"];
    avatarUrl: UserBean["avatarUrls"]["24x24"];
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
  schema: Schema;
  untranslatedName?: string;
  scope?: Scope;
}

export interface Schema {
  type: string;
  custom?: FieldType;
  system?: string;
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
  assignee: PurpleAssignee;
  components: FieldMeta;
  description: PurpleAssignee;
  summary: PurpleAssignee;
  environment: PurpleAssignee;
  issuetype: PurpleAssignee;
  parent: PurpleAssignee;
  reporter: PurpleAssignee;
  labels: Issuelinks;
  issuelinks: Issuelinks;
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



export interface AssigneeSchema {
  type: string;
  system: string;
}

export interface AllowedValue {
  self: string;
  value: string;
  id: string;
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

export interface FullIssueFields extends Record<FieldMeta["key"], unknown> {
  statuscategorychangedate: string;
  issuetype: Issuetype;
  timespent: null;
  project: Project;
  fixVersions: Version[];
  aggregatetimespent: null;
  resolution: null;
  resolutiondate: null;
  workratio: number;
  lastViewed: null;
  watches: Watches;
  created: string;
  priority: Priority;
  labels: string[];
  timeestimate: null;
  aggregatetimeoriginalestimate: null;
  versions: Version[];
  issuelinks: Issuelinks[];
  assignee: UserBean;
  updated: string;
  status: Status;
  components: Components[];
  timeoriginalestimate: null;
  description: null;
  security: null;
  aggregatetimeestimate: null;
  summary: string;
  creator: UserBean;
  subtasks: IssueBean[];
  reporter: UserBean;
  aggregateprogress: Progress;
  environment: null;
  duedate: null;
  progress: Progress;
  votes: Votes;
};

export interface NonEditableReason {
  reason: string;
  message: string;
}

export type FieldMeta<V = unknown> = {
  /** @description The list of values allowed in the field. */
  allowedValues?: V[];
  /** @description The URL that can be used to automatically complete the field. */
  autoCompleteUrl?: string;
  /** @description The configuration properties. */
  configuration?: { [key: string]: unknown };
  /** @description The default value of the field. */
  defaultValue?: unknown;
  /** @description Whether the field has a default value. */
  hasDefaultValue?: boolean;
  /** @description The key of the field. */
  key: string;
  /** @description The name of the field. */
  name: string;
  /** @description The list of operations that can be performed on the field. */
  operations?: string[];
  /** @description Whether the field is required. */
  required?: boolean;
  /** @description The data type of the field. */
  schema?: Schema;
  id?: string;
};


export type IssueFieldsMetaResponse = {
  fields: Record<string, FieldMeta>;
};

export type TransfornedFieldMeta = FieldMeta & {
  type: FieldType;
};

export type GroupPicker = Required<components["schemas"]["FoundGroup"]>;

export type GroupsPicker = Omit<components["schemas"]["FoundGroups"], "groups"> & {
  groups: GroupPicker[]
};
