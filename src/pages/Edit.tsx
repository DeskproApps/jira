import { FC, useEffect, useMemo, useState } from "react";
import get from "lodash/get";
import { IssueForm } from "../components/IssueForm/IssueForm";
import {
  buildCustomFieldMeta,
  formatCustomFieldValueForSet,
  getIssueByKey,
  updateIssue,
} from "../context/StoreProvider/api";
import {
  useDeskproAppClient,
  LoadingSpinner,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import {
  IssueFormData,
  InvalidRequestResponseError,
  AttachmentFile,
} from "../context/StoreProvider/types/types";
import {
  useAdfToPlainText,
  useFindLinkedIssueAttachmentsByKey,
  useLoadLinkedIssueAttachment,
  useLoadLinkedIssues,
  useSetAppTitle,
} from "../hooks";
import { useStore } from "../context/StoreProvider/hooks";
import { FormikHelpers } from "formik";
import { IssueMeta } from "../types";

interface EditProps {
  issueKey: string;
}

export const Edit: FC<EditProps> = ({ issueKey }: EditProps) => {
  const { client } = useDeskproAppClient();
  const [state, dispatch] = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [issue, setIssue] = useState<any>(null);
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined
  );
  const { context } = useDeskproLatestAppContext();

  useEffect(() => {
    if (!context) return;
    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) return;
    setHasMappedFields(!!data.detailView?.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const adfToPlainText = useAdfToPlainText();

  const loadIssues = useLoadLinkedIssues(hasMappedFields);
  const loadIssueAttachments = useLoadLinkedIssueAttachment();
  const findAttachmentsByKey = useFindLinkedIssueAttachmentsByKey();

  useSetAppTitle(`Edit ${issueKey}`);

  useEffect(() => {
    client?.registerElement("home", { type: "home_button" });
    client?.deregisterElement("homeContextMenu");
    client?.deregisterElement("edit");
    client?.deregisterElement("viewContextMenu");
  }, [client, issueKey]);

  useEffect(() => {
    client && issueKey && getIssueByKey(client, issueKey).then(setIssue);
  }, [client, issueKey]);

  useEffect(() => {
    loadIssueAttachments(issueKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueKey]);

  const attachments = useMemo(
    () => findAttachmentsByKey(issueKey),
    [issueKey, findAttachmentsByKey]
  );

  if (!issue) {
    return <LoadingSpinner />;
  }

  const onSubmit = (
    data: IssueFormData,
    _helpers: FormikHelpers<any>,
    meta: Record<string, IssueMeta>
  ) => {
    if (!client || !state.context?.data.ticket || !issueKey) {
      return;
    }

    setLoading(true);
    setApiErrors({});

    updateIssue(client, issueKey, data, meta)
      .then(async () => {
        const issue = await getIssueByKey(client, issueKey);

        return client
          .getEntityAssociation(
            "linkedJiraIssues",
            state.context?.data.ticket.id as string
          )
          .set(issueKey, issue);
      })
      .then(() => loadIssues())
      .then(() => {
        setLoading(false);
        dispatch({ type: "changePage", page: "view", params: { issueKey } });
      })
      .catch((error) => {
        if (
          error instanceof InvalidRequestResponseError &&
          (error.response?.errors || error.response?.errorMessages)
        ) {
          setApiErrors(error.response.errors ?? error.response?.errorMessages);
        } else {
          dispatch({ type: "error", error });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const editMeta: Record<string, IssueMeta> = buildCustomFieldMeta(
    issue.editmeta.fields ?? {}
  );

  const issueFields = issue.fields;

  const values = {
    ...Object.keys(issueFields).reduce((a, fieldKey) => {
      if (
        !issueFields[fieldKey] ||
        !Object.keys(issue.editmeta.fields).includes(fieldKey)
      )
        return a;

      if (
        !["string", "any", "array"].includes(
          issue.editmeta.fields[fieldKey]?.schema?.type as string
        )
      ) {
        a[fieldKey] = issueFields[fieldKey].id;
        return a;
      }
      if (issue.editmeta.fields[fieldKey]?.schema?.type === "array") {
        if (issue.editmeta.fields[fieldKey]?.schema?.items === "option") {
          a[fieldKey] = issueFields[fieldKey].map(
            (field: { value: string }) =>
              issue.editmeta.fields[fieldKey].allowedValues.find(
                (e: { value: string }) => e.value === field.value
              ).id
          );

          return a;
        }
        a[fieldKey] = issueFields[fieldKey].map((e: { id: string }) => e.id);
        return a;
      } else {
        a[fieldKey] = issueFields[fieldKey];
      }
      return a;
    }, {} as any),
    attachments: attachments.map(
      (a) =>
        ({
          id: a.id,
          name: a.filename,
          size: a.sizeBytes,
        } as AttachmentFile)
    ),
    summary: get(issue, ["fields", "summary"], ""),
    description: adfToPlainText(get(issue, ["fields", "description"])),
    issuetype: get(issue, ["fields", "issuetype", "id"], ""),
    project: get(issue, ["fields", "project", "id"], ""),
    reporter: get(issue, ["fields", "reporter", "accountId"], ""),
    assignee: get(issue, ["fields", "assignee", "accountId"], ""),
    labels: get(issue, ["fields", "labels"], []) || [],
    priority: get(issue, ["fields", "priority", "id"], ""),
    customFields: Object.keys(editMeta).reduce((fields, key) => {
      const value = formatCustomFieldValueForSet(
        editMeta[key],
        issue.fields[key] ?? null
      );

      if (value === undefined) {
        return fields;
      }

      return {
        ...fields,
        [key]: value,
      };
    }, {}),
    parentKey: get(issue, ["fields", "parent", "key"], ""),
  };

  return (
    <IssueForm
      type="update"
      onSubmit={onSubmit}
      loading={loading}
      apiErrors={apiErrors}
      values={values}
      editMeta={editMeta}
      issueKey={issueKey}
    />
  );
};
