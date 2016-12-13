import React from "react";

export default class Panels extends React.Component {
  startDragging (event) {
    this.overlay = document.getElementById('overlaypanel');
    this.overlay.style.display = 'block';
    this.overlay.onmouseup = this.stopDragging.bind(this);
    this.overlay.onmousemove = this.doDrag.bind(this);
    this.overlay.onmouseleave = this.stopDragging.bind(this);
  }
  doDrag (event) {
    console.log('drag');
    const body = document.getElementsByTagName("body")[0];
    const newRatio = 100 * (event.clientX) / (body.clientWidth);
    document.getElementById('firstpanel').style.width = 'calc(' + newRatio + "% - 4px)";
    document.getElementById('secondpanel').style.width = 'calc(' + (100 - newRatio) + "% - 4px)";
  }
  stopDragging (event) {
    this.overlay.style.display = 'none';
    this.overlay.onmouseup = undefined;
    this.overlay.onmousemove = undefined;
    this.overlay.onmouseleave = undefined;
  }
  render () {
    return (
      <div className="Panels">
      <div className="Panel-First" id="firstpanel"> {this.props.first} </div>
      <div className="Panel-Divisor" onMouseDown={this.startDragging.bind(this)}></div>
      <div className="Panel-Second" id="secondpanel"> {this.props.second} </div>
      <div className="Panel-Overlay" id="overlaypanel"> </div>
      </div>
    )
  }
}
