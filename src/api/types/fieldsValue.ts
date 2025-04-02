import { RequiredProps } from "../../types";
import { IssueBean } from "./types";
import { components } from "./schema";

export type Issuetype = {
  self: string;
  id: string;
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
  entityId: string;
  hierarchyLevel: number;
};

export type Project = {
  self: string;
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
};

export type ParentFieldValue = {
  id: string;
  key: string;
  self: string;
  fields?:{
    summary?: string
    status?: {
      self?: string
    }
  }
};

export type Watches = Required<components["schemas"]["Watchers"]>;

export type Priority = Required<Pick<
  components["schemas"]["Priority"],
  "avatarId"|"description"|"iconUrl"|"id"|"isDefault"|"name"|"schemes"|"self"|"statusColor"
>>;

export type IssueLink = {
  id: string;
  key?: string;
  self: string;
  type: {
      id: string;
      name: string;
      inward: "relates to",
      outward: "relates to",
      self: string;
  },
  inwardIssue?: {
    id: IssueBean["id"];
    key: IssueBean["key"];
    self: IssueBean["self"];
    fields: {
      summary: IssueBean["fields"]["summary"];
      status: IssueBean["fields"]["status"]
      priority: Priority;
      issuetype: Issuetype;
    }
  };
  outwardIssue?: {
      id: IssueBean["id"];
      key: IssueBean["key"];
      self: IssueBean["self"];
      fields: {
          summary: IssueBean["fields"]["summary"];
          status: IssueBean["fields"]["status"]
          priority: Priority;
          issuetype: Issuetype;
      }
  }
};

export type UserBean = Omit<
  components["schemas"]["UserDetails"],
  "avatarUrls"
> & {
  avatarUrls: Required<components["schemas"]["AvatarUrlsBean"]>;
};

export interface StatusCategory {
  self: string;
  id: number;
  key: string;
  colorName: string;
  name: string;
}

export interface Status {
  self: string;
  description: string;
  iconUrl: string;
  name: string;
  id: string;
  statusCategory: StatusCategory;
}

export type Components = {
  self: string;
  id: string;
  name: string;
};

export type Progress = {
  progress: number;
  total: number;
}

export type Votes = RequiredProps<components["schemas"]["Votes"], "self"|"voters"|"hasVoted">;

export type Option = {
  id: string;
  self: string;
  value: string;
};
