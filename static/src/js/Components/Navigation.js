import React from "react"
import resourceStore from "../Store.js"
import Portal from "react-portal";

import * as Actions from '../Actions';

class NewResource extends React.Component {
  submitResource () {
    Actions.createResource({URL:this.refs.form.elements.url.value, Folder:this.refs.form.elements.folder.value})
    this.props.closePortal()
  }

  render () {
    return (
      <div className="Portal">
      <div className="PortalContents">
      <h1>Add a new resource to archimedes</h1>
      <form ref="form" className="noselect">
      <label htmlFor="url">Resource URL</label>
      <input autoFocus type="text" id="url"></input>
      <label htmlFor="folder">Folder</label>
      <input type="text" id="folder"></input>
      <input defaultChecked="checked" type="checkbox" id="download"></input>
      <label className="checkbox" htmlFor="download">
      Download inmediately
      </label>
      </form>
      <div className="ModalButtons">
        <button onClick={this.props.closePortal}>Close</button>
        <button onClick={this.submitResource.bind(this)} className="default">Submit</button>
      </div>
      </div>
      </div>
    )
  }
}

export default class Navigation extends React.Component {
  constructor () {
    super();
    this.state = {};
    this.sync = this.sync.bind(this);
  }
  updateTitle (data) {
    this.setState({Title: data});
  }
  componentWillMount() {
    resourceStore.on("sync", this.sync)
  }
  componentWillUmount() {
    resourceStore.off("sync", this.sync)
  }
  componentWillReceiveProps (nextProps) {
    const data = resourceStore.getState()
    const state = data.find(res => res.ID == nextProps.target)
    this.updateTitle(state.Title)
  }
  sync (data) {
    const state = data.find(res => res.ID == this.props.target)
    this.setState(state);
  }
  render () {
    const boton = <button className="fa fa-plus"></button>;
    return (
      <nav>
      <img src="images/archimedes_head.png"></img>
      <span>Archimedes</span>
      <span id="contentTitle">{this.state.Title}</span>
      <Portal closeOnEsc openByClickOn={boton}>
      <NewResource />
      </Portal>
      </nav>
    );
  }
}

