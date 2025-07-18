import {
  HorizontalDivider,
  LoadingSpinner,
  TargetAction,
  useDeskproAppClient,
  useDeskproAppEvents,
  useDeskproElements,
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
import { FieldMapping } from "../components/FieldMapping/FieldMapping";
import { useLoadLinkedIssues, useLogOut } from '../hooks/hooks';
import IssueJson from "../mapping/issue.json";
import { Payload, ReplyBoxSelection, ReplyBoxOnReplyNote, ReplyBoxOnReplyEmail } from '../types';
import {
  registerReplyBoxEmailsAdditionsTargetAction,
  registerReplyBoxNotesAdditionsTargetAction,
  ticketReplyEmailsSelectionStateKey,
  ticketReplyNotesSelectionStateKey,
  getLayout,
} from "../utils/utils";
import { Container } from "../components/Layout";
import { IssueItem } from "../api/types/types";
import { ContextData, ContextSettings } from "@/types/deskpro";
import { addIssueComment } from "@/api/issues/comments";
import { getFields } from "@/api/fields";

export const Home: FC = () => {
  const navigate = useNavigate();
  const { client } = useDeskproAppClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [hasMappedFields, setHasMappedFields] = useState<boolean | undefined>(undefined);
  const [mappedFields, setMappedFields] = useState<string[]>([]);
  const { context } = useDeskproLatestAppContext<ContextData, ContextSettings>();
  const [linkedCount, setLinkedCount] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { logOut } = useLogOut();

  useDeskproAppEvents({
    // @ts-expect-error parameters
    onElementEvent(_: string, __: string, payload: Payload) {
      switch (payload.type) {
        case 'logOut':
          logOut();
      };
    }
  }, [logOut]);

  const loadLinkedIssues = useLoadLinkedIssues();

  const metadataFieldsQuery = useQueryWithClient(["metadataFields"], getFields);

  const linkedIssuesQuery = useQueryWithClient(
    ["linkedIssues"],
    async () => loadLinkedIssues(),
    {
      enabled: !!client && !!context,
      async onSuccess(data) {
        if (data.length === 0) {
          navigate("/findOrCreate");
        }
        const linkedItems: Record<string, number> = {};

        await Promise.all(
          data.map(
            async (item) => {
              linkedItems[item.id] = (
                await client?.getState(`jira/items/${item.id}`)
              )?.[0]?.data as number;
            },
            {} as Record<string, number>,
          ),
        );

        setLinkedCount(linkedItems);
      },
    },
  );

  const linkedIssuesResults = linkedIssuesQuery.data;

  useEffect(() => {
    const data = getLayout(context?.settings?.mapping);

    if (!data) {
      setMappedFields([]);
      setHasMappedFields(false);
    }

    setMappedFields(data.listView ?? []);
    setHasMappedFields(!!data.listView?.length);
  }, [context]);

  const usableFields = useMemo(() => {
    if (!metadataFieldsQuery.data || hasMappedFields === undefined) return [];

    return metadataFieldsQuery.data.filter((field) => {
      return (hasMappedFields ? mappedFields : IssueJson.main).includes(field.key);
    });
  }, [metadataFieldsQuery.data, hasMappedFields, mappedFields]);

  const debounceTargetAction = useDebouncedCallback<
    (a: TargetAction<ReplyBoxSelection[]>) => void
  >((action: TargetAction) => {
    match(action.name)
      .with("jiraReplyBoxNoteAdditions", () => {
        ((action as { payload: ReplyBoxSelection[] }).payload ?? []).forEach((selection: ReplyBoxSelection) => {
          const ticketId = action.subject;

          if (context?.data?.ticket.id) {
            client?.setState(
              ticketReplyNotesSelectionStateKey(ticketId, selection.id),
              { id: selection.id, selected: selection.selected },
            ).then((result) => {
              if (result.isSuccess && context?.data?.ticket.id) {
                registerReplyBoxNotesAdditionsTargetAction(
                  client,
                  context.data.ticket.id,
                  linkedIssues,
                );
              }
            });
          }
        });
      })
      .with("jiraReplyBoxEmailAdditions", () => {
        ((action as { payload: ReplyBoxSelection[] }).payload ?? []).forEach((selection: ReplyBoxSelection) => {
          const ticketId = action.subject;

          if (context?.data?.ticket.id) {
            client?.setState(
              ticketReplyEmailsSelectionStateKey(ticketId, selection.id),
              { id: selection.id, selected: selection.selected },
            )
              .then((result) => {
                if (result.isSuccess && context?.data?.ticket?.id) {
                  registerReplyBoxEmailsAdditionsTargetAction(
                    client,
                    context.data.ticket.id,
                    linkedIssues,
                  );
                }
              });
          }
        })
      })
      .with("jiraOnReplyBoxNote", () => {
        const ticketId = action.subject;
        const note = (action as { payload: ReplyBoxOnReplyNote }).payload.note;

        if (!ticketId || !note || !client) {
          return;
        }

        if (ticketId !== context?.data?.ticket.id) {
          return;
        }

        client.setBlocking(true);
        client.getState<{ id: string; selected: boolean }>(`tickets/${ticketId}/notes/*`)
          .then((r) => {
            const issueIds = r
              .filter(({ data }) => data?.selected)
              .map<string>(({ data }) => `${data?.id}`);

            return Promise.all(
              issueIds.map((issueId) => {
                return addIssueComment(client, { issueKey: issueId, comment: note });
              }),
            );
          })
          .then(() => loadLinkedIssues())
          .finally(() => {
            client.setBlocking(false)
          });
      })
      .with("jiraOnReplyBoxEmail", () => {
        const ticketId = action.subject;
        const email = (action as { payload: ReplyBoxOnReplyEmail }).payload.email;

        if (!ticketId || !email || !client) {
          return;
        }

        if (ticketId !== context?.data?.ticket.id) {
          return;
        }

        client.setBlocking(true);
        client
          .getState<{ id: string; selected: boolean }>(`tickets/${ticketId}/emails/*`)
          .then((r) => {
            const issueIds = r
              .filter(({ data }) => data?.selected)
              .map<string>(({ data }) => `${data?.id}`);
            return Promise.all(
              issueIds.map((issueId) => addIssueComment(client, { issueKey: issueId, comment: email })),
            );
          })
          .then(() => loadLinkedIssues())
          .finally(() => {
            client.setBlocking(false)
          });
      })
      .run();
  }, 500);

  useInitialisedDeskproAppClient((client) => {
    client.setTitle("JIRA Issues");
  }, [context]);

  useDeskproElements(({ deRegisterElement, registerElement }) => {
    registerElement('addIssue', { type: 'plus_button' });
    deRegisterElement('menuButton');
    deRegisterElement('editButton');
    deRegisterElement('viewContextMenu');
    deRegisterElement('homeButton');
  });

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
    onTargetAction: (a) => debounceTargetAction(a as TargetAction<ReplyBoxSelection[]>),
  });

  const linkedIssues = useMemo(() => {
    const linkedIssuiesWithDeskproLinkedCount = linkedIssuesResults?.map(
      (issue) => ({
        ...issue,
        linkedCount: linkedCount[issue.id],
      }),
    );

    if (!searchQuery) {
      return linkedIssuiesWithDeskproLinkedCount || [];
    }
    if (
      linkedIssuesQuery.isSuccess &&
      linkedIssuiesWithDeskproLinkedCount?.length === 0 &&
      !searchQuery
    ) {
      navigate("/create");
    }

    return (linkedIssuiesWithDeskproLinkedCount || []).filter(
      (item) =>
        item.summary
          .replace("-", "")
          .toLowerCase()
          .includes(searchQuery.replace("-", "").toLowerCase()) ||
        item.key
          .replace("-", "")
          .toLowerCase()
          .includes(searchQuery.replace("-", "").toLowerCase()),
    );
  }, [
    linkedIssuesResults,
    searchQuery,
    linkedIssuesQuery.isSuccess,
    navigate,
    linkedCount,
  ]);

  // register reply-box
  useInitialisedDeskproAppClient((client) => {
    const ticketId = context?.data?.ticket.id;
    if (!context || !ticketId || linkedIssues.length === 0) {
      return;
    }

    registerReplyBoxNotesAdditionsTargetAction(client, ticketId, linkedIssues);
    registerReplyBoxEmailsAdditionsTargetAction(client, ticketId, linkedIssues);

    client.registerTargetAction("jiraOnReplyBoxNote", "on_reply_box_note");
    client.registerTargetAction("jiraOnReplyBoxEmail", "on_reply_box_email");
  }, [context, linkedIssues]);

  const loading = linkedIssuesQuery.isLoading;

  if (loading || hasMappedFields === undefined || !context) {
    return (
      <LoadingSpinner />
    );
  }

  if (linkedIssues.length === 0 && !searchQuery) navigate("/findOrCreate");

  return (
    <>
      <Container>
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
      </Container>
      <HorizontalDivider style={{ marginTop: "8px", marginBottom: "8px" }} />
      <Container>
        <Stack vertical gap={10}>
          <FieldMapping
            shouldFetchIssueFields
            items={linkedIssues}
            metadata={usableFields}
            internalChildUrl={IssueJson.internalChildUrl}
            externalChildUrl={IssueJson.externalChildUrl}
            childTitleAccessor={(e: IssueItem) => e[IssueJson.titleKeyName] as string}
          />
        </Stack>
      </Container>
    </>
  );
};
