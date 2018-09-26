import { reducer as reduxFormReducer } from 'redux-form'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {JiraService} from "./Jira/JiraService";

/**
 * @return {Reducer<any> | Reducer<any, AnyAction>}
 */
export function createReducer()
{
  return combineReducers({
    form:   reduxFormReducer, // mounted under "form"
    browse: require('./BrowseIssues').reducer,
    link:   require('./LinkIssues').reducer
  });
}

/**
 * @param {JiraService} jiraService
 * @return {StoreEnhancer | StoreEnhancer<{dispatch: any}>}
 */
export function createMiddleware(jiraService)
{
  return applyMiddleware(
    thunk.withExtraArgument(jiraService)
  );
}

/**
 * @param {JiraService} jiraService
 * @param dpapp
 * @return {Promise<Object>}
 */
function loadInitialState(jiraService, dpapp) {

  const context = dpapp.context.get('ticket');

  return Promise.all([
    context.get('data.original_subject'),
    context.customFields.getAppField('jiraCards', [])
  ])
    .then(results => {
      const [ title, jiraCards ] = results;
      return jiraService.readAllIssues(jiraCards).then(linkedIssues => ([ title, linkedIssues ]))
    })
    .then(results => {
      const [title, linkedIssues] = results;
      return {
        browse: {
          foundIssues: []
        },
        link: {
          ticket: {
            url: dpapp.context.hostUI.tabUrl,
            id: dpapp.context.get('ticket').id,
            title
          },
          linkedIssues
        }
      };
    })
  ;
}

/**
 * @param dpapp
 * @return {Store<any> & {dispatch: any}}
 */
export default function configureStore(dpapp)
{
  /**
   * @param jiraInstanceUrl
   * @return {JiraService}
   */
  function createJiraService(jiraInstanceUrl) {
    return new JiraService({ httpClient: dpapp.restApi.fetchProxy.bind(dpapp.restApi), instanceUrl: jiraInstanceUrl });
  }

  /**
   * @param {JiraService} jiraService
   * @return {*}
   */
  function loadConfiguration(jiraService) {
    return Promise.all([
      Promise.resolve(jiraService),
      loadInitialState(jiraService, dpapp)
    ]);
  }

  return dpapp.storage.getAppStorage('jiraInstanceUrl')
    .then(createJiraService)
    .then(loadConfiguration)
    .then(results => {
      const [jiraService, initialState] = results;
      return createStore(createReducer(), initialState, createMiddleware(jiraService))
    })
  ;
}
