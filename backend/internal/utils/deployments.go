package utils

import (
	"cloud-mining-backend/internal/models"
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/utils/pointer"
)

func CreateDeployment(clientset *kubernetes.Clientset, namespace, name string, cfg models.ServerConfig) error {
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:   name,
			Labels: map[string]string{"app": "minecraft", "owner": cfg.Username},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: pointer.Int32(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"server": name},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{"app": "minecraft", "server": name},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Name:  "minecraft",
						Image: "itzg/minecraft-server",
						Env: []corev1.EnvVar{
							{Name: "EULA", Value: "TRUE"},
							{Name: "TYPE", Value: "PAPER"}, // Example: Default to Paper for better performance
							{Name: "VERSION", Value: cfg.Version},
							{Name: "MEMORY", Value: cfg.Memory},
						},
						Ports: []corev1.ContainerPort{{ContainerPort: 25565}},
					}},
				},
			},
		},
	}
	_, err := clientset.AppsV1().Deployments(namespace).Create(context.TODO(), deployment, metav1.CreateOptions{})
	return err
}

func CreateService(clientset *kubernetes.Clientset, namespace, name string) (int32, error) {
	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name: name, // Name the service the same as the deployment for easy association
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{"server": name},
			Ports: []corev1.ServicePort{{
				Protocol:   corev1.ProtocolTCP,
				Port:       25565,                 // The port the service listens on
				TargetPort: intstr.FromInt(25565), // The container port to forward to
			}},
			Type: corev1.ServiceTypeNodePort, // Expose the service outside the cluster (for Minikube)
		},
	}
	createdService, err := clientset.CoreV1().Services(namespace).Create(context.TODO(), service, metav1.CreateOptions{})
	if err != nil {
		return 0, err
	}

	// Kubernetes may assign a random NodePort if not specified; fetch the assigned port
	if len(createdService.Spec.Ports) > 0 {
		return createdService.Spec.Ports[0].NodePort, nil
	}

	return 0, fmt.Errorf("failed to retrieve NodePort for service %s", name)
}

// getKubeClient correctly sets up the Kubernetes client for local or in-cluster execution.
func GetKubeClient() (*kubernetes.Clientset, error) {
	var config *rest.Config
	var err error

	// Check if running in a "local" environment
	if os.Getenv("ENV") == "local" {
		kubeconfig := os.Getenv("KUBECONFIG")
		if kubeconfig == "" {
			home := os.Getenv("HOME")
			kubeconfig = filepath.Join(home, ".kube", "config")
		}
		log.Println("Using local kubeconfig:", kubeconfig)
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, fmt.Errorf("failed to load local kubeconfig: %w", err)
		}
	} else {
		// Assume running inside the Kubernetes cluster
		log.Println("Using in-cluster Kubernetes config")
		config, err = rest.InClusterConfig()
		if err != nil {
			return nil, fmt.Errorf("failed to create in-cluster config: %w", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create Kubernetes client: %w", err)
	}
	return clientset, nil
}
