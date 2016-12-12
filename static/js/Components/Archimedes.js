import React from "react"
import Navigation from "./Navigation.js"
import ResourceList from "./ResourceList.js"
import ResourceContents from "./ResourceContents.js"

export default class Archimedes extends React.Component {
	render() {
		return (
			<div>
				<Navigation />
				<ResourceList />
				<ResourceContents />
			</div>
		);
	}
}

