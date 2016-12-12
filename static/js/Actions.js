import dispatcher from "./Dispatcher";

export function showResource(data) {
  dispatcher.publish({
    event: "SHOW_RESOURCE_CONTENTS",
    data
  });
}

export function toggleFavorite(data) {
  dispatcher.publish({
    event: "TOGGLE_FAVORITE",
    data
  });
}
