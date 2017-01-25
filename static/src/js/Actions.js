import dispatcher from "./Dispatcher";

export function createResource(data) {
  dispatcher.publish({
    event: 'CREATE',
    what: 'RESOURCE',
    data
  });
}

export function createJob(data) {
  dispatcher.publish({
    event: 'CREATE',
    what: 'JOB',
    data
  });
}
