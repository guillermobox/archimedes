import React from "react"
import ResourceEntry from "./ResourceEntry"
import ListControls from "./ListControls"
import { resourceStore } from "../Store"

export default class ResourceList extends React.Component {
  constructor () {
    super();
    this.state = {data:[]};
    this.sync = this.sync.bind(this);
  }
  componentWillMount() {
    resourceStore.on("sync", this.sync)
  }
  componentWillUmount() {
    resourceStore.off("sync", this.sync)
  }
  sync (resources) {
    this.setState({data:resources});
  }
  render () {
    const data = this.state['data'];
    const resources = data.map((info,i) => <ResourceEntry data={info} key={info.ID} />);
    return (
      <div id="ResourceList">
      <ListControls />
      <ul>
      {resources}
      </ul>
    </div>);
  }
}

