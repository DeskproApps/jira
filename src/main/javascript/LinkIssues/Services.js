const ACTION_LINK_ISSUE = 'link-issues';

const ACTION_UNLINK_ISSUE = 'unlink-issues';

export function reducer(state, action)
{
  const { type } = action;
  if (type === ACTION_LINK_ISSUE) {
    const { issue } = action;
    const { linkedIssues } = state;

    const add = state.linkedIssues.filter(x => x.key === issue.key).length === 0;
    if (add) {
      return { ...state, linkedIssues: linkedIssues.concat([issue]) };
    }
  }

  if (type === ACTION_UNLINK_ISSUE) {
    const { issue } = action;
    const linkedIssues = state.linkedIssues.filter(x => x.key !== issue.key);
    if (linkedIssues.length !== state.linkedIssues.length) {
      return { ...state, linkedIssues };
    }
  }

  return state;
}


export function createLinkJiraIssueAction(issue, ticket)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.createLink(issue, ticket).then(link => {
      dispatch({
        type: ACTION_LINK_ISSUE,
        issue: issue,
      })

    });
  };

  return action;
}

export function createUnlinkJiraIssueAction(issue, ticket)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @param {{context:{}}} dpapp
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.deleteLink(issue, ticket).then(link => {
      dispatch({
        type: ACTION_UNLINK_ISSUE,
        issue: issue,
      })
    });
  };

  return action;
}
