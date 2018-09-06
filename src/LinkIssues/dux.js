const ACTION_LINK_ISSUE = 'link-issues';
const ACTION_UNLINK_ISSUE = 'unlink-issues';

export function reducer(state, action)
{
  if (! state) {
    return {};
  }

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

export function linkJiraIssue(dpapp, issue, ticket)
{
  /**
   * @param {function} dispatch
   * @param getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState,  jiraService ) {
    return jiraService.createLink(issue, ticket).then(link => {
      dispatch({
        type: ACTION_LINK_ISSUE,
        issue: issue,
      });
      const context = dpapp.context.get('ticket');
      context.customFields.setAppField('jiraCards', getState().link.linkedIssues.map(x => x.key));
    });
  }

  return action;
}

export function unlinkJiraIssue(dpapp, issue, ticket)
{
  /**
   * @param {function} dispatch
   * @param getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService) {
    return jiraService.deleteLink(issue, ticket).then(link => {
      dispatch({
        type: ACTION_UNLINK_ISSUE,
        issue: issue,
      });
      const context = dpapp.context.get('ticket');
      context.customFields.setAppField('jiraCards', getState().link.linkedIssues.map(x => x.key));
    });
  }

  return action;
}

export const getLinkedIssues = ({ link }) => link.linkedIssues;

export const getTicket = ({ link }) => link.ticket;

