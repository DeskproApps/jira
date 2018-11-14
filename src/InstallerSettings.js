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

  state = {

    error: null,

    disableGenerateKeys: false,

    setKeyPair: false,

    keyPair: {
      rsaPrivateKey: "",
      rsaPublicKey: "",
    }
  };

  componentDidMount() {
    const { installType } = this.props;

    if (installType === 'install') {
      this.generateKeys();
    }
  }

  generateKeys = () =>
  {
    this.setState({
      disableGenerateKeys: true
    });

    const { restApi } = this.props.dpapp;
    restApi.post('crypto/keypairs')
      .then(({ body }) => {
        this.setState({
          setKeyPair: true,
          keyPair: {
            rsaPrivateKey: body.private_key,
            rsaPublicKey: body.public_key
          }
        })
      }).then(() => this.setState({ disableGenerateKeys: false }));
  };

  onSettings(settings)
  {
    const { oauth, storage } = this.props.dpapp;
    const { finishInstall } = this.props;

    // sanitize inputs
    settings.jiraInstanceUrl = settings.jiraInstanceUrl.trim().replace(/\/$/, "");

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
      .then(() => this.setState({ error: null }))
      .catch(err => {
        console.error("jira error", err);
        this.setState({ error: err })
      })
  ;
  }

  render()
  {
    const { settings, values, finishInstall, settingsForm: SettingsForm } = this.props;
    const { setKeyPair, keyPair, disableGenerateKeys } = this.state;

    let actualValues = values;
    if (setKeyPair) {
      actualValues = { ...values, ...keyPair };
    }

    if (settings.length) {
      let formRef;
      return (
        <div className={'settings'}>
          <SettingsForm settings={settings} values={actualValues} ref={ref => formRef = ref} onSubmit={this.onSettings.bind(this)} />

          {this.state.error ? <div style={{color: "red"}}>An error occurred while verifying the settings. Are you sure you are using the proper credentials? </div> : null }

          <button className={'btn-action'} onClick={() => formRef.submit()}>Update Settings</button>
          &nbsp;&nbsp;
          <button disabled={disableGenerateKeys} className={'btn-action'} onClick={() => this.generateKeys()} style={{
            background: "#5cb85c linear-gradient(to bottom, #fafafa 0%, #d9d9d9 100%) repeat-x",
            color: "black",
            borderColor: "#bababa"
          }}>Generate Keys</button>
        </div>
      );
    }

    finishInstall(null).then(({ onStatus }) => onStatus());
    return null;
  }
}

