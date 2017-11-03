import {JiraEndpoint} from './JiraEndpoint'

export class JiraApi
{
  constructor({ instanceUrl })
  {
    this.props = { apiRoot: `${instanceUrl}/rest/api/2` };
  }

  /**
   * @param path
   * @return {JiraEndpoint}
   */
  endpoint(path)
  {
    const { apiRoot } = this.props;

    const headers = {
      'Content-Type': 'application/json' ,
      'Accept': 'application/json' ,
      'X-Proxy-SignWith':  'oauth1 oauth:jira'
    };

    return new JiraEndpoint({ url: `${apiRoot}/${path}`, headers })
  }

}
