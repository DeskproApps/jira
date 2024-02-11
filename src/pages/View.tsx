import { FC, useEffect, useMemo } from "react";
import {
  parseJiraDescription,
  useFindLinkedIssueAttachmentsByKey,
  useFindLinkedIssueByKey,
  useLoadLinkedIssueAttachment,
  useSetAppTitle,
} from "../hooks";
import { P5, Pill, Stack, Spinner, AnyIcon, AttachmentTag  } from "@deskpro/deskpro-ui";
import {
  Title,
  Member,
  Property,
  LinkIcon,
  HorizontalDivider,
  useDeskproAppTheme,
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { faFile } from "@fortawesome/free-regular-svg-icons";
import { IssueFieldView } from "../components/IssueFieldView/IssueFieldView";
import { CommentsList } from "../components/CommentsList/CommentsList";
import { JiraIcon, DPNormalize } from "../components/common";
import { nbsp } from "../constants";

export interface ViewProps {
  issueKey: string;
}

export const View: FC<ViewProps> = ({ issueKey }: ViewProps) => {
  const [state, dispatch] = useStore();
  const { theme } = useDeskproAppTheme();
  const { client } = useDeskproAppClient();
  const { context } = useDeskproLatestAppContext();

  const loadIssueAttachments = useLoadLinkedIssueAttachment();
  const findAttachmentsByKey = useFindLinkedIssueAttachmentsByKey();
  const findByKey = useFindLinkedIssueByKey();

  useSetAppTitle(issueKey);

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

  const issue = useMemo(() => findByKey(issueKey), [issueKey, findByKey]);

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

  if (!issue) {
    dispatch({ type: "error", error: "Issue not found" });
    return <></>;
  }

  const domain = context?.settings.domain as string;

  return (
    <>
      <Title
        title={issue.summary}
        icon={<JiraIcon/>}
        link={`https://${domain}.atlassian.net/browse/${issue.key}`}
      />
      <Property
        label="Issue Key"
        text={(
          <P5>
            {issue.key}{nbsp}
            <LinkIcon href={`https://${domain}.atlassian.net/browse/${issue.key}`}/>
          </P5>
        )}
      />
      {issue.parentKey && (
        <Property
          label="Parent"
          text={(
            <P5>
              {issue.parentKey}
              <LinkIcon href={`https://${domain}.atlassian.net/browse/${issue.parentKey}`}/>
            </P5>
          )}
        />
      )}
      {issue.description && (
        <Property
          label="Description"
          text={(
            <DPNormalize>
              <Stack gap={2} wrap="wrap" style={{ wordBreak: "break-all" }}>
              {parseJiraDescription(issue.description)}
              </Stack>
            </DPNormalize>
          )}
        />
      )}
      <Property
        label="Project"
        text={(
          <P5>
            {issue.projectName}{nbsp}
            <LinkIcon href={`https://${domain}.atlassian.net/browse/${issue.projectKey}`}/>
          </P5>
        )}
      />
      {issue.epicKey && (
        <Property
          label="Epic"
          text={(
            <P5>
              {issue.epicName}{nbsp}
              <LinkIcon href={`https://${domain}.atlassian.net/browse/${issue.epicKey}`}/>
            </P5>
          )}
        />
      )}
      {(issue.sprints ?? []).length > 0 && (
        <Property
          label="Sprints"
          text={(issue.sprints ?? []).map((sprint, idx) => (
            <div key={idx}>
              {sprint.sprintName} ({sprint.sprintState})
              <LinkIcon
                href={`https://${domain}.atlassian.net/jira/software/c/projects/${issue?.projectKey}/boards/${sprint.sprintBoardId}`}
              />
            </div>
          ))}
        />
      )}
      <Property label="Status" text={issue.status}/>
      <Property
        label="Assignee"
        text={issue.assigneeId ? (
          <Stack gap={6} align="center">
            <Member
              name={issue.assigneeName}
              avatarUrl={issue.assigneeAvatarUrl}
            />
            {issue.assigneeId && (
              <LinkIcon href={`https://${domain}.atlassian.net/jira/people/${issue.assigneeId}`}/>
            )}
          </Stack>
        ) : (
          <P5 style={{ color: theme.colors.grey80 }}>None</P5>
        )}
      />
      <Property
        label="Reporter"
        text={(
          <Stack gap={6} align="center">
            <Member
              name={issue.reporterName}
              avatarUrl={issue.reporterAvatarUrl}
            />
            {issue.reporterId && (
              <LinkIcon href={`https://${domain}.atlassian.net/jira/people/${issue.reporterId}`}/>
            )}
          </Stack>
        )}
      />
      {issue.labels && issue.labels.length > 0 && (
        <Property
          label="Labels"
          text={(
            <Stack gap={3} wrap="wrap">
              {issue.labels.map((label, idx) => (
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
              <img src={issue.priorityIconUrl} alt={issue.priority} height={16}/>
              <P5>{issue.priority}</P5>
            </Stack>
          )}
        />
      )}
      {state.linkedIssueAttachments?.loading && <Spinner size="small" />}
      {!state.linkedIssueAttachments?.loading && attachments.length > 0 && (
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
      {Object.keys(issue.customFields).map((key: string, idx: number) => (
        <IssueFieldView
          meta={issue.customFields[key].meta}
          value={issue.customFields[key].value}
          key={idx}
        />
      ))}
      <Stack vertical gap={10} style={{ width: "100%" }}>
        <HorizontalDivider style={{ width: "100%" }} />
        <CommentsList
          issueKey={issueKey}
          domain={context?.settings.domain}
        />
      </Stack>
    </>
  );
};
