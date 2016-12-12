import dispatcher from "./Dispatcher"

class Store {
  constructor () {
    this.listeners = {}
    fetch('/resources/')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        this.emit("sync", data);
      }.bind(this))
  }
  emit (event, data) {
    if (event in this.listeners) {
      this.listeners[event].map(action => action(data))
    }
  }
  on (event, action) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(action);
  }
  off (event, action) {
    this.listeners.pop(this.listeners.indexOf(action));
  }
  eventHandler (event) {
    if (event.event == "SHOW_RESOURCE_CONTENTS") {
      this.emit("show", event.data)
    }
  }
}

const resourceStore = new Store();
dispatcher.subscribe(resourceStore.eventHandler.bind(resourceStore))
export default resourceStore;

