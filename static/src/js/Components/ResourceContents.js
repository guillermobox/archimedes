import React from "react"

import resourceStore from "../Store"

export default class ResourceContents extends React.Component {
	constructor() {
		super();
		this.state = {}
	}
	updateContents(data) {
		this.setState(data);
	}
	componentWillMount() {
		resourceStore.on("show", this.updateContents.bind(this))
	}
	render () {
		return (
		<div id="ResourceContents">
			<iframe src={this.state.LocalURL}>
			</iframe>
		</div>);
	}
}

