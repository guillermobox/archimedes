package main

import (
	"github.com/gorilla/mux"
	"gopkg.in/gcfg.v1"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

type Configuration struct {
	Global struct {
		Path string
	}
}

func ExpandHome(s string) string {
	if strings.HasPrefix(s, "~") {
		return path.Join(os.Getenv("HOME"), s[2:])
	}
	return s
}

var globalconfig Configuration

var defaultconfiguration string = `
[Global]
Path = ~/.archimedes
`

func main() {
	gcfg.ReadStringInto(&globalconfig, defaultconfiguration)

	globalpath := path.Join("/", "etc", "archimedes.cfg")
	localpath := path.Join(os.Getenv("HOME"), ".config", "archimedes.cfg")

	gcfg.ReadFileInto(&globalconfig, globalpath)
	gcfg.ReadFileInto(&globalconfig, localpath)

	http.Handle("/", http.FileServer(http.Dir("static/")))
	http.Handle("/content/", http.StripPrefix("/content", http.FileServer(http.Dir(ExpandHome(path.Join(globalconfig.Global.Path, "Resources"))))))
	http.Handle("/screenshot/", http.StripPrefix("/screenshot", http.FileServer(http.Dir(ExpandHome(path.Join(globalconfig.Global.Path, "Screenshots"))))))

	http.HandleFunc("/pocket/", getpocket)
	http.HandleFunc("/pocket/finished/", getpocketfinished)
	http.HandleFunc("/pocket/remove/", getpocketremove)

	resmux := mux.NewRouter()
	resmux.HandleFunc("/resources/{id:[0-9]+}", resourceDelete).Methods("DELETE")
	resmux.HandleFunc("/resources/{id:[0-9]+}", resourceLoad).Methods("GET")
	resmux.HandleFunc("/resources/{id:[0-9]+}", resourceUpdate).Methods("PUT")
	resmux.HandleFunc("/resources/", resourceCreate).Methods("POST")
	resmux.HandleFunc("/resources/", resourceQuery).Methods("GET")
	http.Handle("/resources/", resmux)

	actmux := mux.NewRouter()
	actmux.HandleFunc("/actions/", actionCreate).Methods("POST")
	http.Handle("/actions/", actmux)

	log.Fatal(http.ListenAndServe(":8081", nil))
}
