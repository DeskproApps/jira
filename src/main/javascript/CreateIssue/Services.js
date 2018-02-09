const ACTION_UPDATE_ISSUE = 'update-issues';
const ACTION_CREATE_ISSUE = 'create-issues';
const ACTION_LOAD_CREATE_META = 'load-create-meta';

import { CreateMetadataFinder } from '../Jira'

export function reducer(state, action)
{
  const { type } = action;
  if (type === ACTION_UPDATE_ISSUE) {
    const { issue } = action;

    const linkedIssue = state.linkedIssues.filter(x => x.key === issue.key);
    if (! linkedIssue.length) {
      return state;
    }

    const linkedIssues = state.linkedIssues.reduce((acc, linkedIssue) => {
        acc.push(linkedIssue.key === issue.key ? issue : linkedIssue);
        return acc;
    }, []);

    return { ...state, linkedIssues };
  }

  return state;
}

export function createCreateJiraIssueAction(fields)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.createIssue(fields)
      .then(({ key }) => jiraService.readIssue(key))
      .then(issue => {
        dispatch({
          type: ACTION_CREATE_ISSUE,
          issue: issue,
        });
        return issue;
      });
  };

  return action;
}

export function createUpdateJiraIssueAction(issue, fields)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.updateIssue(issue, fields)
      .then(({ key }) => jiraService.readIssue(key))
      .then(issue => {
        dispatch({
          type: ACTION_UPDATE_ISSUE,
          issue: issue,
        })
      });
  };

  return action;
}

export function createLoadCreateMetaAction()
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {

    const meta = window.sessionStorage.getItem('createMeta');
    if (meta) {
      return Promise.resolve(
        new CreateMetadataFinder(JSON.parse(meta))
      );
    }

    return jiraService.loadCreateMeta().then(meta => {
      window.sessionStorage.setItem('createMeta', JSON.stringify(meta));
      return new CreateMetadataFinder(meta);
    });

  };

  return action;
}

/**
 * @param issue
 * @return {function({dispatch: Function, jiraService: JiraService})}
 */
export function createLoadEditMetaAction(issue)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {

    return jiraService.loadEditMeta(issue).then(meta => {
      return meta;
    });
  };

  return action;
}
