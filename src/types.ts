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

export interface ReplyBoxNoteSelection {
    id: string;
    selected: boolean;
}