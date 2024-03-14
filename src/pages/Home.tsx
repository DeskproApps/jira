import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../context/StoreProvider/hooks";
import { H3, IconButton, Input, Stack, AnyIcon } from "@deskpro/deskpro-ui";
import {
  LoadingSpinner,
  HorizontalDivider,
  useDeskproAppClient,
  useDeskproLatestAppContext,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { useLoadLinkedIssues, useSetAppTitle } from "../hooks";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { LinkedIssueResultItem } from "../components/LinkedIssueResultItem/LinkedIssueResultItem";
import { ErrorBlock } from "../components/Error/ErrorBlock";
import { getFields } from "../context/StoreProvider/api";

export const Home: FC = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [state, dispatch] = useStore();
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined
  );
  const loadLinkedIssues = useLoadLinkedIssues(hasMappedFields);
  const { client } = useDeskproAppClient();

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
    setMappedFields(data.listView ?? []);
    setHasMappedFields(!!data.listView?.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || !mappedFields.length) return [];

    return metadataFieldsQuery.data.filter((field) =>
      mappedFields.includes(field.key)
    );
  }, [metadataFieldsQuery, mappedFields]);

  useSetAppTitle("JIRA Issues");

  useEffect(() => {
    client?.registerElement("addIssue", { type: "plus_button" });
    client?.registerElement("homeContextMenu", {
      type: "menu",
      items: [
        { title: "View Permissions", payload: { action: "viewPermissions" } },
      ],
    });

    client?.deregisterElement("home");
    client?.deregisterElement("edit");
    client?.deregisterElement("viewContextMenu");
  }, [client, state]);

  const linkedIssues = useMemo(() => {
    if (!searchQuery) {
      return state.linkedIssuesResults?.list || [];
    }
    return (state.linkedIssuesResults?.list || []).filter((item) =>
      item.key
        .replace("-", "")
        .toLowerCase()
        .includes(searchQuery.replace("-", "").toLowerCase())
    );
  }, [state.linkedIssuesResults, searchQuery]);

  useEffect(() => {
    if (state.linkedIssuesResults === undefined) {
      loadLinkedIssues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.context?.data, state.linkedIssuesResults]);

  const loading =
    state.linkedIssuesResults?.loading ||
    state.linkedIssuesResults?.loading === undefined;

  if (loading || hasMappedFields === undefined) return <LoadingSpinner />;

  return (
    <>
      {state.hasGeneratedIssueFormSuccessfully === false && (
        <ErrorBlock text="You cannot create issue type via this app, please visit JIRA" />
      )}
      <Stack>
        <Input
          ref={searchInputRef}
          value={searchQuery}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          leftIcon={faSearch as AnyIcon}
          rightIcon={
            <IconButton
              icon={faTimes as never}
              onClick={() => setSearchQuery("")}
              minimal
            />
          }
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      <Stack vertical gap={10}>
        {Array.isArray(linkedIssues) && linkedIssues.length > 0 ? (
          linkedIssues.map((item, idx) => (
            <LinkedIssueResultItem
              hasMappedFields={hasMappedFields}
              usableFields={usableFields}
              key={idx}
              item={item}
              jiraDomain={state.context?.settings.domain as string}
              onView={() =>
                dispatch({
                  type: "changePage",
                  page: "view",
                  params: { issueKey: item.key },
                })
              }
            />
          ))
        ) : (
          <H3>No linked issues found.</H3>
        )}
      </Stack>
    </>
  );
};
