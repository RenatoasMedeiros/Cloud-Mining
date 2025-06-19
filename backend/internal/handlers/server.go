package handlers

import (
	"cloud-mining-backend/internal/models"
	"cloud-mining-backend/internal/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// serversHandler handles requests for the collection of servers (/servers)
func ServersHandler(clientset *kubernetes.Clientset, namespace string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// List Deployments instead of pods for a more accurate representation of servers
			deployments, err := clientset.AppsV1().Deployments(namespace).List(context.Background(), metav1.ListOptions{
				LabelSelector: "app=minecraft",
			})
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			var serverNames []string
			for _, d := range deployments.Items {
				serverNames = append(serverNames, d.Name)
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"servers": serverNames})

		case http.MethodPost:
			var cfg models.ServerConfig
			if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
				http.Error(w, "invalid request body", http.StatusBadRequest)
				return
			}
			// Basic validation
			if cfg.Username == "" {
				http.Error(w, "username field is required", http.StatusBadRequest)
				return
			}

			// Sanitize username to be a valid DNS-1123 label
			name := fmt.Sprintf("mc-%s", strings.ToLower(cfg.Username))

			// Create the Deployment
			if err := utils.CreateDeployment(clientset, namespace, name, cfg); err != nil {
				// Check if the deployment already exists
				if errors.IsAlreadyExists(err) {
					http.Error(w, fmt.Sprintf("server '%s' already exists", name), http.StatusConflict)
				} else {
					http.Error(w, fmt.Sprintf("deployment error: %v", err), http.StatusInternalServerError)
				}
				return
			}

			// Create the Service to expose the Deployment
			if err := utils.CreateService(clientset, namespace, name); err != nil {
				http.Error(w, fmt.Sprintf("service error: %v", err), http.StatusInternalServerError)
				// Here you might want to clean up the deployment if service creation fails
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(map[string]string{"status": "created", "server": name})

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

// serverHandler handles requests for a specific server (e.g., /servers/mc-john)
func ServerHandler(clientset *kubernetes.Clientset, namespace string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract server name from URL path, e.g., "/servers/mc-john" -> "mc-john"
		name := strings.TrimPrefix(r.URL.Path, "/servers/")
		if name == "" {
			http.Error(w, "server name is required", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodDelete:
			// Delete Deployment
			err := clientset.AppsV1().Deployments(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
			if err != nil && !errors.IsNotFound(err) {
				http.Error(w, fmt.Sprintf("failed to delete deployment: %v", err), http.StatusInternalServerError)
				return
			}

			// Delete Service
			err = clientset.CoreV1().Services(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
			if err != nil && !errors.IsNotFound(err) {
				http.Error(w, fmt.Sprintf("failed to delete service: %v", err), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{"status": "deleted", "server": name})

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
