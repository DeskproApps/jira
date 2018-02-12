const ACTION_COMMNENT_ADD = 'comment-add';

export function reducer(state, action)
{
  return state;
}

/**
 * @param {string} comment
 * @param {Array} linkedIssues
 * @return {(function:{dispatch: *, jiraService: JiraService})}
 */
export function createActionCommentCreate(comment, linkedIssues)
{
  /**
   * @param dispatch
   * @param {JiraService} jiraService
   * @return {Promise}
   */
  const action = ({ dispatch, jiraService }) => {

    if (linkedIssues.length === 0) {
      return Promise.reject(new Error('there are no linked issues'));
    }

    const promises = linkedIssues.map(issue => jiraService.createComment(issue, comment).then(
      result => ({ status:'success', result }),
      err => ({ status:'success', result: err })
    ));

    return Promise.all(promises).then(results => results.filter(x => x.status === 'success').map(x => x.result));
  };

  return action;
}

