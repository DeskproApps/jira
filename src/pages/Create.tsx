import { FC } from "react";
import {CreateLinkIssue} from "../components/CreateLinkIssue/CreateLinkIssue";
import {IssueForm} from "../components/IssueForm/IssueForm";

export const Create: FC = () => {

    const onSubmit = () => {
        // ...
    };

    return (
        <>
            <CreateLinkIssue selected="create" />
            <IssueForm
                type="create"
                onSubmit={onSubmit}
                loading={false} // todo: loading flag needs to be set by request processor
            />
        </>
    );
};
