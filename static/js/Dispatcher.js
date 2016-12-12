class Dispatcher {
	constructor () {
		this.subscriptions = []
	}
	subscribe (func) {
		this.subscriptions.push(func)
	}
	publish (payload) {
		this.subscriptions.map(function (func) {
			func(payload);
		});
	}
}

let dispatcher = new Dispatcher();

export default dispatcher;
