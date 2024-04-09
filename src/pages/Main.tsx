import {
  HorizontalDivider,
  LoadingSpinner,
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { AnyIcon, IconButton, Input, Stack } from "@deskpro/deskpro-ui";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFields } from "../api/api";
import { FieldMapping } from "../components/FieldMapping/FieldMapping";
import { useLoadLinkedIssues } from "../hooks/hooks";
import IssueJson from "../mapping/issue.json";

export const Home: FC = () => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined,
  );
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext();

  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadLinkedIssues = useLoadLinkedIssues();

  const metadataFieldsQuery = useQueryWithClient(["metadataFields"], (client) =>
    getFields(client),
  );

  const linkedIssuesQuery = useQueryWithClient(
    ["linkedIssues"],
    async () => loadLinkedIssues(),
    {
      enabled: !!client && !!context,
    },
  );

  const linkedIssuesResults = linkedIssuesQuery.data;

  useEffect(() => {
    if (!context) return;

    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) {
      setMappedFields([]);
      setHasMappedFields(false);
    }
    setMappedFields(data.listView ?? []);
    setHasMappedFields(!!data.listView?.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || hasMappedFields === undefined) return [];

    return metadataFieldsQuery.data.filter((field) =>
      (hasMappedFields ? mappedFields : IssueJson.main).includes(field.key),
    );
  }, [metadataFieldsQuery.data, hasMappedFields, mappedFields]);

  useInitialisedDeskproAppClient((client) => {
    client?.registerElement("addIssue", { type: "plus_button" });
    client?.registerElement("homeContextMenu", {
      type: "menu",
      items: [
        { title: "View Permissions", payload: { action: "viewPermissions" } },
      ],
    });

    client.setTitle("JIRA Issues");

    client?.deregisterElement("home");
    client?.deregisterElement("edit");
    client?.deregisterElement("viewContextMenu");
  });

  useDeskproAppEvents({
    onElementEvent(id) {
      switch (id) {
        case "addIssue":
          navigate("/findOrCreate");
          break;
        case "viewPermissions":
          navigate("/permissions");
          break;
      }
    },
  });

  const linkedIssues = useMemo(() => {
    if (!searchQuery) {
      return linkedIssuesResults || [];
    }
    if (linkedIssuesQuery.isSuccess && linkedIssuesResults?.length === 0)
      navigate("/create");
    return (linkedIssuesResults || []).filter((item) =>
      item.key
        .replace("-", "")
        .toLowerCase()
        .includes(searchQuery.replace("-", "").toLowerCase()),
    );
  }, [searchQuery, linkedIssuesQuery.isSuccess, linkedIssuesResults, navigate]);

  const loading = linkedIssuesQuery.isLoading;

  if (loading || hasMappedFields === undefined || !context)
    return <LoadingSpinner />;

  if (linkedIssues.length === 0) return <p>No issues found</p>;

  return (
    <>
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
              icon={faTimes}
              onClick={() => setSearchQuery("")}
              minimal
            />
          }
        />
      </Stack>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      <Stack vertical gap={10}>
        <FieldMapping
          items={linkedIssues}
          metadata={usableFields}
          internalChildUrl={IssueJson.internalChildUrl}
          externalChildUrl={IssueJson.externalChildUrl}
          childTitleAccessor={(e) => e[IssueJson.titleKeyName]}
        />
      </Stack>
    </>
  );
};
