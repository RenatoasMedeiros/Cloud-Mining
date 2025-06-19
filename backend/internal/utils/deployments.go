package utils

import (
	"cloud-mining-backend/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/utils/pointer"
)

func CreateDeployment(clientset *kubernetes.Clientset, namespace, name string, cfg models.ServerConfig) error {
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
			Labels: map[string]string{
				"app":   "minecraft",
				"owner": cfg.Username,
			},
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: pointer.Int32(1),
			Selector: &metav1.LabelSelector{
				MatchLabels: map[string]string{"server": name},
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: map[string]string{
						"app":    "minecraft",
						"server": name,
					},
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{{
						Name:  "minecraft",
						Image: "itzg/minecraft-server",
						Env: []corev1.EnvVar{
							{Name: "EULA", Value: "TRUE"},
							{Name: "TYPE", Value: "PAPER"}, // Default server type
							{Name: "VERSION", Value: cfg.Version},
							{Name: "MEMORY", Value: cfg.Memory},
    						{Name: "ONLINE_MODE", Value: "FALSE"}, // Allow cracked clients
						},
						Ports: []corev1.ContainerPort{{
							ContainerPort: 25565,
							Name:          "minecraft-port",
						}},
						VolumeMounts: []corev1.VolumeMount{{
							Name:      "minecraft-world",
							MountPath: "/data", // Where the world will be stored
						}},
					}},
					Volumes: []corev1.Volume{{
						Name: "minecraft-world",
						VolumeSource: corev1.VolumeSource{
							PersistentVolumeClaim: &corev1.PersistentVolumeClaimVolumeSource{
								ClaimName: "pvc-" + name,
							},
						},
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
			Name:      name,
			Namespace: namespace, // Required!
			Labels: map[string]string{
				"app":    "minecraft",
				"server": name,
			},
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"server": name,
			},
			Ports: []corev1.ServicePort{{
				Name:       "minecraft",
				Protocol:   corev1.ProtocolTCP,
				Port:       25565,
				TargetPort: intstr.FromInt(25565),
			}},
			Type: corev1.ServiceTypeNodePort,
		},
	}

	createdService, err := clientset.CoreV1().Services(namespace).Create(context.TODO(), service, metav1.CreateOptions{})
	if err != nil {
		return 0, err
	}

	if len(createdService.Spec.Ports) > 0 && createdService.Spec.Ports[0].NodePort > 0 {
		return createdService.Spec.Ports[0].NodePort, nil
	}

	return 0, fmt.Errorf("failed to retrieve NodePort for service %s", name)
}

// getKubeClient correctly sets up the Kubernetes client for local or in-cluster execution.
func GetKubeClient() (*kubernetes.Clientset, *rest.Config, error) {
	var config *rest.Config
	var err error

	if os.Getenv("ENV") == "local" {
		kubeconfig := os.Getenv("KUBECONFIG")
		if kubeconfig == "" {
			home := os.Getenv("HOME")
			kubeconfig = filepath.Join(home, ".kube", "config")
		}
		log.Println("Using local kubeconfig:", kubeconfig)
		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to load local kubeconfig: %w", err)
		}
	} else {
		log.Println("Using in-cluster Kubernetes config")
		config, err = rest.InClusterConfig()
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create in-cluster config: %w", err)
		}
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create Kubernetes client: %w", err)
	}
	return clientset, config, nil
}

func CreateIngressRouteTCP(dynamicClient dynamic.Interface, namespace, name, domain string) error {
	ingressRoute := map[string]interface{}{
		"apiVersion": "traefik.containo.us/v1alpha1",
		"kind":       "IngressRouteTCP",
		"metadata": map[string]interface{}{
			"name":      name,
			"namespace": namespace,
			"labels": map[string]string{
				"app":    "minecraft",
				"server": name,
			},
		},
		"spec": map[string]interface{}{
			"entryPoints": []string{"minecraft-tcp"},
			"routes": []map[string]interface{}{
				{
					"match": fmt.Sprintf("HostSNI(`%s.%s`)", name, domain),
					"services": []map[string]interface{}{
						{
							"name": name,
							"port": 25565, // this port maybe I need to change to the node port
						},
					},
				},
			},
		},
	}

	gvr := schema.GroupVersionResource{
		Group:    "traefik.containo.us",
		Version:  "v1alpha1",
		Resource: "ingressroutetcps",
	}

	data, err := json.Marshal(ingressRoute)
	if err != nil {
		return err
	}

	unstructuredObj := &unstructured.Unstructured{}
	if err := unstructuredObj.UnmarshalJSON(data); err != nil {
		return err
	}

	_, err = dynamicClient.Resource(gvr).Namespace(namespace).Create(context.TODO(), unstructuredObj, metav1.CreateOptions{})
	return err
}
