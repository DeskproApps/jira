import React from 'react';
import PropTypes from 'prop-types';
import { createThrottle, createReducerChain } from '../Infrastructure'
import { UI } from '../UI';
import { JiraService } from '../Jira';
import { Routes } from './Routes';
import { createActionCommentCreate } from '../Comments'


const reduce = createReducerChain([
  require('./Services').reducer,
  require('../BrowseIssues').reducer,
  require('../LinkIssues').reducer,
  require('../CreateIssue').reducer,
  require('../Comments').reducer
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

    ticket: PropTypes.func,

    dispatch: PropTypes.func,
  };

  constructor(props)
  {
    super(props);
    this.init();
    this.initChildContext("");
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
  }

  initChildContext(title)
  {
    const { dpapp } = this.props ;

    this.childContext = {

      dispatch: this.dispatch,

      ticket:  () => ({
        url: dpapp.context.hostUI.tabUrl,
        id: dpapp.context.get('ticket').id,
        title
      })
    };
  }

  componentDidMount()
  {
    // load state, initialize services
    const { ui, dpapp } = this.props ;
    dpapp.context.get('ticket').get('data.original_subject')
      .then(title => {
        this.initChildContext(title);
        return this.loadState();
      })
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
      context.get('ticket').customFields.setAppField('jiraCards', uniqueCards);
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
    return jiraService.readAllIssues(jiraCards).then(issues => {
      return {...state, linkedIssues: issues};
    });
  }

  subscribeToHelpdeskEvents()
  {
    this.props.dpapp.subscribe('ticket.update-success', createThrottle(this.renderHelpdeskUI.bind(this), 500));
    this.props.dpapp.subscribe('ticket.reply', this.onTicketReply.bind(this));
    this.props.dpapp.subscribe('ticket.reply-success', this.onTicketReplySuccess.bind(this));
  }

  renderHelpdeskUI()
  {

    const { deskproWindow, context } = this.props.dpapp ;
    const ticketId = context.get('ticket').id;
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
      })
    ;
  }

  onTicketReply(data)
  {
    const { deskproWindow } = this.props.dpapp ;
    const ticketId = this.props.dpapp.context.get('ticket').id;

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

    return deskproWindow.domQuery(queries)
      .then(results => {
        const handleReply = results.reduce(reduceQueryResults, { reply: false });

        this.setState({ handleReply });
        return data;
      })
      .catch(e => {
        console.error('failed to set the ticket reply strategy', e);

      })
    ;
  }

  onTicketReplySuccess(data)
  {
    const message = data.message.replace(/<(?:.|\n)*?>/gm, '');
    const { reply, strategy } = this.state.handleReply;

    if (reply && strategy === 'add-comment') {
      const { ui } = this.props;
      const { linkedIssues } = this.state;
      return this.dispatch(createActionCommentCreate(message, linkedIssues)).catch(ui.error);
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
        return dpapp.context.get('ticket').customFields.getAppField('jiraCards', [])
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
