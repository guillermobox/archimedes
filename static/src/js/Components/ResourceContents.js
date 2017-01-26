import React from "react"

import { resourceStore } from "../Store"

export default class ResourceContents extends React.Component {
  constructor() {
    super();
    this.state = {}
    this.frameContent = this.frameContent.bind(this)
    this.sync = this.sync.bind(this)
  }
  componentWillMount() {
    resourceStore.on("sync", this.sync)
  }
  componentWillUmount() {
    resourceStore.off("sync", this.sync)
  }
  componentWillReceiveProps (nextProps) {
    const data = resourceStore.getState()
    const state = data.find(res => res.ID == nextProps.params.id)
    this.setState(state);
  }
  sync (data) {
    const state = data.find(res => res.ID == this.props.params.id)
    this.setState(state);
  }
  frameContent () {
    switch (this.state.Kind) {
      case "video":
        return (<video controls autoPlay src={this.state.LocalURL}></video>);
      case "web":
        return (<iframe frameBorder="0" src={this.state.LocalURL} sandbox="allow-scripts allow-popups allow-same-origin allow-forms"> </iframe>);
      case "pdf":
        return (<object data={this.state.LocalURL}></object>);
    }
  }
  render () {
    return (
      <div id="ResourceContents">
        {this.frameContent()}
    </div>);
  }
}

