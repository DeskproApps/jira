import React from 'react';
import PropTypes from 'prop-types';
import { CreateMetadataFinder } from '../Jira'
import { createThrottle, createReducerChain } from '../Infrastructure'
import { UI } from '../UI';
import { JiraService } from '../Jira';
import { Routes } from './Routes';


const reduce = createReducerChain([
  require('./Services').reducer,
  require('../BrowseIssues').reducer,
  require('../LinkIssues').reducer,
  require('../CreateIssue').reducer
]);

export class App extends React.Component
{
  static propTypes = {

    dpapp: PropTypes.object.isRequired,

    ui: PropTypes.object.isRequired,

    /**
     * Instance of sdk route.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/route.html
     */
    route:   PropTypes.object
  };

  static childContextTypes = {

    loadJiraCreateMeta: PropTypes.func,

    loadJiraEditMeta: PropTypes.func,

    ticket: PropTypes.func,

    dispatch: PropTypes.func,
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

      foundIssues: [],

      handleReply: {
        reply: false,
        strategy: 'none'
      }
    };

    const { dpapp, tabData } = this.props ;

    this.childContext = {

      dispatch: this.dispatch,

      loadJiraCreateMeta: this.loadJiraCreateMeta.bind(this),

      loadJiraEditMeta: this.loadJiraEditMeta.bind(this),

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
    const { ui } = this.props ;
    this.loadState()
      .then(state => {
        this.setState(state);
        return state;
      })
      .then(this.synchronizeState.bind(this))
      .then(state => {
        this.subscribeToHelpdeskEvents();
        this.renderHelpdeskUI();
        return state;
      })
      .then(state => {
        const jiraService = this.createJiraService();
        return jiraService.verifyAccess()
          .then(() => {
            this.props.route.to(Routes.linkedIssues);
            return state;
          })
          .catch(err => {
            this.props.route.to(Routes.signIn);
            return state;
          })
        ;
      })
      .then((state) => {
        this.setState({ ...state, appReady: true });
      })
      .catch(ui.error)
    ;
  }

  componentDidUpdate(prevProps, prevState)
  {
    const { context } = this.props.dpapp;

    if (prevState.linkedIssues !== this.state.linkedIssues) {
      const allJiraCards = [].concat(this.state.jiraCards).concat(this.state.linkedIssues.map(issue => issue.key));
      const uniqueCards = allJiraCards.filter(function(elem, pos, arr) {
        return arr.indexOf(elem) == pos;
      });
      context.customFields.setAppField('jiraCards', uniqueCards);
    }
  }

  dispatch = action =>
  {
    if (typeof action === 'function') {
      const jiraService = this.createJiraService();
      return action({ dispatch: this.dispatch, jiraService, dpapp: this.props.dpapp });
    }

    if (typeof action === 'object') {
      const state = reduce(this.state, action);
      if (state !== this.state) {
        this.setState(state);
      }
    }
  };

  synchronizeState(state)
  {
    // synchronize jiraCards
    const { jiraCards } = state;
    if (0 === jiraCards.length) {
      return jiraCards;
    }

    const jiraService = this.createJiraService( state.jiraInstanceUrl );
    const { context } = this.props.dpapp;

    return jiraService.readAllIssues(jiraCards).then(issues => {
      return {...state, linkedIssues: issues};
    });
  }

  subscribeToHelpdeskEvents()
  {
    this.props.dpapp.subscribe('context.ticket.update-success', createThrottle(this.renderHelpdeskUI.bind(this), 500));
    this.props.dpapp.subscribe('context.ticket.reply', this.onTicketReply.bind(this));
    this.props.dpapp.subscribe('context.ticket.reply-success', this.onTicketReplySuccess.bind(this));
  }

