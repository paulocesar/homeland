package server

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

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseNormalClosure) {
				log.Println("Leaving...")
				break
			}

			log.Println(err)
			break
		}

		log.Printf("Got mesage: %s\n", message)

		if err := conn.WriteMessage(messageType, message); err != nil {
			log.Println("Error on write json")
			conn.Close()
			break
		}
	}
}

// Start starts the server
func Start() error {
	http.HandleFunc("/ws", wsHandler)

	fs := http.FileServer(http.Dir("public"))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	return http.ListenAndServeTLS(":8081", "certs/certificate.pem", "certs/key.pem", nil)
}
