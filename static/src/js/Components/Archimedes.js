import React from "react"
import Navigation from "./Navigation"
import ResourceList from "./ResourceList"
import ResourceContents from "./ResourceContents"
import Panels from "./Panels"

export default class Archimedes extends React.Component {
  render() {
    return (
      <div>
      <Navigation />
      <Panels showDrag={true} first={<ResourceList />} second={<ResourceContents />} />
      </div>
    );
  }
}

