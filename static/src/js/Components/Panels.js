import React from "react";
import ReactDOM from "react-dom";

export default class Panels extends React.Component {
  startDragging (event) {
    this.dom = ReactDOM.findDOMNode(this)
    this.overlay = this.dom.getElementsByClassName('Panel-Overlay')[0];
    this.overlay.style.display = 'block';
    this.overlay.onmouseup = this.stopDragging.bind(this);
    this.overlay.onmousemove = this.doDrag.bind(this);
    this.overlay.onmouseleave = this.stopDragging.bind(this);
  }
  doDrag (event) {
    if (this.props.showDrag) {
      this.resize(event.clientX, event.clientY);
    }
  }
  resize (x, y) {
      const body = document.getElementsByTagName("body")[0];
      const newRatio = 100 * (x) / (body.clientWidth);
      this.dom.getElementsByClassName('Panel-First')[0].style.width = 'calc(' + newRatio + "% - 4px)";
      this.dom.getElementsByClassName('Panel-Second')[0].style.width = 'calc(' + (100 - newRatio) + "% - 4px)";
  }
  stopDragging (event) {
    this.resize(event.clientX, event.clientY);
    this.overlay.style.display = 'none';
    this.overlay.onmouseup = undefined;
    this.overlay.onmousemove = undefined;
    this.overlay.onmouseleave = undefined;
  }
  render () {
    return (
      <div className="Panels">
      <div className="Panel-First"> {this.props.first} </div>
      <div className="Panel-Divisor" onMouseDown={this.startDragging.bind(this)}></div>
      <div className="Panel-Second"> {this.props.second} </div>
      <div className="Panel-Overlay"> </div>
      </div>
    )
  }
}
