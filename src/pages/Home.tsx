import { FC, useEffect, useMemo, useState } from "react";
import { useStore } from "../context/StoreProvider/hooks";
import {
  H3,
} from "@deskpro/deskpro-ui";
import {
  Search,
  LoadingSpinner,
  HorizontalDivider,
  useDeskproAppClient,
  useDeskproLatestAppContext,
} from "@deskpro/app-sdk";
import { useLoadLinkedIssues, useSetAppTitle } from "../hooks";
import { LinkedIssueResultItem } from "../components/LinkedIssueResultItem/LinkedIssueResultItem";
import {ErrorBlock} from "../components/Error/ErrorBlock";

export const Home: FC = () => {
  const { context } = useDeskproLatestAppContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state, dispatch] = useStore();
  const loadLinkedIssues = useLoadLinkedIssues();
  const { client } = useDeskproAppClient();

  useSetAppTitle("JIRA Issues");

  useEffect(() => {
    client?.registerElement("addIssue", { type: "plus_button" });
    client?.registerElement("homeContextMenu", { type: "menu", items: [
      { title: "View Permissions", payload: { action: "viewPermissions" }, },
    ] });

    client?.deregisterElement("home");
    client?.deregisterElement("edit");
    client?.deregisterElement("viewContextMenu");
  }, [client, state]);

  const linkedIssues = useMemo(() => {
    if (!searchQuery) {
      return state.linkedIssuesResults?.list || [];
    }

    return (state.linkedIssuesResults?.list || [])
      .filter((item) => item.key.replace('-', '').toLowerCase().includes(
        searchQuery.replace('-', '').toLowerCase()
      ));
  }, [state.linkedIssuesResults, searchQuery]);

  useEffect(() => {
    if (state.linkedIssuesResults === undefined) {
      loadLinkedIssues();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context?.data.ticket.id, state.linkedIssuesResults]);

  const loading = state.linkedIssuesResults?.loading || state.linkedIssuesResults?.loading === undefined;

  return (
    <>
      {state.hasGeneratedIssueFormSuccessfully === false && (
          <ErrorBlock text="You cannot create issue type via this app, please visit JIRA" />
      )}
      <Search onChange={setSearchQuery}/>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      {loading
          ? <LoadingSpinner />
          : (Array.isArray(linkedIssues) && linkedIssues.length > 0)
          ? linkedIssues.map((item, idx) => (
            <LinkedIssueResultItem
              key={idx}
              item={item}
              jiraDomain={context?.settings.domain as string}
              onView={() => dispatch({ type: "changePage", page: "view", params: { issueKey: item.key } })}
            />
          ))
          : <H3>No linked issues found.</H3>
      }
    </>
  );
};
