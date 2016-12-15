import dispatcher from "./Dispatcher"

class Store {
  constructor (url) {
    this.listeners = {}
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        this.data = data;
        this.emit("sync", this.data);
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
    if (event in this.listeners) {
      const i = this.listeners[event].indexOf(action);
      if (i >= 0) {
        this.listeners[event].pop(i);
      }
    }
  }
  eventHandler (event) {
    if (event.event == "SHOW_RESOURCE_CONTENTS") {
      this.emit("show", event.data)
    } else if (event.event == "TOGGLE_FAVORITE") {
      const pos = this.data.findIndex(obj => obj.ID == event.data.ID)
      if (pos != -1) {
        this.data[pos] = event.data;
        this.data[pos]['Favorited'] = ! this.data[pos]['Favorited'];
        this.emit("sync", this.data);
      }
    }
  }
}

const resourceStore = new Store('/resources/');
dispatcher.subscribe(resourceStore.eventHandler.bind(resourceStore))
export default resourceStore;

