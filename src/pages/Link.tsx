import { FC, useEffect, useState } from "react";
import { useStore } from "../context/StoreProvider/hooks";
import {
  H3,
  Stack,
  Button,
  Checkbox,
} from "@deskpro/deskpro-ui";
import {
  Search,
  HorizontalDivider,
  useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useDebouncedCallback } from "use-debounce";
import { useLoadLinkedIssues, useSetAppTitle } from "../hooks";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import { addRemoteLink, getIssueByKey, searchIssues } from "../context/StoreProvider/api";
import { CreateLinkIssue } from "../components/CreateLinkIssue/CreateLinkIssue";
import { ticketReplyEmailsSelectionStateKey, ticketReplyNotesSelectionStateKey } from "../utils";

export const Link: FC = () => {
  const [state, dispatch] = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLinkIssuesLoading, setIsLinkIssuesLoading] = useState<boolean>(false);
  const { client } = useDeskproAppClient();
  const loadLinkedIssues = useLoadLinkedIssues();

  useSetAppTitle("Add Issues");

  useEffect(() => {
    client?.deregisterElement("addIssue");
    client?.deregisterElement("edit");
    client?.deregisterElement("homeContextMenu");
    client?.registerElement("home", { type: "home_button" });
  }, [client]);

  const debounced = useDebouncedCallback<(v: string) => void>((q) => {
    if (!q || !client) {
      dispatch({ type: "linkIssueSearchList", list: [] });
      return;
    }

    searchIssues(client, q, { withSubtask: true })
      .then((list) => dispatch({ type: "linkIssueSearchList", list }))
    ;
  }, 500);

  const search = (q: string) => {
    if (!q) {
      dispatch({ type: "linkIssueSearchListReset" });
    } else {
      dispatch({ type: "linkIssueSearchListLoading" });
      debounced(q);
    }
  };

  const toggleSelection = (key: string) => {
    if (selected.includes(key)) {
      setSelected(selected.filter((s) => s !== key));
    } else {
      setSelected([...selected, key]);
    }
  };

  const linkIssues = () => {
    if (!selected.length || !client || !state.context?.data.ticket.id) {
      return;
    }

    const ticketId = state.context?.data.ticket.id as string;

    const commentOnNote = state.context.settings?.default_comment_on_ticket_note === true;
    const commentOnReply = state.context.settings?.default_comment_on_ticket_reply === true;

    setIsLinkIssuesLoading(true);

    const updates = selected.map(async (key: string) => {
      const issue = await getIssueByKey(client, key);

      return client
          .getEntityAssociation("linkedJiraIssues", ticketId)
          .set(key, issue)
          .then(async () => commentOnNote && client?.setState(ticketReplyNotesSelectionStateKey(ticketId, issue.id), {
            id: issue.id,
            selected: true,
          }))
          .then(async () => commentOnReply && client?.setState(ticketReplyEmailsSelectionStateKey(ticketId, issue.id), {
            id: issue.id,
            selected: true,
          }))
      ;
    });

    updates.push(...selected.map((key: string) => addRemoteLink(
        client,
        key,
        state.context?.data.ticket.id as string,
        state.context?.data.ticket.subject as string,
        state.context?.data.ticket.permalinkUrl as string
    )));

    Promise.all(updates)
      .then(() => loadLinkedIssues())
      .then(() => dispatch({ type: "changePage", page: "home" }))
      .catch((error) => dispatch({ type: "error", error }))
      .finally(() => setIsLinkIssuesLoading(false))
    ;
  };

  return (
    <>
      <CreateLinkIssue selected="link" />
      <Search
        isFetching={state.linkIssueSearchResults?.loading}
        onChange={search}
      />
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      <Stack justify="space-between">
        <Button
          text="Link Issues"
          disabled={selected.length === 0}
          onClick={() => linkIssues()}
          loading={isLinkIssuesLoading}
        />
        <Button
          text="Cancel"
          intent="secondary"
          onClick={() => dispatch({ type: "changePage", page: "home" })}
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      {state.linkIssueSearchResults && state.linkIssueSearchResults.list.map((item, idx) => (
        <SearchResultItem
          key={idx}
          item={item}
          jiraDomain={state.context?.settings.domain as string}
          onSelect={() => toggleSelection(item.key)}
          checkbox={(
            <Checkbox
              onChange={() => toggleSelection(item.key)}
              checked={selected.includes(item.key)}
            />
          )}
        />
      ))}
      {(state.linkIssueSearchResults && !state.linkIssueSearchResults.list.length && !state.linkIssueSearchResults.loading) && (
        <H3>No matching issues found, please try again</H3>
      )}
    </>
  );
};
