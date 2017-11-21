const ACTION_SEARCH_ISSUES = 'search-issues';

export function reducer(state, action)
{
  const { type } = action;
  if (type === ACTION_SEARCH_ISSUES) {
    const { foundIssues } = action;
    return { ...state, foundIssues: foundIssues || [] };
  }

  return state;
}

export function createSearchIssuesAction(query)
{
  /**
   * @param {function} dispatch
   * @param {JiraService} jiraService
   * @return {*}
   */
  const action = ({ dispatch, jiraService }) => {
    return jiraService.searchIssue(query).then(foundIssues => {
      console.log('got some issues ', foundIssues);
      dispatch({
        type: ACTION_SEARCH_ISSUES,
        foundIssues
      })
    }).catch(e => {
      console.log('error ', e);
    });
  };

  return action;
}
