import {
  HorizontalDivider,
  LoadingSpinner,
  TargetAction,
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproLatestAppContext,
  useInitialisedDeskproAppClient,
  useQueryWithClient,
} from "@deskpro/app-sdk";
import { match } from "ts-pattern";

import { AnyIcon, IconButton, Input, Stack } from "@deskpro/deskpro-ui";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ChangeEvent, FC, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { addIssueComment, getFields } from "../api/api";
import { FieldMapping } from "../components/FieldMapping/FieldMapping";
import { useLoadLinkedIssues } from "../hooks/hooks";
import IssueJson from "../mapping/issue.json";
import { ReplyBoxNoteSelection } from "../types";
import {
  registerReplyBoxEmailsAdditionsTargetAction,
  registerReplyBoxNotesAdditionsTargetAction,
  ticketReplyEmailsSelectionStateKey,
  ticketReplyNotesSelectionStateKey,
} from "../utils/utils";

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

  const debounceTargetAction = useDebouncedCallback<
    (a: TargetAction<ReplyBoxNoteSelection[]>) => void
  >((action: TargetAction) => {
    match<string>(action.name)
      .with("jiraReplyBoxNoteAdditions", () =>
        (action.payload ?? []).forEach(
          (selection: { id: string; selected: boolean }) => {
            const ticketId = action.subject;

            if (context?.data.ticket.id) {
              client
                ?.setState(
                  ticketReplyNotesSelectionStateKey(ticketId, selection.id),
                  { id: selection.id, selected: selection.selected },
                )
                .then((result) => {
                  if (result.isSuccess) {
                    registerReplyBoxNotesAdditionsTargetAction(
                      client,
                      context.data.ticket.id,
                      linkedIssues,
                    );
                  }
                });
            }
          },
        ),
      )
      .with("jiraReplyBoxEmailAdditions", () =>
        (action.payload ?? []).forEach(
          (selection: { id: string; selected: boolean }) => {
            const ticketId = action.subject;

            if (context?.data.ticket.id) {
              client
                ?.setState(
                  ticketReplyEmailsSelectionStateKey(ticketId, selection.id),
                  { id: selection.id, selected: selection.selected },
                )
                .then((result) => {
                  if (result.isSuccess) {
                    registerReplyBoxEmailsAdditionsTargetAction(
                      client,
                      context.data.ticket.id,
                      linkedIssues,
                    );
                  }
                });
            }
          },
        ),
      )
      .with("jiraOnReplyBoxNote", () => {
        const ticketId = action.subject;
        const note = action.payload.note;

        if (!ticketId || !note || !client) {
          return;
        }

        if (ticketId !== context?.data.ticket.id) {
          return;
        }

        client.setBlocking(true);
        client
          .getState<{ id: string; selected: boolean }>(
            `tickets/${ticketId}/notes/*`,
          )
          .then((r) => {
            const issueIds = r
              .filter(({ data }) => data?.selected)
              .map(({ data }) => data?.id as string);
            return Promise.all(
              issueIds.map((issueId) => {
                return addIssueComment(client, issueId, note);
              }),
            );
          })
          .then(() => loadLinkedIssues())
          .finally(() => client.setBlocking(false));
      })
      .with("jiraOnReplyBoxEmail", () => {
        const ticketId = action.subject;
        const email = action.payload.email;

        if (!ticketId || !email || !client) {
          return;
        }

        if (ticketId !== context?.data.ticket.id) {
          return;
        }

        client.setBlocking(true);
        client
          .getState<{ id: string; selected: boolean }>(
            `tickets/${ticketId}/emails/*`,
          )
          .then((r) => {
            const issueIds = r
              .filter(({ data }) => data?.selected)
              .map(({ data }) => data?.id as string);
            return Promise.all(
              issueIds.map((issueId) => {
                addIssueComment(client, issueId, email);
              }),
            );
          })
          .then(() => loadLinkedIssues())
          .finally(() => client.setBlocking(false));
      })
      .run();
  }, 500);

  useInitialisedDeskproAppClient(
    (client) => {
      client?.registerElement("addIssue", { type: "plus_button" });

      client.setTitle("JIRA Issues");

      client?.deregisterElement("menuButton");
      client?.deregisterElement("editButton");
      client?.deregisterElement("viewContextMenu");
    },
    [context],
  );

  useDeskproAppEvents({
    onElementEvent(id) {
      switch (id) {
        case "addIssue":
          navigate("/findOrCreate");
          break;

        case "home":
          navigate("/redirect");
          break;
      }
    },
    onTargetAction: (a) => {
      return debounceTargetAction(a as TargetAction);
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

  useInitialisedDeskproAppClient(
    (client) => {
      if (!context || linkedIssues.length === 0) return;

      registerReplyBoxNotesAdditionsTargetAction(
        client,
        context?.data.ticket.id,
        linkedIssues,
      );
      registerReplyBoxEmailsAdditionsTargetAction(
        client,
        context?.data.ticket.id,
        linkedIssues,
      );
      client.registerTargetAction("jiraOnReplyBoxNote", "on_reply_box_note");
      client.registerTargetAction("jiraOnReplyBoxEmail", "on_reply_box_email");
    },
    [context, linkedIssues],
  );

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
