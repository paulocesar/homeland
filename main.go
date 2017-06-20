package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type gameAction struct {
	c int
	p string
	t int
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	for {
		act := gameAction{}
		err := conn.ReadJSON(&act)
		if err != nil {
			log.Println("Error reading json")
			break
		}

		fmt.Printf("Got message: %#v\n", act)

		if err := conn.WriteJSON(act); err != nil {
			log.Println("Error on write json")
			break
		}
		/*
			messageType, r, err := conn.NextReader()
			if err != nil {
				return
			}

			w, err := conn.NextWriter(messageType)
			if err != nil {
				return
			}

			if _, err := io.Copy(w, r); err != nil {
				log.Println(err)
			}

			if err := w.Close(); err != nil {
				log.Println(err)
			}
		*/
	}
}

func main() {
	http.HandleFunc("/ws", wsHandler)

	fs := http.FileServer(http.Dir("public"))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	err := http.ListenAndServeTLS(":8081", "certs/certificate.pem", "certs/key.pem", nil)
	if err != nil {
		log.Println(err)
	}
}
