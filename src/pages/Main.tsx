import { FC, useEffect, useCallback } from "react";
import { __, match } from "ts-pattern";
import {
  Context,
  TargetAction, useDeskproAppClient,
  useDeskproAppEvents, useInitialisedDeskproAppClient
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { Home } from "./Home";
import { Link } from "./Link";
import { View } from "./View";
import { Page } from "../context/StoreProvider/types";
import { ErrorBlock } from "../components/Error/ErrorBlock";
import { useDebouncedCallback } from "use-debounce";
import { Create } from "./Create";
import { addIssueComment, removeRemoteLink } from "../context/StoreProvider/api";
import { Edit } from "./Edit";
import { Comment } from "./Comment";
import {
  registerReplyBoxEmailsAdditionsTargetAction,
  registerReplyBoxNotesAdditionsTargetAction, ticketReplyEmailsSelectionStateKey,
  ticketReplyNotesSelectionStateKey
} from "../utils";
import { ReplyBoxNoteSelection } from "../types";
import { useLoadLinkedIssues, useWhenNoLinkedItems } from "../hooks";
import { ViewPermissions } from "./ViewPermissions";
import { VerifySettings } from "./VerifySettings";

export const Main: FC = () => {
  const { client } = useDeskproAppClient();
  const loadLinkedIssues = useLoadLinkedIssues();
  const [state, dispatch] = useStore();

  if (state._error) {
    // eslint-disable-next-line no-console
    console.error(state._error);
  }

  useWhenNoLinkedItems(
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useCallback(() => dispatch({ type: "changePage", page: "link" }), [])
  );

  useEffect(() => {
    client?.registerElement("refresh", { type: "refresh_button" });
  }, [client]);

  const debounceTargetAction = useDebouncedCallback<(a: TargetAction<ReplyBoxNoteSelection[]>) => void>(
    (action: TargetAction) => {
      match<string>(action.name)
          .with("linkTicket", () => dispatch({ type: "changePage", page: "link" }))
          .with("jiraReplyBoxNoteAdditions", () => (action.payload ?? []).forEach((selection: { id: string; selected: boolean; }) => {
            const ticketId = action.subject;

            if (state.context?.data.ticket.id) {
              client?.setState(
                  ticketReplyNotesSelectionStateKey(ticketId, selection.id),
                  { id: selection.id, selected: selection.selected }
              ).then((result) => {
                if (result.isSuccess) {
                  registerReplyBoxNotesAdditionsTargetAction(client, state);
                }
              });
            }
          }))
          .with("jiraReplyBoxEmailAdditions", () => (action.payload ?? []).forEach((selection: { id: string; selected: boolean; }) => {
            const ticketId = action.subject;

            if (state.context?.data.ticket.id) {
              client?.setState(
                  ticketReplyEmailsSelectionStateKey(ticketId, selection.id),
                  { id: selection.id, selected: selection.selected }
              ).then((result) => {
                if (result.isSuccess) {
                  registerReplyBoxEmailsAdditionsTargetAction(client, state);
                }
              });
            }
          }))
          .with("jiraOnReplyBoxNote", () => {
            const ticketId = action.subject;
            const note = action.payload.note;

            if (!ticketId || !note || !client) {
              return;
            }

            if (ticketId !== state.context?.data.ticket.id) {
              return;
            }

            client.setBlocking(true);
            client.getState<{ id: string; selected: boolean }>(`tickets/${ticketId}/notes/*`)
                .then((r) => {
                  const issueIds = r
                      .filter(({ data }) => data?.selected)
                      .map((({ data }) => data?.id as string))
                  ;

                  return Promise.all(issueIds.map((issueId) => addIssueComment(client, issueId, note)));
                })
                .then(() => loadLinkedIssues())
                .finally(() => client.setBlocking(false))
            ;
          })
          .with("jiraOnReplyBoxEmail", () => {
            const ticketId = action.subject;
            const email = action.payload.email;

            if (!ticketId || !email || !client) {
              return;
            }

            if (ticketId !== state.context?.data.ticket.id) {
              return;
            }

            client.setBlocking(true);
            client.getState<{ id: string; selected: boolean }>(`tickets/${ticketId}/emails/*`)
                .then((r) => {
                  const issueIds = r
                      .filter(({ data }) => data?.selected)
                      .map((({ data }) => data?.id as string))
                  ;

                  return Promise.all(issueIds.map((issueId) => addIssueComment(client, issueId, email)));
                })
                .then(() => loadLinkedIssues())
                .finally(() => client.setBlocking(false))
            ;
          })
          .run()
      ;
    },
    500
  );

  const unlinkTicket = ({ issueKey }: any) => {
    if (!state?.context?.data.ticket) {
      return;
    }

    const contextData = state?.context?.data;

    dispatch({ type: "unlinkIssue", key: issueKey });

    client?.getEntityAssociation("linkedJiraIssues", contextData.ticket.id).delete(issueKey)
        .then(() => removeRemoteLink(client, issueKey, contextData.ticket.id))
        .then(() => dispatch({ type: "changePage", page: "home" }))
    ;
  };

  useInitialisedDeskproAppClient((client) => {
    registerReplyBoxNotesAdditionsTargetAction(client, state);
    registerReplyBoxEmailsAdditionsTargetAction(client, state);
    client.registerTargetAction("jiraOnReplyBoxNote", "on_reply_box_note");
    client.registerTargetAction("jiraOnReplyBoxEmail", "on_reply_box_email");
  }, [state.linkedIssuesResults?.list, state?.context?.data]);

  useDeskproAppEvents({
    onChange: (context: Context) => {
      context && dispatch({ type: "loadContext", context: context });
    },
    onShow: () => {
      client && setTimeout(() => client.resize(), 200);
    },
    onElementEvent: (id, type, payload) => {
      match<[string, any]>([id, payload])
        .with(["addIssue", __], () => dispatch({ type: "changePage", page: "link" }))
        .with(["home", __], () => dispatch({ type: "changePage", page: "home" }))
        .with(["edit", __], () => dispatch({ type: "changePage", page: "edit", params: { issueKey: payload } }))
        .with([__, { action: "unlink", issueKey: __ }], () => unlinkTicket(payload))
        .with([__, { action: "viewPermissions" }], () => dispatch({ type: "changePage", page: "view_permissions" }))
        .otherwise(() => {})
      ;
    },
    onTargetAction: (a) => debounceTargetAction(a as TargetAction),
  }, [client, state.context?.data]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const page = queryParams.get("page") as Page|null;

    page && dispatch({ type: "changePage", page })
  }, [dispatch]);

  const page = match<Page|undefined>(state.page)
      .with("verify_settings", () => <VerifySettings {...state.pageParams} />)
      .with("home", () => <Home {...state.pageParams} />)
      .with("link", () => <Link {...state.pageParams} />)
      .with("view", () => <View {...state.pageParams} />)
      .with("create", () => <Create {...state.pageParams} />)
      .with("edit", () => <Edit {...state.pageParams} />)
      .with("comment", () => <Comment {...state.pageParams} />)
      .with("view_permissions", () => <ViewPermissions {...state.pageParams} />)
      .otherwise(() => <Home {...state.pageParams} />)
  ;

  return (
    <>
      {state._error && (<ErrorBlock text="An error occurred" />)}
      {page}
    </>
  );
};
