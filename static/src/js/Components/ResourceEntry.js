import React from 'react';

import * as Actions from '../Actions';

export default class ResourceEntry extends React.Component {
  constructor () {
    super();
    this.state = {};
    this.showResource = this.showResource.bind(this);
    this.toggleFav = this.toggleFav.bind(this);
  }
  showResource (ev) {
    if (ev.ctrKey) {
      Actions.showResource(this.state);
    } else {
      Actions.showResource(this.state);
    }
  }
  toggleFav (ev) {
    Actions.toggleFavorite(this.state)
    ev.stopPropagation()
  }
  componentWillMount () {
    this.setState(this.props.data)
  }
  render () {
    const favicon = this.state.Favorited ? "fa fa-heart" : "fa fa-heart-o";
    const title = this.state.Title || this.state.URL;
    return (
      <li className="noselect" onClick={this.showResource}>
        <i className={favicon} onClick={this.toggleFav}></i>
        <span>{title}</span>
      </li>
    );
  }
}

