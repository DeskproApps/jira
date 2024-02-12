import { P, match } from "ts-pattern";
import { State, Action, StoreReducer, TicketContext } from "./types";

export const initialState: State = {
  _error: undefined,
};

export const reducer: StoreReducer = (state: State, action: Action): State => {
  return match<[State, Action]>([state, action])
    .with([P._, { type: "changePage" }],  ([prevState, action]) => ({
      ...prevState,
      page: action.page,
      pageParams: action.params,
    }))
    .with([P._, { type: "loadContext" }],  ([prevState, action]) => ({
      ...prevState,
      context: action.context as TicketContext,
    }))
    .with([P._, { type: "linkIssueSearchListLoading" }],  ([prevState]) => ({
      ...prevState,
      linkIssueSearchResults: {
        list: [],
        loading: true,
      },
    }))
    .with([P._, { type: "linkIssueSearchList" }],  ([prevState, action]) => ({
      ...prevState,
      linkIssueSearchResults: {
        list: action.list,
        loading: false,
      },
    }))
    .with([P._, { type: "linkIssueSearchListReset" }],  ([prevState]) => ({
      ...prevState,
      linkIssueSearchResults: {
        list: [],
        loading: false,
      },
    }))
    .with([P._, { type: "linkedIssuesListLoading" }],  ([prevState]) => ({
      ...prevState,
      linkedIssuesResults: {
        list: [],
        loading: true,
      },
    }))
    .with([P._, { type: "linkedIssuesList" }],  ([prevState, action]) => ({
      ...prevState,
      isUnlinkingIssue: false,
      linkedIssuesResults: {
        list: action.list,
        loading: false,
      },
    }))
    .with([P._, { type: "issueAttachmentsLoading" }],  ([prevState]) => ({
      ...prevState,
      linkedIssueAttachments: {
        loading: true,
        list: {},
      },
    }))
    .with([P._, { type: "issueAttachments" }],  ([prevState, action]) => ({
      ...prevState,
      linkedIssueAttachments: {
        loading: false,
        list: {
          ...prevState.linkedIssueAttachments,
          [action.key]: action.attachments,
        }
      },
    }))
    .with([P._, { type: "error" }],  ([prevState, action]) => ({
      ...prevState,
      _error: action.error,
    }))
    .with([P._, { type: "loadDataDependencies" }],  ([prevState, action]) => ({
      ...prevState,
      dataDependencies: action.deps,
    }))
    .with([P._, { type: "failedToGenerateIssueForm" }],  ([prevState]) => ({
      ...prevState,
      hasGeneratedIssueFormSuccessfully: false,
    }))
    .with([P._, { type: "unlinkIssue" }],  ([prevState, action]) => ({
      ...prevState,
      isUnlinkingIssue: true,
      linkedIssuesResults: {
        list: (prevState.linkedIssuesResults?.list ?? []).filter((r) => r.key !== action.key),
        loading: false,
      },
    }))
    .with([P._, { type: "issueComments" }],  ([prevState, action]) => ({
      ...prevState,
      issueComments: {
        ...(prevState.issueComments ?? {}),
        [action.key]: action.comments,
      },
    }))
    .exhaustive()
  ;
};
