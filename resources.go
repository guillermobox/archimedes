package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"mime"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"path"
	"strings"
	"syscall"
	"time"
)

type Resource struct {
	ID           int
	Title        string
	URL          string
	LocalURL     string
	Kind         string
	Folder       string
	Downloaded   bool
	Downloading  bool
	Favorited    bool
	Archived     bool
	ErrorMsg     string
	DiskUsage    int
	CreationTime int
	DownloadTime int
}

func resourceLoad(response http.ResponseWriter, request *http.Request) {
	db := ConnectDatabase()
	defer db.Close()

	var resource Resource
	var id int

	vars := mux.Vars(request)
	fmt.Sscanf(vars["id"], "%d", &id)
	db.Find(&resource, id)
	if resource.ID == 0 {
		response.WriteHeader(404)
		return
	}
	json.NewEncoder(response).Encode(resource)
	return
}

func resourceUpdate(response http.ResponseWriter, request *http.Request) {
	db := ConnectDatabase()
	defer db.Close()

	var res Resource
	dec := json.NewDecoder(request.Body)
	dec.Decode(&res)
	db.Save(&res)
	e := json.NewEncoder(response)
	e.Encode(res)
	return
}

func resourceCreate(response http.ResponseWriter, request *http.Request) {
	db := ConnectDatabase()
	defer db.Close()

	var res Resource
	dec := json.NewDecoder(request.Body)
	dec.Decode(&res)
	mimetype := []string{mime.TypeByExtension(path.Ext(res.URL))}
	if strings.HasPrefix(mimetype[0], "image/") {
		res.Kind = "image"
	} else if strings.HasPrefix(mimetype[0], "application/pdf") {
		res.Kind = "pdf"
	} else if strings.Contains(res.URL, "www.youtube.com") {
		res.Kind = "video"
	} else {
		res.Kind = "web"
	}
	res.CreationTime = int(time.Now().Unix())
	db.Save(&res)

	e := json.NewEncoder(response)
	e.Encode(res)
	return
}

func resourceQuery(response http.ResponseWriter, request *http.Request) {
	db := ConnectDatabase()
	defer db.Close()

	var resources []Resource
	db.Find(&resources)
	e := json.NewEncoder(response)
	e.Encode(resources)
	return
}

func resourceDelete(response http.ResponseWriter, request *http.Request) {
	db := ConnectDatabase()
	defer db.Close()

	var id int
	var res Resource

	vars := mux.Vars(request)
	fmt.Sscanf(vars["id"], "%d", &id)

	res.ID = id
	db.Delete(&res)

	directory := ExpandHome(path.Join(globalconfig.Global.Path, "Resources", fmt.Sprintf("%d", id)))
	pathscreen := ExpandHome(path.Join(globalconfig.Global.Path, "Screenshots", fmt.Sprintf("%d.png", id)))
	os.RemoveAll(directory)
	os.Remove(pathscreen)

	response.WriteHeader(200)
	return
}

func DownloadResource(res Resource) {
	db := ConnectDatabase()
	defer db.Close()
	url, _ := url.Parse(res.URL)
	res.Downloading = true
	db.Save(&res)

	if res.Kind == "video" {
		res.LocalURL = fmt.Sprintf("/content/%d/%s.mp4", res.ID, url.RawQuery)
	} else {
		res.LocalURL = fmt.Sprintf("/content/%d/%s%s", res.ID, url.Host, url.Path)
	}
	com := exec.Command("wget", "--page-requisites", "--span-hosts", "--convert-links", url.Host+url.Path)

	directory := ExpandHome(path.Join(globalconfig.Global.Path, "Resources", fmt.Sprintf("%d", res.ID)))
	os.MkdirAll(directory, 0777)
	if res.Kind == "video" {
		com = exec.Command("youtube-dl", "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio", "--merge-output-format", "mp4", "--output", url.RawQuery, url.Host + url.Path + "?" + url.RawQuery)
	}
	com.Dir = directory
	cmderr := com.Run()
	var disk int = 0
	if cmderr != nil {
		errorcode := *cmderr.(*exec.ExitError)
		status, _ := errorcode.Sys().(syscall.WaitStatus)
		if status.ExitStatus() < 8 {
			var wget_error_msg []string = []string{"", "Generic error code", "Parse error", "File I/O error", "Network failure", "SSL Verification failure", "Username/password authentication failure", "Protocol error"}
			res.ErrorMsg = fmt.Sprintf("Error downloading: %d (%s)", status.ExitStatus(), wget_error_msg[status.ExitStatus()])
			res.Downloading = false
			res.Downloaded = false
			db.Save(&res)
			return
		}
	}
	if res.Kind == "web" {
		com = exec.Command("phantomjs", "phantom-get-title.js", res.URL)
		output, _ := com.Output()
		res.Title = string(output)
		pathscreen := ExpandHome(path.Join(globalconfig.Global.Path, "Screenshots"))
		outputscreen := path.Join(pathscreen, fmt.Sprintf("%d.png", res.ID))
		os.MkdirAll(pathscreen, 0777)
		com = exec.Command("phantomjs", "phantom-get-render.js", res.URL, outputscreen)
		com.Run()
		com = exec.Command("du", "-b", "-s", outputscreen)
		output, _ = com.Output()
		fmt.Sscan(string(output), &disk)
		res.DiskUsage += disk
	} else if res.Kind == "video" {
		com = exec.Command("youtube-dl", "--get-title", url.Host + url.Path + "?" + url.RawQuery)
		output, _ := com.Output()
		res.Title = string(output)
	}
	res.DiskUsage = 0
	com = exec.Command("du", "-b", "-s", directory)
	output, _ := com.Output()
	fmt.Sscan(string(output), &disk)
	res.DiskUsage += disk
	res.DownloadTime = int(time.Now().Unix())
	res.Downloaded = true
	res.Downloading = false
	res.ErrorMsg = ""
	db.Save(&res)
}
