export interface JiraProject {
    id: string;
    key: string;
    name: string;
}

export interface JiraIssueType {
    id: string;
    name: string;
}

export interface JiraUser {
    accountId: string;
    displayName: string;
    active: boolean;
    accountType: "atlassian"|"app";
}

export interface JiraField {
    key: string;
    name: string;
    schema: {
        type: string;
        custom: string;
        customId: number;
    };
}

export const mandatoryFields = [
    "issuetype",
    "project",
    "reporter",
    "summary",
];