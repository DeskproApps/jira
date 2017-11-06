import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import { PageIndex } from '../UI';
import { JiraService } from '../Jira';

export class App extends React.Component
{
  static propTypes = {
    dpapp: PropTypes.object.isRequired,

    ui: PropTypes.object.isRequired
  };

  static childContextTypes = {

    linkJiraIssue: PropTypes.func,

    unlinkJiraIssue: PropTypes.func,

    createJiraIssue: PropTypes.func,

    loadJiraCreateMeta: PropTypes.func,

    searchJiraIssues: PropTypes.func,

    createIssueAction: PropTypes.func,

    ticket: PropTypes.func
  };

  constructor(props)
  {
    super(props);
    this.init();
  }

  init()
  {
    this.state = {
      appReady: false,
      jiraInstanceUrl: '',
      jiraCards: [],
      linkedIssues: [],
    };

    const { dpapp, tabData } = this.props ;

    this.childContext = {

      linkJiraIssue: this.linkJiraIssue.bind(this),

      unlinkJiraIssue: this.unlinkJiraIssue.bind(this),

      createJiraIssue: this.createJiraIssue.bind(this),

      loadJiraCreateMeta: this.loadJiraCreateMeta.bind(this),

      searchJiraIssues: this.searchJiraIssues.bind(this),

      createIssueAction: this.createIssueAction.bind(this),

      ticket:  () => ({
        url: dpapp.context.tabUrl,
        id: dpapp.context.entityId,
        title: tabData.original_subject
      })
    };
  }

  componentDidMount()
  {
    // load state, initialize services
    const { dpapp, ui } = this.props ;
    this.loadState()
      .then(state => {
        this.setState(state);
        return state;
      })
      .then(this.synchronizeState.bind(this))
      .then(state => {
        this.setState({ ...state, appReady: true });
      })
      .catch(ui.error)
    ;
  }

  synchronizeState(state)
  {
    // synchronize jiraCards
    const { jiraCards } = state;
    if (0 === jiraCards.length) {
      return jiraCards;
    }

    const jiraService = this.createJiraService();
    const { context } = this.props.dpapp;

    return jiraService.readAllIssues(jiraCards).then(issues => {
      const jiraCards = issues.map(x => x.key);
      //context.customFields.setAppField('jiraCards', jiraCards)
      return {...state, linkedIssues: issues};
    });
  }

  loadState()
  {
    const { dpapp } = this.props ;
    const state = {
      jiraInstanceUrl: '',
      jiraCards: []
    };

    return dpapp.storage.getAppStorage('jiraInstanceUrl')
      .then(value => {
        state.jiraInstanceUrl = value;
        return dpapp.context.customFields.getAppField('jiraCards', [])
      })
      .then(cards => {
        state.jiraCards = cards
      })
      .then(() => {
        return state;
      })
    ;
  }

  /**
   * @return {JiraService}
   */
  createJiraService()
  {
    const { dpapp } = this.props ;
    const { jiraInstanceUrl } = this.state;

    return new JiraService({
      httpClient: dpapp.restApi.fetchCORS.bind(dpapp.restApi),
      instanceUrl: jiraInstanceUrl
    });
  }

  /**
   * @param fields
   * @return {*}
   */
  createJiraIssue(fields)
  {
    const jiraService = this.createJiraService();

    return jiraService
      .createIssue(fields)
      .then(({ key }) => jiraService.readIssue(key))
    ;
  }

  /**
   * @param issue
   * @return {*}
   */
  linkJiraIssue(issue)
  {
    const jiraService = this.createJiraService();
    const { /** @type {function} */ ticket } = this.childContext;
    const { context } = this.props.dpapp;

    const { linkedIssues } = this.state;
    linkedIssues.push(issue);

    return jiraService.createLink(issue, ticket())
      .then(link => context.customFields.setAppField('jiraCards', linkedIssues.map(issue => issue.key)))
      .then(() => {
        this.setState({ linkedIssues });
        return issue;
      })
    ;
  }

  /**
   * @param issue
   * @return {Promise.<TResult>}
   */
  unlinkJiraIssue(issue)
  {
    const jiraService = this.createJiraService();
    const { /** @type {function} */ ticket } = this.childContext;

    const linkedIssues = this.state.linkedIssues.filter(x => x.key !== issue.key);
    const { context } = this.props.dpapp;

    return jiraService.deleteLink(issue, ticket())
      .then(link => context.customFields.setAppField('jiraCards', linkedIssues.map(issue => issue.key)))
      .then(() => {
        this.setState({ linkedIssues });
        return issue;
      })
    ;
  }

  /**
   * @return {*}
   */
  loadJiraCreateMeta()
  {
    return this.createJiraService().loadCreateMeta();
  }

  /**
   * @param query
   * @return {*}
   */
  searchJiraIssues(query)
  {
    return this.createJiraService().searchIssue(query);
  }

  /**
   * @param issue
   * @param options
   * @return {*}
   */
  createIssueAction(issue, options)
  {
    const { linkJiraIssue, unlinkJiraIssue } = this.childContext;

    let action;
    if (this.state.linkedIssues.filter(x => x.key === issue.key).length) {
      action = { type: 'unlink', dispatch: unlinkJiraIssue };
    } else {
      action = { type: 'link', dispatch: linkJiraIssue };
    }

    if (! options || typeof options.interceptor !== 'function') {
      return action;
    }

    const { interceptor } = options;

    return {
      type: action.type,
      dispatch: issue => interceptor(action, issue)
    }

  }

  getChildContext() { return this.childContext; }

  // shouldComponentUpdate() { return false; }

  render() {

    if (this.state.appReady === false) {
      return null;
    }

    const { linkedIssues } = this.state;

    return (
      <div>
        <PageIndex linkedIssues={ linkedIssues }/>
      </div>
    );


  }
}
