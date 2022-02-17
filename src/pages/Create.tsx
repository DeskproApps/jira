import {FC, useState} from "react";
import {CreateLinkIssue} from "../components/CreateLinkIssue/CreateLinkIssue";
import {IssueForm} from "../components/IssueForm/IssueForm";
import {addLinkCommentToIssue, createIssue} from "../context/StoreProvider/api";
import {useDeskproAppClient} from "@deskpro/app-sdk";
import {CreateIssueData} from "../context/StoreProvider/types";
import {useLoadLinkedIssues, useSetAppTitle} from "../hooks";
import {useStore} from "../context/StoreProvider/hooks";

export const Create: FC = () => {
    const { client } = useDeskproAppClient();
    const [ state, dispatch ] = useStore();
    const [loading, setLoading] = useState<boolean>(false);

    const loadIssues = useLoadLinkedIssues();

    useSetAppTitle("Add Issue");

    const onSubmit = (data: CreateIssueData) => {
        if (!client || !state.context?.data.ticket) {
            return;
        }

        setLoading(true);

        createIssue(client, data)
            .then(({ key }) => {
                client
                    .getEntityAssociation("linkedJiraIssues", state.context?.data.ticket.id as string)
                    .set(key);

                return key;
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
                dispatch({ type: "error", error });
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
            />
        </>
    );
};
