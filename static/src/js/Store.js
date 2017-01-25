import dispatcher from "./Dispatcher"
import * as Actions from '../Actions';

class Store {
  constructor () {
    this.listeners = {}
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
}

class RESTStore extends Store {
  constructor (url) {
    super()
    this.url = url
    this.data = []
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
  getState () {
    return this.data
  }
}

class resourceStore extends Store {

}

class Store {
  constructor (url, name) {
    this.name = name
    this.eventHandler = this.eventHandler.bind(this)
    this.readCollection()
  }
  eventHandler (event) {
    if (event.event == "CREATE" && event.name == this.name) {
      this.createObject(event.data)
    }
  }
}

const resourceStore = new Store('/resources/', 'RESOURCE');
const jobStore = new Store('/actions/', 'JOB');

dispatcher.subscribe(resourceStore.eventHandler)
dispatcher.subscribe(jobStore.eventHandler)

export resourceStore, jobStore;

