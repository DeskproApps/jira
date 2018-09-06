/**
 * @param {string} comment
 * @param {Array} linkedIssues
 * @return {(function:{dispatch: *, jiraService: JiraService})}
 */
export function addComment(comment, linkedIssues)
{
  /**
   * @param dispatch
   * @param {function} getState
   * @param {JiraService} jiraService
   * @return {Promise}
   */
  function action (dispatch, getState, jiraService)
  {
    if (linkedIssues.length === 0) {
      return Promise.reject(new Error('there are no linked issues'));
    }

    const promises = linkedIssues.map(issue => jiraService.createComment(issue, comment).then(
      result => ({ status:'success', result }),
      err => ({ status:'success', result: err })
    ));

    return Promise.all(promises).then(results => results.filter(x => x.status === 'success').map(x => x.result));
  }

  return action;
}

