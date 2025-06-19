package models

type ServerConfig struct {
	Username string `json:"username"`
	Version  string `json:"version"`
	Memory   string `json:"memory"`
}

type ServerDTO struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	Memory  string `json:"memory"`
	Status  string `json:"status"`
	Port    string `json:"port"`
}
