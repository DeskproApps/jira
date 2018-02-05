import { JiraApi } from './JiraApi'

const parseIssueIdentifier = issue => {
  "use strict";
  if (typeof issue === 'string') {
    return issue;
  }

  if (typeof issue === 'object' && typeof issue.key === 'string' ) {
    return issue.key;
  }

  if (typeof issue === 'object' && ( typeof issue.id === 'string' || typeof issue.id === 'number')) {
    return issue.id;
  }

  throw new Error('failed to parse issue identifier');
};

const createLinkGlobalId = ticket => `deskpro_ticket_${ticket.id}`;

export class JiraService
{
  constructor({ httpClient, instanceUrl })
  {
    this.props = { httpClient, instanceUrl };
  }

  /**
   * @param {*} issue
   * @return {Promise}
   */
  loadEditMeta(issue)
  {
    let issueId;
    try {
      issueId = parseIssueIdentifier(issue);
    } catch (e) {
      return Promise.reject(e);
    }

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const endpoint = jiraApi.endpoint(`issue/${issueId}/editmeta`);
    const initRequest = { method: "GET" };

    return httpClient(endpoint.url, endpoint.initRequest(initRequest))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
      ;
  }

  loadCreateMeta()
  {

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const endpoint = new JiraApi({ instanceUrl }).endpoint(`issue/createmeta?expand=projects.issuetypes.fields`);
    const initRequest = { method: "GET" };

    return httpClient(endpoint.url, endpoint.initRequest(initRequest))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
    ;
  }

  /**
   * @param {{ key:String } | String}  issue
   * @param ticket
   * @return {*}
   */
  deleteLink(issue, ticket)
  {
    let issueId;
    try {
      issueId = parseIssueIdentifier(issue);
    } catch (e) {
      return Promise.reject(e);
    }

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const endpoint = jiraApi.endpoint(`issue/${issueId}/remotelink?globalId=${createLinkGlobalId(ticket)}`);

    const initRequest = {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json' ,
      }
    };

    return httpClient(endpoint.url, endpoint.initRequest(initRequest))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
    ;
  };

  /**
   * @param {{ key:String } | String}  issue
   * @param ticket
   * @return {*}
   */
  createLink(issue, ticket)
  {
    let issueId;
    try {
      issueId = parseIssueIdentifier(issue);
    } catch (e) {
      return Promise.reject(e);
    }

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const endpoint = jiraApi.endpoint(`issue/${issueId}/remotelink`);
    const body = {
      globalId: createLinkGlobalId(ticket),
      relationship: 'linked with',
      object: {
        url: ticket.url,
        title: `DeskPRO # ${ticket.id}`,
        summary: ticket.title
      }
    };
    const initRequest = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json' ,
        'Content-Length': typeof body !== 'string' ? JSON.stringify(body).length : body.length
      },
      body: JSON.stringify(body)
    };

    return httpClient(endpoint.url, endpoint.initRequest(initRequest))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
    ;
  }

  readAllIssues(keys)
  {
    const promises = keys.map(key => this.readIssue(key).then(
      result => {
        return { status:'success', result };
      },
      err => {
        return { status:'error', result: err };
      }
    ));

    return Promise.all(promises).then(results => results.filter(x => x.status === 'success').map(x => x.result));
  }

  readIssue(key)
  {
    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const readIssue = jiraApi.endpoint(`issue/${key}`);

    return httpClient(readIssue.url, readIssue.initRequest({
      method: "GET",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json'
      }
    }))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
    ;
  }

  createIssue(issue)
  {
    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const createIssue = jiraApi.endpoint(`issue`);

    return httpClient(createIssue.url, createIssue.initRequest({
      method: "POST",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json' ,
        'Content-Length': JSON.stringify({fields: issue}).length
      },
      body: JSON.stringify({fields: issue})
    }))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
    ;
  }

  updateIssue(issue, fields)
  {
    let issueId;
    try {
      issueId = parseIssueIdentifier(issue);
    } catch (e) {
      return Promise.reject(e);
    }

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const updateIssue = jiraApi.endpoint(`issue/${issueId}`);

    return httpClient(updateIssue.url, updateIssue.initRequest({
        method: "PUT",
        headers: {
          'Content-Type': 'application/json' ,
          'Accept': 'application/json' ,
          'Content-Length': JSON.stringify({fields}).length
        },
        body: JSON.stringify({fields})
      }))
      .catch(err => Promise.reject(err))
      //.then(response => { return response.body; }) we're receiving a 204 from jira, so we return the original issue
      .then(response => { return issue; })
    ;
  }

  searchIssue(query)
  {
    if (! query) {
      return Promise.resolve([]);
    }

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const search = jiraApi.endpoint(`search`);

    const body = {
      jql: `project = "${query}" OR summary ~ "${query}" OR description ~ "${query}" OR key = "${query}" `,
      validateQuery: false
    };

    return httpClient(search.url, search.initRequest({
      method: "POST",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json' ,
        'Content-Length': JSON.stringify(body).length
      },
      body: JSON.stringify(body)
    }))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
      .then(({ issues, ...rest }) => {
        return issues;
      })
    ;
  }

  /**
   * @param {{ key:String } | String}  issue
   * @param comment
   * @return {*}
   */
  createComment(issue, comment)
  {
    let issueId;
    try {
      issueId = parseIssueIdentifier(issue);
    } catch (e) {
      return Promise.reject(e);
    }

    const {
      /** @type {function} **/ httpClient,
      /** @type {string} **/ instanceUrl
    } = this.props;

    const jiraApi = new JiraApi({ instanceUrl });
    const endpoint = jiraApi.endpoint(`issue/${issueId}/comment`);

    const body = { body: comment };
    return httpClient(endpoint.url, endpoint.initRequest({
      method: "POST",
      headers: {
        'Content-Type': 'application/json' ,
        'Accept': 'application/json' ,
        'Content-Length': JSON.stringify(body).length
      },
      body: JSON.stringify(body)
    }))
      .catch(err => Promise.reject(err))
      .then(response => { return response.body; })
    ;
  }
}
