package main

import (
	"encoding/json"
	"net/http"
)

type Action struct {
	ID     int
	Target int
	Type   string
}

func actionCreate(r http.ResponseWriter, req *http.Request) {
	db := ConnectDatabase()
	defer db.Close()
	var action Action
	dec := json.NewDecoder(req.Body)
	dec.Decode(&action)
	if action.Type == "Download" {
		var resource Resource
		db.Find(&resource, action.Target)
		go DownloadResource(resource)
	}
}
