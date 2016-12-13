import React from "react";

export default class Panels extends React.Component {
  startDragging (event) {
    document.onmouseup = this.stopDragging.bind(this);
    document.onmousemove = this.doDrag.bind(this);
  }
  doDrag (event) {
    const body = document.getElementsByTagName("body")[0];
    const newRatio = 100 * (event.clientX) / (body.clientWidth);
    document.getElementById('firstpanel').style.width = 'calc(' + newRatio + "% - 4px)";
    document.getElementById('secondpanel').style.width = 'calc(' + (100 - newRatio) + "% - 4px)";
  }
  stopDragging (event) {
    document.onmouseup = undefined;
    document.onmousemove = undefined;
  }
  render () {
    return (
      <div className="Panels">
      <div className="Panel-First" id="firstpanel"> {this.props.first} </div>
      <div className="Panel-Divisor" onMouseDown={this.startDragging.bind(this)}></div>
      <div className="Panel-Second" id="secondpanel"> {this.props.second} </div>
      </div>
    )
  }
}
