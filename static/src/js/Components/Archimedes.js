import React from "react"
import Navigation from "./Navigation"
import ResourceList from "./ResourceList"
import ResourceTree from "./ResourceTree"
import ResourceContents from "./ResourceContents"
import Panels from "./Panels"
import { resourceStore } from "../Store"

//import Alertify from "alertifyjs"

var alertify = require('alertifyjs');

class Notifications extends React.Component {
  constructor () {
    super()
    this.showCreated = this.showCreated.bind(this)
  }
  componentWillMount() {
    resourceStore.on("create", this.showCreated)
  }
  componentWillUmount() {
    resourceStore.off("create", this.showCreated)
  }
  showCreated (resource) {
    alertify.notify("Created new resource: " + resource.URL);
  }
  render () {
    return false;
  }
}

export default class Archimedes extends React.Component {
  render() {
    return (
      <div>
      <Notifications />
      <Navigation target={this.props.params.id} />
      <Panels
        showDrag={true}
        first={<ResourceList />}
        second={this.props.children} />
      </div>
    );
  }
}

