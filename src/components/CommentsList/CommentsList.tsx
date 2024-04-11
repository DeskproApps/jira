import { FC, Fragment } from "react";
import { AnyIcon, H1, H4, Spinner, Stack } from "@deskpro/deskpro-ui";
import {
  HorizontalDivider,
  Link,
  useDeskproAppTheme,
  useDeskproLatestAppContext,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./CommentsList.css";
import ReactTimeAgo from "react-time-ago";
import { getIssueComments } from "../../api/api";
import { JiraComment } from "../../api/types/types";
import { addBlankTargetToLinks } from "../../utils/utils";
import { useNavigate } from "react-router-dom";

interface CommentsListProps {
  issueKey: string;
}

export const CommentsList: FC<CommentsListProps> = ({
  issueKey,
}: CommentsListProps) => {
  const { theme } = useDeskproAppTheme();
  const { context } = useDeskproLatestAppContext();
  const navigate = useNavigate();

  const commentsQuery = useQueryWithClient(
    [issueKey],
    (client) => getIssueComments(client, issueKey),
    {
      enabled: !!issueKey,
    },
  );

  if (!commentsQuery.isSuccess) {
    return <Spinner size="small" />;
  }

  const comments = commentsQuery.data;

  const domain = context?.settings.domain;

  return (
    <>
      <Stack>
        <H1>Comments ({comments.length})</H1>
        <FontAwesomeIcon
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          icon={faPlus as AnyIcon}
          color={theme.colors.grey80}
          size="xs"
          onClick={
            () => navigate(`/create/comment/${issueKey}`)
            //navigate create comment
          }
          className="comment-list-add-comment"
        />
      </Stack>
      <Stack className="comment-list" gap={14} vertical>
        {comments.map((comment: JiraComment, idx: number) => (
          <Fragment key={idx}>
            <Stack
              gap={5}
              className="comment-list-item-info"
              style={{ width: "100%", marginBottom: "-6px" }}
            >
              <Stack
                justify="space-between"
                align="center"
                style={{ width: "100%" }}
              >
                <Stack gap={3} align="center">
                  <img
                    src={comment.author.avatarUrl}
                    className="comment-list-item-avatar"
                    width="18"
                    alt={comment.author.displayName}
                  />
                  <H4>{comment.author.displayName}</H4>
                </Stack>
                <Stack gap={1} align="center">
                  <H4>
                    <ReactTimeAgo
                      date={comment.created}
                      timeStyle="twitter"
                      locale="us"
                    />
                  </H4>
                  <Link
                    href={`https://${domain}.atlassian.net/browse/${issueKey}?focusedCommentId=${comment.id}`}
                    style={{ marginBottom: "5px" }}
                  />
                </Stack>
              </Stack>
            </Stack>
            <div
              className="comment-list-item-body"
              style={{ color: theme.colors.grey100 }}
              dangerouslySetInnerHTML={{
                __html: addBlankTargetToLinks(comment.renderedBody),
              }}
            />
            <HorizontalDivider style={{ width: "100%" }} />
          </Fragment>
        ))}
      </Stack>
    </>
  );
};
