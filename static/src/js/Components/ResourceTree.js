import React from "react"
import ResourceEntry from "./ResourceEntry"
import ListControls from "./ListControls"
import resourceStore from "../Store"
import { humanFileSize } from "../utilities"

export default class ResourceTree extends React.Component {
  constructor () {
    super();
    this.state = {data:[]};
    this.sync = this.sync.bind(this);
  }
  componentWillMount() {
    if (this.props.folder == "/") {
      this.setState({open:true});
    }
    if (this.props.data)
      this.setState({data:this.props.data});
    if (this.props.folder == "/")
      resourceStore.on("sync", this.sync);
  }
  componentWillUmount() {
    if (this.props.folder == "/")
      resourceStore.off("sync", this.sync);
  }
  sync (resources) {
    this.setState({data:resources});
  }
  openClose () {
    this.setState({open: !this.state.open});
  }
  render () {
    const data = this.state['data'];
    const foldericon = this.state.open? "fa fa-folder-open-o" : "fa fa-folder-o"

    const disksize = data.map(item => item.DiskUsage).reduce((x,y) => x + y, 0)
    const folderlist = [...new Set(data.map(info => info.Folder)).values()];

    const resources = data
      .filter(info => info.Folder == this.props.folder)
      .map(info => <ResourceEntry data={info} key={info.ID} />);

    const folders = [];
    let i = 0;
    for (let folder of folderlist) {
      if (folder.startsWith(this.props.folder) && folder !== this.props.folder) {
        const folderResources = data.filter(info => info.Folder.startsWith(folder));
        folders.push(<ResourceTree folder={folder} data={folderResources} key={i} />);
      }
      i = i + 1;
    }
    return (
      <div className="ResourceTree">
      <ul>
      <li className="noselect" onClick={this.openClose.bind(this)}>
        <i style={{width:"20px"}} className={foldericon}></i>
        <span>{this.props.folder}</span>
        <span style={{color:"#AAA"}}>({data.length} elements, {humanFileSize(disksize)})</span>
      </li>
      {this.state.open && folders}
      {this.state.open && resources}
      </ul>
    </div>);
  }
}

