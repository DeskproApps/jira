import { FC, ChangeEvent, useRef, useEffect, useState } from "react";
import { useStore } from "../context/StoreProvider/hooks";
import { faSearch, faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import {
  Stack,
  Input,
  IconButton,
  HorizontalDivider,
  H3,
  Checkbox,
  Button, useDeskproAppClient
} from "@deskpro/app-sdk";
import { useDebouncedCallback } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLoadLinkedIssues, useSetAppTitle } from "../hooks";
import { SearchResultItem } from "../components/SearchResultItem/SearchResultItem";
import { addLinkCommentToIssue, getIssueByKey, searchIssues } from "../context/StoreProvider/api";
import { CreateLinkIssue } from "../components/CreateLinkIssue/CreateLinkIssue";
import {ticketReplyEmailsSelectionStateKey, ticketReplyNotesSelectionStateKey} from "../utils";

export const Link: FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useStore();
  const [searchQuery, setSearchQuery] = useState<string>("");
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

    searchIssues(client, q)
      .then((list) => dispatch({ type: "linkIssueSearchList", list }))
    ;
  },500);

  useEffect(
    () => searchInputRef && searchInputRef.current?.focus(),
    [searchInputRef]
  );

  const search = (q: string) => {
    setSearchQuery(q);
    dispatch({ type: "linkIssueSearchListLoading" });
    debounced(q);
  };

  const clear = () => {
    setSearchQuery("");
    dispatch({ type: "linkIssueSearchListReset" });
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

    setIsLinkIssuesLoading(true);

    const updates = selected.map(async (key: string) => {
      const issue = await getIssueByKey(client, key);

      return client
          .getEntityAssociation("linkedJiraIssues", ticketId)
          .set(key, issue)
          .then(() => client?.setState(ticketReplyNotesSelectionStateKey(ticketId, issue.id), {
            id: issue.id,
            selected: true,
          }))
          .then(() => client?.setState(ticketReplyEmailsSelectionStateKey(ticketId, issue.id), {
            id: issue.id,
            selected: true,
          }))
      ;
    });

    updates.push(...selected.map((key: string) => addLinkCommentToIssue(
        client,
        key,
        state.context?.data.ticket.id as string,
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
      <Stack>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) => search(e.target.value)}
          leftIcon={state.linkIssueSearchResults?.loading ? <FontAwesomeIcon icon={faSpinner} spin /> : faSearch}
          rightIcon={<IconButton icon={faTimes} onClick={clear} minimal />}
        />
      </Stack>
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
