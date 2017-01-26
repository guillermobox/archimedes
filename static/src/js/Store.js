import dispatcher from "./Dispatcher"
import * as Actions from './Actions';

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
  constructor (url, name) {
    super()
    this.name = name
    this.url = url
    this.data = []
    this.readCollection()
    this.eventHandler = this.eventHandler.bind(this)
    setInterval(this.readCollection.bind(this), 3000);
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
        this.emit("create", data);
      })
  }
  getState () {
    return this.data
  }
  eventHandler (event) {
    if (event.event == "CREATE" && event.name == this.name) {
      this.createObject(event.data)
    }
  }
}

export const resourceStore = new RESTStore('/resources/', 'RESOURCE');
export const jobStore = new RESTStore('/actions/', 'JOB');

dispatcher.subscribe(resourceStore.eventHandler)
dispatcher.subscribe(jobStore.eventHandler)

