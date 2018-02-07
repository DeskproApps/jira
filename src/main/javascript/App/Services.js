const ACTION_SIGN_IN = 'sign-in';

export function reducer(state, action)
{
  return state;
}

export function createSignInAction()
{
  /**
   * @param {function} dispatch
   * @param dpapp
   * @return {*}
   */
  const action = ({ dispatch, dpapp }) => {

    const { oauth, storage } = dpapp;

    return oauth.access('jira', { protocolVersion: '1.0' })
      .then(({oauth_token: token, oauth_token_secret: tokenSecret}) => storage.setAppStorage('oauth:jira:tokens', {token, tokenSecret}))
      ;
  };

  return action;
}
