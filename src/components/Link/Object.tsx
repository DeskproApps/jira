import {
  useDeskproAppClient,
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
  IconButton,
  Input,
  Stack,
} from "@deskpro/deskpro-ui";
import { faMagnifyingGlass, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/debounce";
import { useLinkIssues } from "../../hooks/hooks";
import IssueJson from "../../mapping/issue.json";
import { FieldMapping } from "../FieldMapping/FieldMapping";
import { HorizontalDivider } from "../HorizontalDivider/HorizontalDivider";
import { LoadingSpinnerCenter } from "../LoadingSpinnerCenter/LoadingSpinnerCenter";
import { addRemoteLink, getFields, searchIssues } from "../../api/api";
import { getLayout } from "../../utils/utils";
import { TicketData, Settings } from "../../types";


export const LinkContact = () => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [linkedIssues, setLinkedIssues] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(undefined);
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext<TicketData, Settings>();
  const { linkIssues, getLinkedIssues } = useLinkIssues();
  const { client } = useDeskproAppClient()
  const navigate = useNavigate();

  const ticket = context?.data?.ticket

  const { debouncedValue: debouncedText } = useDebounce(prompt, 300);

  const onLinkIssues = useCallback(async() => {
    if (!ticket || !client) {
      return
    }

    if (selectedIssues) {

      await Promise.all(
        selectedIssues.map((selectedIssueId) => {
          addRemoteLink(
            client,
            selectedIssueId,
            ticket.id,
            ticket.subject,
            ticket.permalinkUrl,
          )
        })
      )

      await linkIssues(selectedIssues.map((e) => e.toString()))
    }
  }, [selectedIssues, linkIssues, ticket, client]);

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("Link Issue");
    client.registerElement("homeButton", { type: "home_button" });
    client.deregisterElement("addIssue");
    client.deregisterElement("menuButton");
  }, []);

  useEffect(() => {
    getLinkedIssues()
      .then((data) => setLinkedIssues(data || []));
  }, [getLinkedIssues]);

  useEffect(() => {
    const data = getLayout(context?.settings?.mapping);

    if (!data) return;

    setMappedFields(data.listView ?? []);
    setHasMappedFields(!!data.listView?.length);
  }, [context]);

  useDeskproAppEvents({
    onElementEvent(id) {
      switch (id) {
        case "homeButton":
          navigate("/redirect");
      }
    },
  });

  useEffect(
    () => searchInputRef && searchInputRef.current?.focus(),
    [searchInputRef],
  );

  const issuesQuery = useQueryWithClient(
    ["getContactsByEmail", debouncedText],
    (client) => searchIssues(client, debouncedText),
    { enabled: debouncedText.length > 2 },
  );

  const metadataFieldsQuery = useQueryWithClient(
    ["metadataFields"],
    (client) => getFields(client),
    { enabled: mappedFields && mappedFields?.length !== 0 },
  );

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || hasMappedFields === undefined) return [];

    return metadataFieldsQuery.data.filter((field) =>
      (hasMappedFields
        ? mappedFields
        : ["key", "project", "status", "reporter"]
      ).includes(field.key),
    );
  }, [metadataFieldsQuery.data, hasMappedFields, mappedFields]);

  const issues = issuesQuery.data;

  return (
    <Stack gap={10} style={{ width: "100%" }} vertical>
      <Stack vertical gap={6} style={{ width: "100%" }}>
        <Input
          ref={searchInputRef}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setPrompt(event.target.value)}
          value={prompt}
          placeholder="Enter Issue Title"
          type="text"
          leftIcon={faMagnifyingGlass as AnyIcon}
          rightIcon={
            <IconButton
              icon={faTimes as never}
              onClick={() => setPrompt("")}
              minimal
            />
          }
        />
        <Stack vertical style={{ width: "100%" }} gap={5}>
          <Stack
            style={{ width: "100%", justifyContent: "space-between" }}
            gap={5}
          >
            <Button
              onClick={onLinkIssues}
              disabled={selectedIssues.length === 0}
              text="Link Issue"
            />
            <Button
              disabled={selectedIssues.length === 0}
              text="Cancel"
              intent="secondary"
              onClick={() => setSelectedIssues([])}
            />
          </Stack>
          <HorizontalDivider />
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
                        checked={selectedIssues?.includes(issue.id)}
                        onChange={() => {
                          if (!selectedIssues?.includes(issue.id)) {
                            setSelectedIssues([...selectedIssues, issue.id]);
                          } else {
                            setSelectedIssues(
                              selectedIssues?.filter((e) => e !== issue.id),
                            );
                          }
                        }}
                      />
                    </Stack>
                    <Stack style={{ width: "92%" }}>
                      <FieldMapping
                        items={[issue]}
                        hasCheckbox={true}
                        metadata={usableFields}
                        externalChildUrl={IssueJson.externalChildUrl}
                        childTitleAccessor={(e) => e[IssueJson.titleKeyName] as string}
                        shouldFetchIssueFields
                      />
                    </Stack>
                  </Stack>
                );
              })}
          </Stack>
        ) : (
          issuesQuery.isSuccess && <H1>No Issues Found.</H1>
        )}
      </Stack>
    </Stack>
  );
};
