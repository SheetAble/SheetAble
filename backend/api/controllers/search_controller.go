package controllers

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func (server *Server) Search(w http.ResponseWriter, r *http.Request) {

	vars := mux.Vars(r)
	searchValue := vars["searchValue"]
	fmt.Println(searchValue)
}
