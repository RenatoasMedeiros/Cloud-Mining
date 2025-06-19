package handlers

import (
	"cloud-mining-backend/internal/models"
	"cloud-mining-backend/internal/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
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
			deployments, err := clientset.AppsV1().Deployments(namespace).List(context.Background(), metav1.ListOptions{
				LabelSelector: "app=minecraft",
			})
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			var servers []models.ServerDTO
			for _, d := range deployments.Items {
				status := "offline"
				if d.Status.AvailableReplicas > 0 {
					status = "online"
				}

				version := ""
				memory := ""
				port := ""

				if len(d.Spec.Template.Spec.Containers) > 0 {
					container := d.Spec.Template.Spec.Containers[0]
					for _, envVar := range container.Env {
						switch envVar.Name {
						case "VERSION":
							version = envVar.Value
						case "MEMORY":
							memory = envVar.Value
						}
					}
					if len(container.Ports) > 0 {
						port = fmt.Sprintf("%d", container.Ports[0].ContainerPort)
					}
				}

				// Optionally, get NodePort from Service (if exists)
				svc, err := clientset.CoreV1().Services(namespace).Get(context.TODO(), d.Name, metav1.GetOptions{})
				if err == nil && len(svc.Spec.Ports) > 0 {
					port = fmt.Sprintf("%d", svc.Spec.Ports[0].NodePort)
				}

				servers = append(servers, models.ServerDTO{
					Name:    d.Name,
					Version: version,
					Memory:  memory,
					Status:  status,
					Port:    port,
				})
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"servers": servers})

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
			pvcName := "pvc-" + name

			// 1. Create the PVC
			if err := utils.CreatePVC(clientset, namespace, pvcName, cfg); err != nil {
				http.Error(w, fmt.Sprintf("pvc error: %v", err), http.StatusInternalServerError)
				return
			}

			// 2. Create the Deployment
			if err := utils.CreateDeployment(clientset, namespace, name, cfg); err != nil {
				if errors.IsAlreadyExists(err) {
					http.Error(w, fmt.Sprintf("server '%s' already exists", name), http.StatusConflict)
				} else {
					// Rollback PVC
					_ = clientset.CoreV1().PersistentVolumeClaims(namespace).Delete(context.TODO(), pvcName, metav1.DeleteOptions{})
					http.Error(w, fmt.Sprintf("deployment error: %v", err), http.StatusInternalServerError)
				}
				return
			}

			// 3. Create the Service to expose the Deployment
			nodePort, err := utils.CreateService(clientset, namespace, name)
			if err != nil {
				// Cleanup Deployment and PVC
				_ = clientset.AppsV1().Deployments(namespace).Delete(context.TODO(), name, metav1.DeleteOptions{})
				_ = clientset.CoreV1().PersistentVolumeClaims(namespace).Delete(context.TODO(), pvcName, metav1.DeleteOptions{})
				http.Error(w, fmt.Sprintf("service error: %v", err), http.StatusInternalServerError)
				return
			}

			// 4. Build and return the response DTO
			serverDTO := models.ServerDTO{
				Name:    name,
				Version: cfg.Version,
				Memory:  cfg.Memory,
				Status:  "online",
				Port:    strconv.FormatInt(int64(nodePort), 10),
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(serverDTO)

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

		case http.MethodGet:
			deployment, err := clientset.AppsV1().Deployments(namespace).Get(context.TODO(), name, metav1.GetOptions{})
			if err != nil {
				if errors.IsNotFound(err) {
					w.WriteHeader(http.StatusNotFound)
					json.NewEncoder(w).Encode(models.ServerDTO{
						Name:   name,
						Status: "offline",
					})
					return
				}
				http.Error(w, fmt.Sprintf("failed to get deployment: %v", err), http.StatusInternalServerError)
				return
			}

			status := "offline"
			if deployment.Status.AvailableReplicas > 0 {
				status = "online"
			}

			version := ""
			memory := ""
			nodePort := ""

			if len(deployment.Spec.Template.Spec.Containers) > 0 {
				container := deployment.Spec.Template.Spec.Containers[0]

				for _, envVar := range container.Env {
					switch envVar.Name {
					case "VERSION":
						version = envVar.Value
					case "MEMORY":
						memory = envVar.Value
					}
				}
			}

			// Assuming your Service is named same as deployment or known:
			svc, err := clientset.CoreV1().Services(namespace).Get(context.TODO(), name, metav1.GetOptions{})
			if err == nil {
				// Find the nodePort for the first port
				if len(svc.Spec.Ports) > 0 {
					nodePort = fmt.Sprintf("%d", svc.Spec.Ports[0].NodePort)
				}
			} else {
				// Could not find service - maybe log or ignore
				fmt.Printf("Service %s not found: %v\n", name, err)
			}

			response := models.ServerDTO{
				Name:    name,
				Version: version,
				Memory:  memory,
				Status:  status,
				Port:    nodePort,
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(response)

		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
