import { __, match } from "ts-pattern";
import { State, Action, StoreReducer, TicketContext } from "./types";

export const initialState: State = {
  _error: undefined,
};

export const reducer: StoreReducer = (state: State, action: Action): State => {
  return match<[State, Action]>([state, action])
    .with([__, { type: "changePage" }],  ([prevState, action]) => ({
      ...prevState,
      page: action.page,
      pageParams: action.params,
    }))
    .with([__, { type: "loadContext" }],  ([prevState, action]) => ({
      ...prevState,
      context: action.context as TicketContext,
    }))
    .with([__, { type: "linkIssueSearchListLoading" }],  ([prevState]) => ({
      ...prevState,
      linkIssueSearchResults: {
        list: [],
        loading: true,
      },
    }))
    .with([__, { type: "linkIssueSearchList" }],  ([prevState, action]) => ({
      ...prevState,
      linkIssueSearchResults: {
        list: action.list,
        loading: false,
      },
    }))
    .with([__, { type: "linkIssueSearchListReset" }],  ([prevState]) => ({
      ...prevState,
      linkIssueSearchResults: {
        list: [],
        loading: false,
      },
    }))
    .with([__, { type: "linkedIssuesListLoading" }],  ([prevState]) => ({
      ...prevState,
      linkedIssuesResults: {
        list: [],
        loading: true,
      },
    }))
    .with([__, { type: "linkedIssuesList" }],  ([prevState, action]) => ({
      ...prevState,
      isUnlinkingIssue: false,
      linkedIssuesResults: {
        list: action.list,
        loading: false,
      },
    }))
    .with([__, { type: "issueAttachmentsLoading" }],  ([prevState]) => ({
      ...prevState,
      linkedIssueAttachments: {
        loading: true,
        list: {},
      },
    }))
    .with([__, { type: "issueAttachments" }],  ([prevState, action]) => ({
      ...prevState,
      linkedIssueAttachments: {
        loading: false,
        list: {
          ...prevState.linkedIssueAttachments,
          [action.key]: action.attachments,
        }
      },
    }))
    .with([__, { type: "error" }],  ([prevState, action]) => ({
      ...prevState,
      _error: action.error,
    }))
    .with([__, { type: "loadDataDependencies" }],  ([prevState, action]) => ({
      ...prevState,
      dataDependencies: action.deps,
    }))
    .with([__, { type: "failedToGenerateIssueForm" }],  ([prevState]) => ({
      ...prevState,
      hasGeneratedIssueFormSuccessfully: false,
    }))
    .with([__, { type: "unlinkIssue" }],  ([prevState, action]) => ({
      ...prevState,
      isUnlinkingIssue: true,
      linkedIssuesResults: {
        list: (prevState.linkedIssuesResults?.list ?? []).filter((r) => r.key !== action.key),
        loading: false,
      },
    }))
    .with([__, { type: "issueComments" }],  ([prevState, action]) => ({
      ...prevState,
      issueComments: {
        ...(prevState.issueComments ?? {}),
        [action.key]: action.comments,
      },
    }))
    .exhaustive()
  ;
};
