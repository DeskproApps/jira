import {
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import {
  AnyIcon,
  Button,
  Checkbox,
  H1,
  Input,
  Stack,
} from "@deskpro/deskpro-ui";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/debounce";
import { useLinkIssues } from "../../hooks/hooks";
import IssueJson from "../../mapping/issue.json";
import { FieldMapping } from "../FieldMapping/FieldMapping";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { getFields, searchIssues } from "../../api/api";

export const LinkContact = () => {
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [linkedIssues, setLinkedIssues] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(
    undefined,
  );
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext();
  const { linkIssues, getLinkedIssues } = useLinkIssues();
  const navigate = useNavigate();

  const { debouncedValue: debouncedText } = useDebounce(prompt, 300);

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Link Contact");

    client.registerElement("homeButton", {
      type: "home_button",
    });

    client.deregisterElement("addIssue");

    client.deregisterElement("menuButton");
  }, []);

  useEffect(() => {
    getLinkedIssues().then((data) => setLinkedIssues(data || []));
  }, [getLinkedIssues]);

  useEffect(() => {
    if (!context) return;
    const data = JSON.parse(context?.settings.mapping ?? "{}");

    if (!data) return;
    setMappedFields(data.listView ?? []);
    setHasMappedFields(!!data.listView?.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  useDeskproAppEvents({
    async onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");
      }
    },
  });

  const issuesQuery = useQueryWithClient(
    ["getContactsByEmail", debouncedText],
    (client) => searchIssues(client, debouncedText),
    {
      enabled: debouncedText.length > 2,
    },
  );

  const metadataFieldsQuery = useQueryWithClient(
    ["metadataFields"],
    (client) => getFields(client),
    {
      enabled: mappedFields && mappedFields?.length !== 0,
    },
  );

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || hasMappedFields === undefined) return [];

    return metadataFieldsQuery.data.filter((field) =>
      (hasMappedFields ? mappedFields : IssueJson.main).includes(field.key),
    );
  }, [metadataFieldsQuery.data, hasMappedFields, mappedFields]);

  const issues = issuesQuery.data;

  return (
    <Stack gap={10} style={{ width: "100%" }} vertical>
      <Stack vertical gap={6} style={{ width: "100%" }}>
        <Input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          placeholder="Enter Email Address"
          type="text"
          leftIcon={faMagnifyingGlass as AnyIcon}
        />
        <Stack vertical style={{ width: "100%" }} gap={5}>
          <Stack
            style={{ width: "100%", justifyContent: "space-between" }}
            gap={5}
          >
            <Button
              onClick={() => selectedIssues && linkIssues(selectedIssues)}
              disabled={selectedIssues.length === 0}
              text="Link Contact"
            ></Button>
            <Button
              disabled={selectedIssues.length === 0}
              text="Cancel"
              intent="secondary"
              onClick={() => setSelectedIssues([])}
            ></Button>
          </Stack>
          <HorizontalDivider full />
        </Stack>
        {issuesQuery.isFetching ? (
          <LoadingSpinnerCenter />
        ) : issuesQuery.isSuccess && issues?.length !== 0 ? (
          <Stack vertical gap={5} style={{ width: "100%" }}>
            {issues
              ?.filter((e) => !linkedIssues.includes(e.key))
              ?.map((issue, i) => {
                return (
                  <Stack key={i} gap={6} style={{ width: "100%" }}>
                    <Stack style={{ marginTop: "2px" }}>
                      <Checkbox
                        checked={selectedIssues?.includes(issue.key)}
                        onChange={() => {
                          if (!selectedIssues?.includes(issue.key)) {
                            setSelectedIssues([...selectedIssues, issue.key]);
                          } else {
                            setSelectedIssues(
                              selectedIssues?.filter((e) => e !== issue.key),
                            );
                          }
                        }}
                      ></Checkbox>
                    </Stack>
                    <Stack style={{ width: "92%" }}>
                      <FieldMapping
                        items={[issue]}
                        hasCheckbox={true}
                        metadata={usableFields}
                        externalChildUrl={IssueJson.externalChildUrl}
                        childTitleAccessor={(e) => e[IssueJson.titleKeyName]}
                      />
                    </Stack>
                  </Stack>
                );
              })}
          </Stack>
        ) : (
          issuesQuery.isSuccess && <H1>No Contacts Found.</H1>
        )}
      </Stack>
    </Stack>
  );
};