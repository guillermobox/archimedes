import dispatcher from "./Dispatcher"

class Store {
  constructor (url) {
    this.listeners = {}
    this.url = url
    this.eventHandler = this.eventHandler.bind()
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
    if (event in this.listeners) {
      const i = this.listeners[event].indexOf(action);
      if (i >= 0) {
        this.listeners[event].pop(i);
      }
    }
  }
  readCollection () {
    fetch(this.url)
    .then(response => response.json())
    .then(data => {
      this.data = data;
      this.emit("sync", this.data);
    })
  }
  createObject (data) {
    const options = {method: 'post', body: JSON.stringify(data)};
    fetch(this.url, options)
    .then(response => response.json())
    .then(data => {
      this.data.unshift(data);
      this.emit("sync", this.data);
    })
  }
  eventHandler (event) {
    if (event.event == "SHOW_RESOURCE_CONTENTS") {
      this.emit("show", event.data)
    } else if (event.event == "CREATE_RESOURCE") {
      this.createObject(event.data)
    }
  }
}

const resourceStore = new Store('/resources/');

dispatcher.subscribe(resourceStore.eventHandler)

export default resourceStore;

