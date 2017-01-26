import React from 'react';
import { hashHistory } from 'react-router';

import * as Actions from '../Actions';

export default class ResourceEntry extends React.Component {
  constructor () {
    super();
    this.state = {};
    this.showResource = this.showResource.bind(this);
  }
  showResource (ev) {
    hashHistory.push('/show/' + this.state.ID)
  }
  componentWillMount () {
    this.setState(this.props.data)
  }
  componentWillReceiveProps(nextProps) {
    this.setState(nextProps)
  }
  render () {
    const title = this.state.Title || this.state.URL;
    const icons = {video: "fa-file-video-o", web: "fa-file-text-o", pdf: "fa-file-pdf-o"};
    const icon = icons[this.state.Kind];
    return (
      <li className="noselect resource" onClick={this.showResource}>
        <i className={"fa " + icon}></i>
        <span>{title}</span>
      </li>
    );
  }
}

