# Archimedes

![That's him!](static/images/archimedes_head.png)

## Introduction

Archimedes is a tool to manage offline copies of web sites or other documents
found online.

From the application interface, you can add a new resource using the URL, and
archimedes will download it. Resources are classified in folders, and can
be favorited/archived. Once a resource is downloaded, it can be seen in a small
preview window, or in a full tab in the browser.

The resources can be web sites, pdfs or images. New resource handlers
can be installed to process other sources, like videos from youtube, podcasts,
or any other online content that you want archimedes to download and present to
you.

## Usage

Just compile and run the go package:

    $ go get github.com/guillermobox/archimedes
    $ go install github.com/guillermobox/archimedes
    $ archimedes

In order for this to work, you need a well configured GOROOT, GOPATH, and PATH
environment variables. See [here](https://golang.org/doc/install).

After launching archimedes, navigate to [http://localhost:8081/](), and you will be
presented with the application.

## Configuration

The global configuration file is located at `/etc/archimedes.cfg`. After reading
that file, the configuration in `$HOME/.config/archimedes.cfg` is read. Both can
be used to define several paths and options. After changing any file, remember
to restart the server launching `archimedes` again. Not many things can be
configured as of now.

The resources open by archimedes, and the database is found by default in
`~/.archimedes/`, change it by adding to a configuration file:

    [Global]
    Path = NEWFOLDER


