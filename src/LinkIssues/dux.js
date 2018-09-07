import { addComment } from '../Comments/actions'

const ACTION_LINK_ISSUE = 'link-issues';
const ACTION_UNLINK_ISSUE = 'unlink-issues';

export function reducer(state, action)
{
  if (! state) {
    return {
      ticket: {
        url: null,
        id:  null,
        title: null
      },
      linkedIssues: []
    };
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

/**
 * @param {object} dpapp
 * @param {object} issue
 * @param {{title, url, id}} ticket
 * @return {function(Function, *, JiraService): *}
 */
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
    }).then(() => {
      const comment = `Deskpro Jira app linked Deskpro ticket #${ticket.id} at ${ticket.url} with this issue`;
      dispatch(addComment(comment, [issue]))
    });
  }

  return action;
}

/**
 * @param {object} dpapp
 * @param {object} issue
 * @param {{title, url, id}} ticket
 * @return {function(Function, *, JiraService): *}
 */
export function unlinkJiraIssue(dpapp, issue, ticket)
{
  /**
   * @param {function} dispatch
   * @param getState
   * @param {JiraService} jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService) {
    return jiraService.deleteLink(issue, ticket)
      .then(link => {
          dispatch({
            type: ACTION_UNLINK_ISSUE,
            issue: issue,
          });
          const context = dpapp.context.get('ticket');
          context.customFields.setAppField('jiraCards', getState().link.linkedIssues.map(x => x.key));
    })
      .then(() => {
        const comment = `Deskpro Jira App removed the link to Deskpro ticket #${ticket.id} at ${ticket.url} `;
        dispatch(addComment(comment, [issue]))
      });

  }

  return action;
}

export const getLinkedIssues = ({ link }) => link.linkedIssues;

export const getTicket = ({ link }) => link.ticket;

