import { reducer as reduxFormReducer } from 'redux-form'
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {JiraService} from "./Jira/JiraService";


/**
 * @param dpapp
 * @return {Store<any> & {dispatch: any}}
 */
export default function configureStore(dpapp)
{
  const reducer = combineReducers({
    form:   reduxFormReducer, // mounted under "form"
    app:    require('./App').reducer,
    browse: require('./BrowseIssues').reducer,
    link:   require('./LinkIssues').reducer
  });

  const initialState = {
    browse: {
      foundIssues: []
    },
    link:{
      ticket: {
        url: dpapp.context.hostUI.tabUrl,
        id:  dpapp.context.get('ticket').id,
        title: null
      },
      linkedIssues: []
    }
  };

  let jiraService;
  const context = dpapp.context.get('ticket');

  return context.get('data.original_subject')
    .then(title => {
      initialState.link.ticket = { ...initialState.link.ticket, title };
      return dpapp.storage.getAppStorage('jiraInstanceUrl')
    })
    .then(jiraInstanceUrl => {

      jiraService = new JiraService({
        httpClient: dpapp.restApi.fetchProxy.bind(dpapp.restApi),
        instanceUrl: jiraInstanceUrl
      });

      return context.customFields.getAppField('jiraCards', [])
    })
    .then(jiraCards => jiraService.readAllIssues(jiraCards))
    .then(linkedIssues => {
      initialState.link.linkedIssues = linkedIssues
    })
    .then(() => createStore(reducer, initialState, applyMiddleware(
      thunk.withExtraArgument(jiraService)
    )))
  ;
}
