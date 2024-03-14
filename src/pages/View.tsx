import { FC, useEffect, useMemo, useState } from "react";
import {
  parseJiraDescription,
  useFindLinkedIssueAttachmentsByKey,
  useLoadLinkedIssueAttachment,
  useSetAppTitle,
} from "../hooks";
import {
  P5,
  H1,
  Pill,
  Stack,
  Spinner,
  AnyIcon,
  AttachmentTag,
} from "@deskpro/deskpro-ui";
import {
  Property,
  HorizontalDivider,
  useDeskproAppClient,
  useDeskproAppTheme,
  useQueryWithClient,
  useDeskproLatestAppContext,
  LoadingSpinner,
} from "@deskpro/app-sdk";
import { ExternalLink } from "../components/ExternalLink/ExternalLink";
import { useStore } from "../context/StoreProvider/hooks";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import { IssueFieldView } from "../components/IssueFieldView/IssueFieldView";
import { CommentsList } from "../components/CommentsList/CommentsList";
import { getFields, listLinkedIssues } from "../context/StoreProvider/api";
import { FieldMapping } from "../components/FieldMapping/FieldMapping";

export interface ViewProps {
  issueKey: string;
}

export const View: FC<ViewProps> = ({ issueKey }: ViewProps) => {
  const [state, dispatch] = useStore();
  const { theme } = useDeskproAppTheme();
  const { client } = useDeskproAppClient();
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined
  );

  const { context } = useDeskproLatestAppContext();

  const loadIssueAttachments = useLoadLinkedIssueAttachment();
  const findAttachmentsByKey = useFindLinkedIssueAttachmentsByKey();

  useSetAppTitle(issueKey);

  const metadataFieldsQuery = useQueryWithClient(
    ["metadataFields"],
    (client) => getFields(client),
    {
      enabled: mappedFields && mappedFields?.length !== 0,
    }
  );

  useEffect(() => {
    if (!context) return;
    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) return;
    setMappedFields(data.detailView ?? []);
    setHasMappedFields(!!data.detailView?.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  useEffect(() => {
    client?.registerElement("home", { type: "home_button" });
    client?.registerElement("edit", { type: "edit_button", payload: issueKey });
    client?.deregisterElement("homeContextMenu");
    client?.registerElement("viewContextMenu", {
      type: "menu",
      items: [
        { title: "Unlink Ticket", payload: { action: "unlink", issueKey } },
      ],
    });
  }, [client, issueKey]);

  const issueQuery = useQueryWithClient(
    ["issue", issueKey],
    (client) =>
      listLinkedIssues(client, [issueKey], hasMappedFields as boolean),
    {
      enabled: Boolean(issueKey) && hasMappedFields !== undefined,
    }
  );

  const issue = useMemo(() => {
    const fields = issueQuery.data?.[0];

    return {
      ...fields,
      ...Object.keys(fields?.customFields ?? {}).reduce((a, c) => {
        a[c] = fields?.customFields[c]?.value;
        return a;
      }, {} as any),
    };
  }, [issueQuery.data]);

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || !mappedFields.length) return [];

    return metadataFieldsQuery.data.filter((field) =>
      mappedFields.includes(field.key)
    );
  }, [metadataFieldsQuery, mappedFields]);

  useEffect(() => {
    loadIssueAttachments(issueKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueKey]);

  const attachments = useMemo(
    () => (state.linkedIssueAttachments ? findAttachmentsByKey(issueKey) : []),
    [issueKey, findAttachmentsByKey, state.linkedIssueAttachments]
  );

  if (state.isUnlinkingIssue) {
    return <></>;
  }

  if (issueQuery.isLoading || hasMappedFields === undefined) {
    return <LoadingSpinner />;
  }

  if (!issue) {
    dispatch({ type: "error", error: "Issue not found" });
    return <></>;
  }

  const domain = state.context?.settings.domain as string;

  return (
    <>
      <Stack align="start" gap={10} vertical>
        {!hasMappedFields && (
          <Stack gap={16} style={{ width: "100%" }} vertical>
            <div
              style={{
                display: "flex",
                alignItems: "start",
                marginBottom: "-6px",
              }}
            >
              <H1 style={{ marginRight: "1px" }}>{issue.summary}</H1>
              <ExternalLink
                href={`https://${domain}.atlassian.net/browse/${issue.key}`}
                style={{ position: "relative", top: "-4px" }}
              />
            </div>
            <Property
                label="Issue Key"
                text={(
                    <P5>
                      {issue.key}
                      <ExternalLink href={`https://${domain}.atlassian.net/browse/${issue.key}`}/>
                    </P5>
                )}
            />
            {issue.parentKey && (
                <Property
                    label="Parent"
                    text={(
                        <P5>
                          {issue.parentKey}
                          <ExternalLink href={`https://${domain}.atlassian.net/browse/${issue.parentKey}`}/>
                        </P5>
                    )}
                />
            )}
            {issue.description && (
              <Property
                label="Description"
                text={(
                    <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
                      {parseJiraDescription(issue.description)}
                    </Stack>
                )}
              />
            )}
            <Property
                label="Project"
                text={(
                    <P5>
                      {issue.projectName}
                      <ExternalLink
                          href={`https://${domain}.atlassian.net/browse/${issue.projectKey}`}
                      />
                    </P5>
                )}
            />
            {issue.epicKey && (
              <Property
                  label="Epic"
                  text={(
                      <P5>
                        {issue.epicName}
                        <ExternalLink
                            href={`https://${domain}.atlassian.net/browse/${issue.epicKey}`}
                        />
                      </P5>
                  )}
              />
            )}
            {(issue.sprints ?? []).length > 0 && (
              <Property
                  label="Sprints"
                  text={(
                      <>
                        {(issue.sprints ?? []).map((sprint: any, idx: number) => (
                            <P5 key={idx}>
                              {sprint.sprintName} ({sprint.sprintState})
                              <ExternalLink
                                  href={`https://${domain}.atlassian.net/jira/software/c/projects/${issue?.projectKey}/boards/${sprint.sprintBoardId}`}
                              />
                            </P5>
                        ))}
                      </>
                  )}
              />
            )}
            <Property label="Status" text={issue.status}/>
            <Property
                label="Assignee"
                text={(
                    <>
                      {issue.assigneeId ? (
                          <P5 style={{ position: "relative" }}>
                            {issue.assigneeAvatarUrl && (
                                <img
                                    src={issue.assigneeAvatarUrl}
                                    width={18}
                                    height={18}
                                    alt=""
                                    className="user-avatar"
                                />
                            )}
                            <span className="user-name">{issue.assigneeName}</span>
                            {issue.assigneeId && (
                                <ExternalLink
                                    href={`https://${domain}.atlassian.net/jira/people/${issue.assigneeId}`}
                                />
                            )}
                          </P5>
                      ) : (
                          <P5 style={{ color: theme.colors.grey80 }}>None</P5>
                      )}
                    </>
                )}
            />
            <Property
                label="Reporter"
                text={(
                    <P5 style={{position: "relative"}}>
                      {issue.reporterAvatarUrl && (
                          <img
                              src={issue.reporterAvatarUrl}
                              width={18}
                              height={18}
                              alt=""
                              className="user-avatar"
                          />
                      )}
                      <span className="user-name">{issue.reporterName}</span>
                      {issue.reporterId && (
                          <ExternalLink
                              href={`https://${domain}.atlassian.net/jira/people/${issue.reporterId}`}
                          />
                      )}
                    </P5>
                )}
            />
            {issue.labels && issue.labels.length > 0 && (
                <Property
                    label="Labels"
                    text={(
                        <Stack gap={3}>
                          {issue.labels.map((label: any, idx: number) => (
                              <Pill
                                  label={label}
                                  textColor={theme.colors.grey100}
                                  backgroundColor={theme.colors.grey10}
                                  key={idx}
                              />
                          ))}
                        </Stack>
                    )}
                />
            )}
            {issue.priority && (
                <Property
                    label="Priority"
                    text={(
                        <Stack gap={3}>
                          <img
                              src={issue.priorityIconUrl}
                              alt={issue.priority}
                              height={16}
                          />
                          {issue.priority}
                        </Stack>
                    )}
                />
            )}
            {state.linkedIssueAttachments?.loading && <Spinner size="small" />}
            {!state.linkedIssueAttachments?.loading &&
              attachments.length > 0 && (
                <Property
                    label="Attachments"
                    text={(
                        <Stack gap={3} vertical>
                          {attachments.map((attachment, idx) => (
                              <AttachmentTag
                                  key={idx}
                                  target="_blank"
                                  download
                                  href={attachment.url}
                                  filename={attachment.filename}
                                  fileSize={attachment.sizeBytes}
                                  icon={faFile as AnyIcon}
                                  maxWidth="244px"
                              />
                          ))}
                        </Stack>
                    )}
                />
              )}
            {Object.keys(issue.customFields ?? {}).map(
              (key: string, idx: number) => (
                <IssueFieldView
                  //@ts-ignore
                  meta={issue.customFields?.[key].meta}
                  value={issue.customFields?.[key].value}
                  key={idx}
                />
              )
            )}
            <Stack vertical gap={10} style={{ width: "100%" }}>
              <HorizontalDivider style={{ width: "100%" }} />
              <CommentsList
                issueKey={issueKey}
                domain={state.context?.settings.domain}
              />
            </Stack>
          </Stack>
        )}
        {hasMappedFields && (
          <Stack vertical gap={10}>
            <div
              style={{
                display: "flex",
                alignItems: "start",
                marginBottom: "-6px",
                flexDirection: "row",
              }}
            >
              <H1 style={{ marginRight: "1px" }}>{issue.summary}</H1>
              <ExternalLink
                href={`https://${domain}.atlassian.net/browse/${issue.key}`}
                style={{ position: "relative", top: "-4px" }}
              />
            </div>
            <FieldMapping issue={issue} usableFields={usableFields} />
          </Stack>
        )}
      </Stack>
    </>
  );
};
