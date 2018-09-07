import {createStore} from "redux";
import {createAppFromProps} from "@deskpro/apps-sdk/lib/index";
import { createMemoryHistory as createHistory } from "history";

import {JiraService} from "../../src/Jira";
import {createMiddleware, createReducer} from "../../src/store";

import {createNavigator} from "../../src/infrastructure";

const defaultState = {
  browse: {
    foundIssues: []
  },
  link: {
    ticket: {
      url: 'http://127.0.0.1',
      id: '1',
      title: 'title of the ticket'
    },
    linkedIssues: []
  }
};

/**
 * @param newState
 * @return {*}
 */
export function createInitialState(newState)
{
  const initialState = JSON.parse(JSON.stringify(defaultState));

  if (newState && typeof newState === 'object') {
    return { ... initialState, ...newState }
  }
  return initialState;
}

export function createAppClient()
{
  return createAppFromProps({
    contextProps : {
      type:       'ticket',
      entityId:   '1',
      locationId: 'ticket-sidebar',
      tabId:      'tab-id',
      tabUrl:     'http://127.0.0.1'
    },
    instanceProps : {
      appId:          '1',
      instanceId:     '1',
      appTitle:       'Jira',
      appPackageName: 'app-boilerplate-react'
    }
  });
}

/**
 * @param {function} httpClient
 * @param {object} [initialState]
 * @return {*}
 */
export function createMockStore(httpClient, initialState)
{
  const reducer = createReducer();
  const jiraService = new JiraService({ httpClient, instanceUrl: 'http://127.0.0.1' });
  return createStore(reducer, createInitialState(initialState), createMiddleware(jiraService));
}

/**
 * @param httpClient
 * @param initialRoute
 * @param [initialState]
 * @return {{history: *, navigator: navigate, dpapp, store: *}}
 */
export default function dependencies({ httpClient, initialRoute, initialState }) {

  const history = createHistory({ initialEntries: [initialRoute], initialIndex: 0});
  const navigator = createNavigator(history);
  const dpapp = createAppClient();
  const store = createMockStore(httpClient, initialState);

  return {
    history, navigator, dpapp, store
  }

}
