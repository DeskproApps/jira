import {FC, Fragment} from "react";
import {H1, H4, HorizontalDivider, Spinner, Stack, useDeskproAppTheme} from "@deskpro/app-sdk";
import { useFindIssueComments } from "../../hooks";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useStore} from "../../context/StoreProvider/hooks";
import {JiraComment} from "../../context/StoreProvider/types";
import "./CommentsList.css";
import {ExternalLink} from "../ExternalLink/ExternalLink";
import ReactTimeAgo from "react-time-ago";

interface CommentsListProps {
    domain: string;
    issueKey: string;
}

export const CommentsList: FC<CommentsListProps> = ({ issueKey, domain }: CommentsListProps) => {
    const [, dispatch] = useStore();
    const { theme } = useDeskproAppTheme();
    const comments = useFindIssueComments(issueKey);

    if (!comments) {
        return (<Spinner size="small" />);
    }

    return (
        <>
            <Stack>
                <H1>Comments ({comments.length})</H1>
                <FontAwesomeIcon
                    icon={faPlus}
                    color={theme.colors.grey80}
                    size="xs"
                    onClick={() => dispatch({ type: "changePage", page: "comment",  params: { issueKey } })}
                    className="comment-list-add-comment"
                />
            </Stack>
            <Stack className="comment-list" gap={14} vertical>
                {comments.map((comment: JiraComment, idx: number) => (
                    <Fragment key={idx}>
                        <Stack gap={5} className="comment-list-item-info" style={{ width: "100%", marginBottom: "-6px" }}>
                            <Stack justify="space-between" align="center" style={{ width: "100%" }}>
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
                                    <H4><ReactTimeAgo date={comment.created} timeStyle="twitter" /></H4>
                                    <ExternalLink href={`https://${domain}.atlassian.net/browse/${issueKey}?focusedCommentId=${comment.id}`} style={{marginBottom: "5px"}} />
                                </Stack>
                            </Stack>
                        </Stack>
                        <div
                            className="comment-list-item-body"
                            style={{ color: theme.colors.grey100 }}
                            dangerouslySetInnerHTML={{ __html: comment.renderedBody }}
                        />
                        <HorizontalDivider style={{ width: "100%" }} />
                    </Fragment>
                ))}
            </Stack>
        </>
    );
};

