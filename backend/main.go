package main

import (
	"cloud-mining-backend/internal/handlers"
	"cloud-mining-backend/internal/utils"
	"log"
	"net/http"
	"os"
)

func main() {
	clientset, err := utils.GetKubeClient()
	if err != nil {
		log.Fatalf("Kubernetes setup failed: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	namespace := os.Getenv("KUBE_NAMESPACE")
	if namespace == "" {
		namespace = "default"
	}

	// Using a more RESTful routing pattern
	http.HandleFunc("/servers", handlers.ServersHandler(clientset, namespace))
	http.HandleFunc("/servers/", handlers.ServerHandler(clientset, namespace)) // Note the trailing slash

	log.Printf("Server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
