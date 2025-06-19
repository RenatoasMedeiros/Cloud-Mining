package main

import (
	"cloud-mining-backend/internal/handlers"
	"cloud-mining-backend/internal/utils"
	"log"
	"net/http"
	"os"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400") // Cache preflight requests for 24 hours

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	clientset, _, err := utils.GetKubeClient()
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

	// Create a new ServeMux to apply middleware
	mux := http.NewServeMux()

	// Using a more RESTful routing pattern
	mux.HandleFunc("/servers", handlers.ServersHandler(clientset, namespace))
	mux.HandleFunc("/servers/", handlers.ServerHandler(clientset, namespace)) // Note the trailing slash

	// Wrap the mux with the CORS middleware
	handler := corsMiddleware(mux)

	log.Printf("Server running on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
