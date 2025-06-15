package models

type ServerConfig struct {
	Username string `json:"username"`
	Version  string `json:"version"`
	Memory   string `json:"memory"`
}
