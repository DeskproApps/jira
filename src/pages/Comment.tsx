import {FC, useState} from "react";
import {useSetAppTitle} from "../hooks";
import {
    Button,
    FormikField,
    Label,
    Stack,
    TextArea,
    useDeskproAppClient,
    useInitialisedDeskproAppClient
} from "@deskpro/app-sdk";
import {useStore} from "../context/StoreProvider/hooks";
import {IntlProvider} from "react-intl";
import { Formik } from "formik";
import {addIssueComment, getIssueComments} from "../context/StoreProvider/api";

interface CommentFormValues {
    comments: string;
}

interface CommentProps {
    issueKey: string;
}

export const Comment: FC<CommentProps> = ({ issueKey }: CommentProps) => {
    const {client} = useDeskproAppClient();
    const [, dispatch] = useStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useSetAppTitle("Add Comment");

    useInitialisedDeskproAppClient((client) => {
        client.deregisterElement("edit");
        client.deregisterElement("addIssue");
        client.deregisterElement("viewContextMenu");
        client.deregisterElement("homeContextMenu");
    }, [issueKey]);

    const initialValues: CommentFormValues = {
        comments: "",
    };

    const submit = (data: CommentFormValues) => {
        if (!client) {
            return;
        }

        setIsLoading(true);

        addIssueComment(client, issueKey, data.comments)
            .then(() => getIssueComments(client, issueKey))
            .then((comments) => dispatch({ type: "issueComments", key: issueKey, comments }))
            .then(() => dispatch({ type: "changePage", page: "view", params: { issueKey } }))
            .finally(() => setIsLoading(false))
        ;
    };

    return (
        <>
            <IntlProvider locale="en">
                <Formik<CommentFormValues>
                    initialValues={initialValues}
                    onSubmit={submit}
                >
                    {({ submitForm, values }) => (
                        <>
                            <Stack vertical gap={12} style={{ width: "100%" }}>
                                <FormikField<string> name="comments">
                                    {([field], { id, error }) => (
                                        <Label
                                            htmlFor={id}
                                            label="New Comment"
                                            error={error}
                                        >
                                            <TextArea
                                                id={id}
                                                {...field}
                                                variant="inline"
                                                placeholder="Add Value"
                                                rows={5}
                                                className={`paragraph-field ${field.value ? "has-value" : ""}`}
                                            />
                                        </Label>
                                    )}
                                </FormikField>
                                <Stack justify="space-between" style={{ width: "100%" }}>
                                    <Button
                                        text="Add"
                                        disabled={!values.comments}
                                        onClick={submitForm}
                                        loading={isLoading}
                                    />
                                    <Button
                                        text="Cancel"
                                        intent="secondary"
                                        onClick={() => dispatch({ type: "changePage", page: "view", params: { issueKey } })}
                                    />
                                </Stack>
                            </Stack>
                        </>
                    )}
                </Formik>
            </IntlProvider>
        </>
    );
};
