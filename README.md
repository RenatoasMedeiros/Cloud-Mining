
# ☁️ Cloud-Mining Kubernetes Deployment

This repository contains the full Kubernetes configuration for deploying the **Cloud-Mining frontend and backend applications**, including services, Ingress, and RBAC (Role-Based Access Control).

---

## 📁 Folder Structure

```
.
├── backend/                         # Backend application source code
├── frontend/                        # Frontend application source code
├── manifests/                       # Kubernetes YAML configuration
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── ingress.yaml
│   ├── backend-serviceaccount.yaml
│   ├── backend-role.yaml
│   ├── backend-rolebinding.yaml
│   ├── pvc-role.yaml
│   ├── pvc-rolebinding.yaml
│   ├── trafik-role.yaml
│   └── traefik-rolebinding.yaml
```

---

## 🚀 Frontend

### 📄 `frontend-deployment.yaml`

Deploys the frontend app:

- Uses Docker image: `rodrigomoraisipl/cloud-mining-frontend:latest`
    - Or you can run your own image -> Instruction in `frontend/README.md`
- Runs on container port `80`
- Sets environment variables:
  - `VITE_API_URL=http://api-192-168-1-130.sslip.io`
  - `VITE_WS_URL=http://api-192-168-1-130.sslip.io`

### 📄 `frontend-service.yaml`

Exposes the frontend using a `ClusterIP` service:

- Listens on port `80`
- Targets pods with label: `app: cloud-mining-frontend`
- Used by Ingress to route traffic to the frontend

---

## 🖥 Backend

### 📄 `backend-deployment.yaml`

Deploys the backend app, which:

- Supports dynamic PersistentVolumeClaims (PVCs)
- Integrates with Traefik to configure TCP routes
- Uses the `cloud-mining-backend-sa` ServiceAccount

### 📄 `backend-service.yaml`

- Exposes the backend on port `80` using `ClusterIP`
- Used by Ingress to route external traffic to the API

---

## 🌐 Ingress

### 📄 `ingress.yaml`

Handles external HTTP routing using `sslip.io`:

- `http://front-192-168-1-130.sslip.io` → frontend service
- `http://api-192-168-1-130.sslip.io` → backend service

> `sslip.io` resolves IP-based hostnames without DNS configuration.

---

## 🔐 RBAC Configuration

### 📄 `backend-serviceaccount.yaml`

Defines a ServiceAccount for the backend app:

```yaml
name: cloud-mining-backend-sa
namespace: default
```

### 📄 `backend-role.yaml` & `backend-rolebinding.yaml`

Grants permissions to:

- Manage **Deployments** and **Services**

### 📄 `pvc-role.yaml` & `pvc-rolebinding.yaml`

Grants permissions to:

- Dynamically manage **PersistentVolumeClaims (PVCs)**

### 📄 `trafik-role.yaml` & `traefik-rolebinding.yaml`

Grants permissions to:

- Manage **Traefik IngressRouteTCP** resources

All roles are bound to `cloud-mining-backend-sa`.

---

## ✅ Access URLs

| Component | URL                                                  |
|-----------|------------------------------------------------------|
| Frontend  | http://front-192-168-1-130.sslip.io                   |
| Backend   | http://api-192-168-1-130.sslip.io                     |