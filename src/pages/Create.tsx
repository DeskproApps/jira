import {FC, useEffect, useState} from "react";
import {CreateLinkIssue} from "../components/CreateLinkIssue/CreateLinkIssue";
import {IssueForm} from "../components/IssueForm/IssueForm";
import {addLinkCommentToIssue, createIssue, getIssueByKey} from "../context/StoreProvider/api";
import {useDeskproAppClient} from "@deskpro/app-sdk";
import {IssueFormData, InvalidRequestResponseError} from "../context/StoreProvider/types";
import {useLoadLinkedIssues, useSetAppTitle} from "../hooks";
import {useStore} from "../context/StoreProvider/hooks";
import {FormikHelpers} from "formik";
import {IssueMeta} from "../types";

export const Create: FC = () => {
    const { client } = useDeskproAppClient();
    const [ state, dispatch ] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

    const loadIssues = useLoadLinkedIssues();

    useSetAppTitle("Add Issue");

    useEffect(() => {
        client?.deregisterElement("edit");
    }, [client, state]);

    const onSubmit = (data: IssueFormData, _helpers: FormikHelpers<any>, meta: Record<string, IssueMeta>) => {
        if (!client || !state.context?.data.ticket) {
            return;
        }

        setLoading(true);
        setApiErrors({});

        createIssue(client, data, meta)
            .then(({ key }) => getIssueByKey(client, key))
            .then(async (issue) => {
                await client
                    .getEntityAssociation("linkedJiraIssues", state.context?.data.ticket.id as string)
                    .set(issue.key, issue)
                ;

                return issue.key;
            })
            .then((key) => addLinkCommentToIssue(
                client,
                key,
                state.context?.data.ticket.id as string,
                state.context?.data.ticket.permalinkUrl as string
            ))
            .then(() => loadIssues())
            .then(() => {
                setLoading(false);
                dispatch({ type: "changePage", page: "home" });
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

    return (
        <>
            <CreateLinkIssue selected="create" />
            <IssueForm
                type="create"
                onSubmit={onSubmit}
                loading={loading}
                apiErrors={apiErrors}
            />
        </>
    );
};
