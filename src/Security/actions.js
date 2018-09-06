

export function verifyAccess()
{
  function action (dispatch, getState, jiraService) {
    return jiraService.verifyAccess()
  }

  return action;
}

/**
 * @param dpapp
 * @return {function(Function, Function, *): *}
 */
export function signIn(dpapp)
{
  /**
   * @param {function} dispatch
   * @param {function} getState
   * @param jiraService
   * @return {*}
   */
  function action (dispatch, getState, jiraService) {

    const { oauth, storage } = dpapp;

    return oauth.requestAccess('jira', { protocolVersion: '1.0' })
      .then(({oauth_token: token, oauth_token_secret: tokenSecret}) => storage.setAppStorage('oauth:jira:tokens', {token, tokenSecret}))
      ;
  }

  return action;
}