  renderHelpdeskUI()
  {
    const { deskproWindow } = this.props.dpapp ;
    const { entityId: ticketId } = this.props.dpapp.context;
    const domRootId = `app-jira-${ticketId}`;

    const insertQuery = {
      parent: `#ticket${ticketId}-reply-controls`,
      markup: `<div class="cell" id="${domRootId}">
                  <div class="inner-cell" style="padding-left: 11px;">
                    <input type="checkbox" id="ticket${ticketId}-reply-with-jira" />
                  </div>
                  <div class="inner-cell" style="position: relative;">
                      <select id="ticket${ticketId}-reply-with-jira-strategy" style="min-width: 170px;" data-style-type="icons">
                      <option value="add-comment" selected="selected">Send comment to JIRA</option>
                      <option value="new-issue">Send to JIRA as new issue</option>
                    </select>
                  </div>
              </div>`
    };

    deskproWindow.domQuery({ type: 'exists', selector: `#${domRootId}`})
      .then(value => {
        if (false === value.exists) {
          deskproWindow.domInsert(insertQuery);
        }
    });
  }

  onTicketReply(response, data)
  {
    const { deskproWindow } = this.props.dpapp ;
    const { entityId: ticketId } = this.props.dpapp.context;

    const queries = [{
      name: 'reply',
      type: 'valueOf',
      selector: `#ticket${ticketId}-reply-with-jira`
    },
      {
        name: 'strategy',
        type: 'valueOf',
        selector: `#ticket${ticketId}-reply-with-jira-strategy`
      },
    ];

    const reduceQueryResults = (o, {name, value}) => {
      o[name] = value;
      return o;
    };

    deskproWindow.domQuery(queries)
      .then(results => {
        const handleReply = results.reduce(reduceQueryResults, { reply: false });
        const onAfterSetState = () => { response({ allowReply: true }); };
        this.setState({ handleReply }, onAfterSetState);
    });
  }

  onTicketReplySuccess(data)
  {
    const { message } = data;
    const { reply, strategy } = this.state.handleReply;

    if (reply && strategy === 'add-comment') {
      const { ui } = this.props;
      return this.addComment(message).catch(ui.error);
    }

    if (reply && strategy === 'new-issue') {
      const { route } = this.props;
      route.to(Routes.createIssue, { comment: message });
    }
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
      }).catch(e => {
        console.error(e);
      })
    ;
  }

  /**
   * @return {JiraService}
   */
  createJiraService( jiraInstanceUrl )
  {
    const { dpapp } = this.props ;
    const instanceUrl = jiraInstanceUrl || this.state.jiraInstanceUrl;

    return new JiraService({
      httpClient: dpapp.restApi.fetchCORS.bind(dpapp.restApi),
      instanceUrl
    });
  }

  /**
   * @return {Promise.<CreateMetadataFinder>}
   */
  loadJiraCreateMeta()
  {
    const meta = window.sessionStorage.getItem('createMeta');
    if (meta) {
      return Promise.resolve(
        new CreateMetadataFinder(JSON.parse(meta))
      );
    }

    return this.createJiraService().loadCreateMeta().then(meta => {
      window.sessionStorage.setItem('createMeta', JSON.stringify(meta));
      return new CreateMetadataFinder(meta);
    });
  }

  /**
   * @return {Promise.<{}>}
   */
  loadJiraEditMeta(issue)
  {
    return this.createJiraService().loadEditMeta(issue).then(meta => {
      return meta;
    });
  }

  /**
   * @param {string} comment
   * @return {*}
   */
  addComment(comment)
  {
    const { linkedIssues } = this.state;
    if (linkedIssues.length === 0) {
      return Promise.reject(new Error('there are no linked issues'));
    }
    const jiraService = this.createJiraService();

    const promises = linkedIssues.map(issue => jiraService.createComment(issue, comment).then(
      result => ({ status:'success', result }),
      err => ({ status:'success', result: err })
    ));

    return Promise.all(promises).then(results => results.filter(x => x.status === 'success').map(x => x.result));
  }

  getChildContext() { return this.childContext; }

  render()
  {
    if (this.state.appReady === false) {
      return null;
    }

    const { linkedIssues, foundIssues } = this.state;
    const { route } = this.props;

    return (<UI route={route} dispatch={this.dispatch} linkedIssues={linkedIssues} foundIssues={foundIssues}/>);
  }
}
