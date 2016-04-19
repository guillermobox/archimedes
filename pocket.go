package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"net/url"
	"strings"
)

const pocket_archimedes_token = "53981-d0b0910cc454d59497e55e93"
const pocket_request = "https://getpocket.com/v3/oauth/request"
const pocket_authorize = "https://getpocket.com/v3/oauth/authorize"
const pocket_redirect = "https://getpocket.com/auth/authorize?request_token=%s&redirect_uri=%s"
const redirect_uri = "http://localhost:8081/pocket/finished"
const pocket_endpoint_get = "https://getpocket.com/v3/get"

var code string
var access_token string

func getpocket(r http.ResponseWriter, req *http.Request) {
	v := url.Values{}
	v.Add("consumer_key", pocket_archimedes_token)
	v.Add("redirect_uri", redirect_uri)

	resp, err := http.PostForm(pocket_request, v)

	if err != nil {
		fmt.Println("Woops, impossible to get token")
		http.NotFound(r, req)
		return
	}

	b := bytes.NewBuffer(nil)
	io.Copy(b, resp.Body)

	response := string(b.Bytes())
	values, _ := url.ParseQuery(response)
	code = values.Get("code")
	http.Redirect(r, req, fmt.Sprintf(pocket_redirect, code, redirect_uri), 302)
	return
}

func getpocketremove(r http.ResponseWriter, req *http.Request) {
	components := strings.Split(req.URL.Path, "/")
	id := components[3]
	jsonreq := fmt.Sprintf(`[{"action":"delete","item_id":"%s"}]`, id)

	reqest := fmt.Sprintf("https://getpocket.com/v3/send?actions=%s&access_token=%s&consumer_key=%s", url.QueryEscape(jsonreq), access_token, pocket_archimedes_token)

	_, err := http.Get(reqest)
	if err != nil {
		fmt.Println("Error", err)
	}
}

func getpocketfinished(r http.ResponseWriter, req *http.Request) {
	v := url.Values{}
	v.Add("consumer_key", pocket_archimedes_token)
	v.Add("code", code)

	resp, _ := http.PostForm(pocket_authorize, v)

	b := bytes.NewBuffer(nil)
	io.Copy(b, resp.Body)

	response := string(b.Bytes())
	values, _ := url.ParseQuery(response)
	access_token = values.Get("access_token")

	v = url.Values{}
	v.Add("consumer_key", pocket_archimedes_token)
	v.Add("access_token", access_token)
	v.Add("count", "10")
	v.Add("sort", "newest")

	resp, _ = http.PostForm(pocket_endpoint_get, v)

	var contents interface{}

	dec := json.NewDecoder(resp.Body)
	dec.Decode(&contents)
	jsonresp := contents.(map[string]interface{})
	if jsonresp["status"].(float64) != 1 {
		fmt.Fprintf(r, "It seems there are no resources in Pocket!")
		return
	}
	items := jsonresp["list"].(map[string]interface{})

	resource_template := `
	<li class="collection-item avatar" style="cursor:pointer;">
	<form>
	<i data-role="PocketGet" class="material-icons circle" style="font-size:28px;">cloud_queue</i>
	<span class="title">{{.Title}}</span>
	<p><a target="_blank" style="color:black;" href="{{.URL}}">{{.URL}}</a>
	<div class="row valign-wrapper" style="margin-bottom:0px;">
	<div class="col s6 valign">
	<input placeholder="Folder to store the resource" type="text" name="Folder">
	</div>
	<div class="col s6 valign">
	<input id="Download-{{.ID}}" type="checkbox" name="Download" checked="checked" value="on">
	<label for="Download-{{.ID}}">Download inmediately</label>
	</div>
	</div>
	</p>
	<input type="hidden" name="Retrieve" value="true">
	<input type="hidden" name="URL" value="{{.URL}}">
	<input type="hidden" name="ID" value="{{.ID}}">
	</form>
	</li>
	`
	temp, _ := template.New("resource").Parse(resource_template)

	fmt.Fprintf(r, `
	<!DOCTYPE html>
	<html>
	<head>
	<meta charset="utf-8">
	<link type="text/css" rel="stylesheet" href="/css/materialize.min.css">
	<link type="text/css" rel="stylesheet" href="/css/archimedes.css">
	<script type="text/javascript" src="/js/jquery-2.2.3.min.js"></script>
	<style>
	body {
		background: #fafafa;
	}
	.collection-item > i.material-icons {
		content: "cloud_queue";
	}
	.collection-item.inactive > i.material-icons {
		content: "cloud_off";
	}
	.collection-item.inactive {
		opacity: 0.4;
	}
	</style>
	<script>
	$(document).ready(function (){
		$(".collection-item").on("click", "[data-role=PocketGet]", function(ev){
			var button = $(ev.target);
			if (button.html() == 'cloud_queue') {
				$(ev.target).html("cloud_off");
			} else {
				$(ev.target).html('cloud_queue');
			}
			$(ev.delegateTarget).toggleClass("inactive");
			var retrieve = $('[name=Retrieve]', $(ev.delegateTarget));
			if (retrieve.val() == "true")
			retrieve.val("false");
			else
			retrieve.val("true");
			$(':input', $(ev.delegateTarget)).prop('disabled', function (i,v) {return !v;});
		});
	});
	</script>
	</head>
	<body>
	<ul class="collection">
	`)

	for key := range items {
		entry := items[key].(map[string]interface{})
		title := entry["given_title"].(string)
		if len(title) == 0 {
			title = "Untitled"
		}
		data := struct {
			URL   string
			Title string
			ID    string
		}{
			URL:   entry["given_url"].(string),
			Title: title,
			ID:    key,
		}
		temp.Execute(r, data)
	}
	fmt.Fprintf(r, "</ul></body></html>")
	return
}
