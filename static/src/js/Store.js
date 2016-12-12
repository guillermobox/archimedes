import dispatcher from "./Dispatcher"

class Store {
  constructor () {
    this.listeners = {}
    setTimeout(()=>
    this.emit("sync", [
      {ID:1,Title:"Lodash website", LocalURL:"test/lodash.com/index.html"},
      {ID:2,Title:"Rail Freight transport - Wikipedia", LocalURL:"test/en.wikipedia.org/wiki/Rail_freight_transport"},
    ]), 1000);
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

