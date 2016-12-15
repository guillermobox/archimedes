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
    const title = this.state.Title || this.state.URL;
    const icons = {video: "fa-file-video-o", web: "fa-file-text-o", pdf: "fa-file-pdf-o"};
    const icon = icons[this.state.Kind];
    return (
      <li className="noselect resource" onClick={this.showResource}>
        <i className={"fa " + icon} onClick={this.toggleFav}></i>
        <span>{title}</span>
      </li>
    );
  }
}

