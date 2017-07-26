package main

import (
	"log"

	"github.com/paulocesar/homeland/server"
)

func main() {
	if err := server.Start(); err != nil {
		log.Println(err)
	}
}
