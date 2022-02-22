import {FC, useEffect, useState} from "react";
import { IssueForm } from "../components/IssueForm/IssueForm";
import {
    buildCustomFieldMeta,
    createIssue,
    formatCustomFieldValueForSet,
    getIssueByKey, updateIssue
} from "../context/StoreProvider/api";
import { useDeskproAppClient, LoadingSpinner } from "@deskpro/app-sdk";
import { IssueFormData, InvalidRequestResponseError } from "../context/StoreProvider/types";
import {useAdfToPlainText, useLoadLinkedIssues, useSetAppTitle} from "../hooks";
import { useStore } from "../context/StoreProvider/hooks";
import { FormikHelpers } from "formik";
import { IssueMeta } from "../types";

interface EditProps {
    issueKey: string;
}

export const Edit: FC<EditProps> = ({ issueKey }: EditProps) => {
    const { client } = useDeskproAppClient();
    const [ state, dispatch ] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
    const [issue, setIssue] = useState<any>(null);

    const adfToPlainText = useAdfToPlainText();

    const loadIssues = useLoadLinkedIssues();

    useSetAppTitle(`Edit ${issueKey}`);

    useEffect(() => {
        client?.registerElement("home", { type: "home_button" });
        client?.deregisterElement("edit");
        client?.deregisterElement("viewContextMenu");
    }, [client, issueKey]);

    useEffect(() => {
        (client && issueKey) && getIssueByKey(client, issueKey).then(setIssue);
    }, [client, issueKey])

    if (!issue) {
        return (<LoadingSpinner />);
    }

    const onSubmit = (data: IssueFormData, _helpers: FormikHelpers<any>, meta: Record<string, IssueMeta>) => {
        if (!client || !state.context?.data.ticket || !issueKey) {
            return;
        }

        setLoading(true);
        setApiErrors({});

        updateIssue(client, issueKey, data, meta)
            .then(() => loadIssues())
            .then(() => {
                setLoading(false);
                dispatch({ type: "changePage", page: "view", params: { issueKey } });
            })
            .catch((error) => {
                if (error instanceof InvalidRequestResponseError && error.response?.errors) {
                    setApiErrors(error.response.errors);
                } else {
                    dispatch({ type: "error", error });
                }
            })
            .finally(() => {
                setLoading(false);
            })
        ;
    };

    const editMeta: Record<string, IssueMeta> = buildCustomFieldMeta(issue.editmeta.fields ?? {});

    const values = {
        summary: issue.fields.summary,
        description: adfToPlainText(issue.fields.description),
        issueTypeId: issue.fields.issuetype.id,
        projectId: issue.fields.project.id,
        reporterUserId: issue.fields.reporter.accountId,
        labels: issue.fields.labels ?? [],
        priority: issue.fields.priority.id,
        customFields: Object.keys(editMeta).reduce((fields, key) => {
            const value = formatCustomFieldValueForSet(editMeta[key], issue.fields[key] ?? null);

            if (value === undefined) {
                return fields;
            }

            return {
                ...fields,
                [key]: formatCustomFieldValueForSet(editMeta[key], issue.fields[key] ?? null),
            };
        }, {}),
    };

    return (
        <IssueForm
            type="update"
            onSubmit={onSubmit}
            loading={loading}
            apiErrors={apiErrors}
            values={values}
            editMeta={editMeta}
        />
    );
};
