const ACTION_SEARCH_ISSUES = 'search-issues';

export function reducer(state, action)
{
  if (! state) {
    return {
      foundIssues: []
    };
  }

  const { type } = action;
  if (type === ACTION_SEARCH_ISSUES) {
    const { foundIssues } = action;
    return { ...state, foundIssues: foundIssues || [] };
  }

  return state;
}

export function searchIssues(query)
{
  /**
   * @param {function} dispatch
   * @param {function} getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService) {

    if (typeof query !== 'string') {
      return Promise.resolve([]);
    }

    if (typeof query === 'string' && query.length === 0) {
      dispatch({
        type: ACTION_SEARCH_ISSUES,
        foundIssues: []
      });

      return Promise.resolve([]);
    }

    if (typeof query === 'string' && query.length < 3) {
      return;
    }

    return jiraService.searchIssue(query).then(foundIssues => {
      dispatch({
        type: ACTION_SEARCH_ISSUES,
        foundIssues
      });
      return foundIssues;
    }).catch(e => {
      console.error('error ', e);
    });
  }

  return action;
}

export const getFoundIssues = ({ browse }) => browse.foundIssues;
