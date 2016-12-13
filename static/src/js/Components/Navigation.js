import React from "react"
import resourceStore from "../Store.js"


export default class Navigation extends React.Component {
  constructor () {
    super();
    this.state = {};
  }
  updateTitle (data) {
    this.setState(data);
  }
  componentWillMount() {
    resourceStore.on("show", this.updateTitle.bind(this))
  }
  render () {
    return (
      <nav>
      <img src="images/archimedes_head.png"></img>
      <span>Archimedes</span>
      <span id="contentTitle">{this.state.Title}</span>
      </nav>
    );
  }
}

