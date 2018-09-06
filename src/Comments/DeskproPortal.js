import React from 'react';
import PropTypes from 'prop-types';
import { createThrottle, reduxConnector} from '../infrastructure'
import { gotoCreate } from "../App";
import { getLinkedIssues } from "../LinkIssues";
import { addComment } from "./index";

const defaultReplyStrategy = {
  reply: false,
  strategy: "no-comment"
};

let handleReply = JSON.parse(JSON.stringify(defaultReplyStrategy));

function onTicketReply(data)
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
      handleReply = results.reduce(reduceQueryResults, JSON.parse(JSON.stringify(defaultReplyStrategy)));
      return data;
    })
    .catch(e => console.error('failed to set the ticket reply strategy', e))
    ;
}

function onTicketReplySuccess(data)
{
  const message = data.message.replace(/<(?:.|\n)*?>/gm, '');
  const { reply, strategy } = handleReply;

  if (reply && strategy === 'add-comment') {
    const { dpapp, addComment, linkedIssues } = this.props;
    return addComment(message, linkedIssues).catch(dpapp.ui.showErrorNotification);
  }

  if (reply && strategy === 'new-issue') {
    const { navigator } = this.props;
    navigator({ comment: message })(gotoCreate);
  }
}

function forceUpdate()
{
  this.forceUpdate();
}

export class DeskproPortal extends React.PureComponent
{
  static propTypes = {
    dpapp:        PropTypes.object.isRequired,
    navigator:  PropTypes.func.isRequired,
    linkedIssues: PropTypes.array.isRequired,
    addComment:   PropTypes.func.isRequired
  };

  componentDidMount()
  {
    const { dpapp } = this.props;

    dpapp.subscribe('ticket.update-success', createThrottle(forceUpdate.bind(this), 500));
    dpapp.subscribe('ticket.reply', onTicketReply.bind(this));
    dpapp.subscribe('ticket.reply-success', onTicketReplySuccess.bind(this));
  }

  render()
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

    return null
  }
}

export default reduxConnector(
  DeskproPortal, { addComment }, { linkedIssues: getLinkedIssues }
);
