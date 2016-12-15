import React from "react";
import ReactDOM from "react-dom";

export default class Panels extends React.Component {
  startDragging (event) {
    this.refs.overlay.style.display = 'block';
    this.refs.overlay.onmouseup = this.stopDragging.bind(this);
    this.refs.overlay.onmousemove = this.doDrag.bind(this);
    this.refs.overlay.onmouseleave = this.stopDragging.bind(this);
  }
  doDrag (event) {
    if (this.props.showDrag) {
      this.resize(event.clientX, event.clientY);
    }
  }
  resize (x, y) {
      const body = document.getElementsByTagName("body")[0];
      this.refs.first.style.width = (x - 4) + 'px';
      this.refs.second.style.width = (body.clientWidth -x - 4) + 'px';
  }
  stopDragging (event) {
    this.resize(event.clientX, event.clientY);
    this.refs.overlay.style.display = 'none';
    this.refs.overlay.onmouseup = undefined;
    this.refs.overlay.onmousemove = undefined;
    this.refs.overlay.onmouseleave = undefined;
  }
  render () {
    return (
      <div className="Panels">
      <div ref="first" className="Panel-First"> {this.props.first} </div>
      <div ref="divisor" className="Panel-Divisor" onMouseDown={this.startDragging.bind(this)}></div>
      <div ref="second" className="Panel-Second"> {this.props.second} </div>
      <div ref="overlay" className="Panel-Overlay"> </div>
      </div>
    )
  }
}
