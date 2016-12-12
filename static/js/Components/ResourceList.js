import React from "react"
import ResourceEntry from "./ResourceEntry"
import ListControls from "./ListControls"
import resourceStore from "../Store"

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
    console.log("Syncing with data:", resources);
    this.setState({data:resources});
  }
  render () {
    const data = this.state['data'].reverse();
    const resources = data.map((info,i) => <ResourceEntry data={info} key={i} />);
    return (
      <div id="ResourceList">
      <ListControls />
      <ul>
      {resources}
      </ul>
    </div>);
  }
}

