import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Menu, ActionBar, Action } from '@deskpro/apps-components';

export class IssueListElement extends React.Component
{
  static propTypes = {

    issue: PropTypes.object.isRequired,

    url: PropTypes.string.isRequired,

    link: PropTypes.func,

    unlink: PropTypes.func,

    edit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.menu = React.createRef();
    this.state = {
      menuOpen: false,
      confirmUnlink: false,
    };
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeMenu);
  }

  toggleMenu = () => {
    if (this.state.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  };

  openMenu = () => {
    this.setState({
      menuOpen: true
    });
    document.addEventListener('mousedown', this.closeMenu);
  };

  closeMenu = (e) => {
    if (this.menu.current && this.menu.current.contains(e.target)) {
      return;
    }
    this.setState({
      menuOpen: false,
      confirmUnlink: false
    });
    document.removeEventListener('mousedown', this.closeMenu);
  };

  confirmUnlink = () => {
    this.setState({
      confirmUnlink: true,
    });
  };

  link = () => {
    const { issue, link } = this.props;
    link(issue);
  };

  unlink = () => {
    const { issue, unlink } = this.props;
    unlink(issue);
  };

  edit = () => {
    const { issue, edit } = this.props;
    edit(issue);
  };

  render()
  {
    const { issue, url } = this.props;
    const { confirmUnlink, menuOpen } = this.state;
    const { fields } = issue;

    return (
      <ListItem className="dp-issue-card">

        <ActionBar
          iconUrl={fields.issuetype.iconUrl}
          title={<a href={url} target="_blank">{fields.issuetype.name}</a>}
        >
          <Menu
            onClick={this.toggleMenu}
            isOpen={menuOpen}
            ref={this.menu}
          >

            {
              [
                this.props.link ? <Action key="link" icon={"link"} label={"Link"} onClick={this.link}/> : null,
                this.props.unlink && !confirmUnlink ? <Action key="unlink" icon="unlink" label="Unlink" onClick={this.confirmUnlink}/> : null,
                this.props.unlink && confirmUnlink ? <Action key="unlink" label="Are you sure?" onClick={this.unlink}/> : null,
                this.props.edit ? <Action icon={"edit"} label={"Edit"} onClick={this.edit}/> : null
              ].filter(x => !!x)
            }

          </Menu>
        </ActionBar>

        <span>{ fields.summary }</span>

      </ListItem>
    );
  }

}
