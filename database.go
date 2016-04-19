package main

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"log"
	"os"
	"path"
)

func ConnectDatabase() (db *gorm.DB) {
	sqlfile := ExpandHome(path.Join(globalconfig.Global.Path, "archimedes.sqlite3"))

	err := os.MkdirAll(path.Dir(sqlfile), 0777)
	if err != nil {
		log.Fatal(err)
	}

	db, err = gorm.Open("sqlite3", sqlfile)
	if err != nil {
		log.Fatal(err)
	}

	db.AutoMigrate(&Resource{})

	return
}
