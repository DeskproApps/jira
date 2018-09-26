import { CreateMetadataFinder } from '../Jira'

export function createJiraIssue(fields)
{
  /**
   * @param {function} dispatch
   * @param getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService) {
    return jiraService.createIssue(fields).then(({ key }) => jiraService.readIssue(key));
  }

  return action;
}

export function updateJiraIssue(issue, fields)
{
  /**
   * @param {function} dispatch
   * @param getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action(dispatch, getState, jiraService) {
    return jiraService.updateIssue(issue, fields).then(({ key }) => jiraService.readIssue(key));
  }

  return action;
}

export function loadJiraCreateMeta()
{
  /**
   * @param {function} dispatch
   * @param getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService ) {

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
  }

  return action;
}

/**
 * @param issue
 * @return {function(Function, Function, {dpapp: Object, jiraService: JiraService}): Promise<any>}
 */
export function loadJiraEditMeta(issue)
{
  /**
   * @param {function} dispatch
   * @param {function} getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService)
  {
    return jiraService.loadEditMeta(issue).then(meta => {
      return meta;
    });
  }

  return action;
}
