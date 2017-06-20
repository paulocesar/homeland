package main

import (
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
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading json")
			break
		}

		log.Printf("Got mesage: %s\n", message)

		if err := conn.WriteMessage(messageType, message); err != nil {
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
