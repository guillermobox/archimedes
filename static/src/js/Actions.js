import dispatcher from "./Dispatcher";

export function createResource(data) {
  dispatcher.publish({
    event: 'CREATE',
    name: 'RESOURCE',
    data
  });
}

export function createJob(data) {
  dispatcher.publish({
    event: 'CREATE',
    name: 'JOB',
    data
  });
}
