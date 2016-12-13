import React from "react"

import resourceStore from "../Store"

export default class ResourceContents extends React.Component {
  constructor() {
    super();
    this.state = {}
    this.frameContent = this.frameContent.bind(this);
  }
  updateContents(data) {
    this.setState(data);
  }
  componentWillMount() {
    resourceStore.on("show", this.updateContents.bind(this))
  }
  frameContent () {
    switch (this.state.Kind) {
      case "video":
        return (<video controls autoPlay src={this.state.LocalURL}></video>);
      case "web":
        return (<iframe frameBorder="0" src={this.state.LocalURL} sandbox="allow-scripts allow-popups allow-same-origin allow-forms"> </iframe>);
    }
  }
  render () {
    return (
      <div id="ResourceContents">
        {this.frameContent()}
    </div>);
  }
}

