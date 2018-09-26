import React from 'react';
import PropTypes from 'prop-types';

export default class InstallerSettings extends React.Component
{
  static propTypes = {
    finishInstall: PropTypes.func.isRequired,
    installType: PropTypes.string.isRequired,
    settings: PropTypes.array.isRequired,
    values: PropTypes.array.isRequired,
    settingsForm: PropTypes.func.isRequired,
    dpapp: PropTypes.object.isRequired
  };

  onSettings(settings)
  {
    const { oauth, storage } = this.props.dpapp;
    const { finishInstall } = this.props;

    // retrieve the oauth proxy settings for jira
    oauth.settings('jira', { protocolVersion: '1.0' })
      .then(oauthSettings => {
        return {
          providerName: 'jira',
          urlRedirect: oauthSettings.urlRedirect,
          urlAuthorize: `${settings.jiraInstanceUrl}/plugins/servlet/oauth/authorize`,
          urlAccessToken: `${settings.jiraInstanceUrl}/plugins/servlet/oauth/access-token`,
          urlTemporaryCredentials: `${settings.jiraInstanceUrl}/plugins/servlet/oauth/request-token`,
          urlResourceOwnerDetails: '',
          clientId: `${settings.jiraClientId}`,
          clientSecret: '',
          rsaPrivateKey: settings.rsaPrivateKey,
          rsaPublicKey: settings.rsaPublicKey,
          token: '',
          tokenSecret: ''
        };
      })
      .then(connectionProps => oauth.register('jira', connectionProps))
      .then(() => oauth.requestAccess('jira', { protocolVersion: '1.0' }).then(({oauth_token: token, oauth_token_secret: tokenSecret}) => storage.setAppStorage('oauth:jira:tokens', {token, tokenSecret})))
      .then(() => finishInstall(settings).then(({ onStatus }) => onStatus()))
      .catch(err => {}) // TODO display errors
  ;
  }

  render()
  {
    const { settings, values, finishInstall, settingsForm: SettingsForm } = this.props;

    if (settings.length) {
      let formRef;
      return (
        <div className={'settings'}>
          <SettingsForm settings={settings} values={values} ref={ref => formRef = ref} onSubmit={this.onSettings.bind(this)} />
          <button className={'btn-action'} onClick={() => formRef.submit()}>Update Settings</button>
        </div>
      );
    }

    finishInstall(null).then(({ onStatus }) => onStatus());
    return null;
  }
}

