import { FC, useEffect, useMemo } from "react";
import {
  useAdfToPlainText, useFindLinkedIssueAttachmentsByKey,
  useFindLinkedIssueByKey,
  useLoadLinkedIssueAttachment,
  useSetAppTitle
} from "../hooks";
import {
  H1,
  Pill,
  Property, Spinner,
  Stack,
  useDeskproAppClient,
  useDeskproAppTheme
} from "@deskpro/app-sdk";
import { ExternalLink } from "../components/ExternalLink/ExternalLink";
import { useStore } from "../context/StoreProvider/hooks";
import { faFileAlt } from "@fortawesome/free-regular-svg-icons";

export interface ViewProps {
  issueKey: string;
}

export const View: FC<ViewProps> = ({ issueKey }: ViewProps) => {
  const [state, dispatch] = useStore();
  const { theme } = useDeskproAppTheme();
  const { client } = useDeskproAppClient();

  const loadIssueAttachments = useLoadLinkedIssueAttachment();
  const findAttachmentsByKey = useFindLinkedIssueAttachmentsByKey();
  const findByKey = useFindLinkedIssueByKey();
  const adfToPlainText = useAdfToPlainText();

  useSetAppTitle(issueKey);

  useEffect(() => {
    client?.registerElement("home", { type: "home_button" });
    client?.registerElement("viewContextMenu", { type: "menu", items: [
      { title: "Unlink Ticket", payload: { action: "unlink", issueKey }, },
    ] });
  }, [client, issueKey]);

  const issue = useMemo(
    () => findByKey(issueKey),
    [issueKey, findByKey]
  );

  useEffect(() => {
    if (!client || !issueKey) {
      return;
    }

    if (findAttachmentsByKey(issueKey).length) {
      return;
    }

    loadIssueAttachments(issueKey);
  }, [client, issueKey, loadIssueAttachments, findAttachmentsByKey]);

  const attachments = useMemo(
    () => state.linkedIssueAttachments ? findAttachmentsByKey(issueKey) : [],
    [issueKey, findAttachmentsByKey, state.linkedIssueAttachments]
  );

  if (!issue) {
    dispatch({ type: "error", error: "Issue not found" });
    return (<></>);
  }

  const domain = state.context?.settings.domain as string;

  return (
    <>
      <Stack align="start" gap={10}>
        <Stack gap={10} vertical>
          <div style={{ display: "flex", alignItems: "start", marginBottom: "-6px" }}>
            <H1 style={{ marginRight: "1px" }}>{issue.summary}</H1>
            <ExternalLink href={`https://${domain}.atlassian.net/browse/${issue.key}`} style={{ position: "relative", top: "-4px" }} />
          </div>
          <Property title="Issue Key">
            {issue.key}
            <ExternalLink href={`https://${domain}.atlassian.net/browse/${issue.projectKey}`} />
          </Property>
          {issue.description && (
            <Property title="Description">
              {adfToPlainText(issue.description)}
            </Property>
          )}
          <Property title="Project">
            {issue.projectName}
            <ExternalLink href={`https://${domain}.atlassian.net/browse/${issue.projectKey}`} />
          </Property>
          {issue.epicKey && (
            <Property title="Epic">
              {issue.epicName}
              <ExternalLink href={`https://${domain}.atlassian.net/browse/${issue.epicKey}`} />
            </Property>
          )}
          {issue.sprints && (
            <Property title="Sprints">
              {issue.sprints.map((sprint, idx) => (
                <div key={idx}>
                  {sprint.sprintName} ({sprint.sprintState})
                  <ExternalLink href={`https://${domain}.atlassian.net/jira/software/c/projects/${issue?.projectKey}/boards/${sprint.sprintBoardId}`} />
                </div>
              ))}
            </Property>
          )}
          <Property title="Status">
            {issue.status}
          </Property>
          <Property title="Reporter">
            <div style={{ position: "relative" }}>
              <img src={issue.reporterAvatarUrl} width={18} height={18} alt="" className="user-avatar" />
              <span className="user-name">{issue.reporterName}</span>
              <ExternalLink href={`https://${domain}.atlassian.net/jira/people/${issue.reporterId}`} />
            </div>
          </Property>
          {(issue.labels && issue.labels.length > 0) && (
            <Property title="Labels">
              <Stack gap={3}>
                {issue.labels.map((label, idx) => (
                  <Pill label={label} textColor={theme.colors.grey100} backgroundColor={theme.colors.grey10} key={idx} />
                ))}
              </Stack>
            </Property>
          )}
          {state.linkedIssueAttachments?.loading && (
            <Spinner size="small" />
          )}
          {(!state.linkedIssueAttachments?.loading && attachments.length > 0) && (
            <Property title="Attachments">
              {attachments.map((attachment, idx) => (
                <div key={idx} style={{ marginBottom: "3px" }}>
                  <Pill
                    textColor={theme.colors.grey100}
                    backgroundColor={theme.colors.grey10}
                    label={(
                      <span style={{ display: "inline-flex" }}>
                        <a href={attachment.url} target="_blank" className="truncate" style={{ color: theme.colors.cyan100, textDecoration: "none", width: "160px" }}>
                          {attachment.filename}
                        </a>
                        <span style={{ marginLeft: "4px" }}>{attachment.sizeMb.toFixed(2)}MB</span>
                      </span>
                    )}
                    icon={faFileAlt}
                  />
                </div>
              ))}
            </Property>
          )}
        </Stack>
      </Stack>
    </>
  );
};
