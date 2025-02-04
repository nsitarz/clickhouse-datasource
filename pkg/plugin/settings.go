package plugin

import (
	"encoding/json"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

// Settings - data loaded from grafana settings database
type Settings struct {
	Server             string `json:"server,omitempty"`
	Port               int64  `json:"port,omitempty"`
	Username           string `json:"username,omitempty"`
	DefaultDatabase    string `json:"defaultDatabase,omitempty"`
	InsecureSkipVerify bool   `json:"tlsSkipVerify,omitempty"`
	TlsClientAuth      bool   `json:"tlsAuth,omitempty"`
	TlsAuthWithCACert  bool   `json:"tlsAuthWithCACert,omitempty"`
	Password           string `json:"-,omitempty"`
	TlsCACert          string
	TlsClientCert      string
	TlsClientKey       string
	Secure             bool `json:"secure,omitempty"`
}

func (settings *Settings) isValid() (err error) {
	if settings.Server == "" {
		return ErrorMessageInvalidServerName
	}
	if settings.Port == 0 {
		return ErrorMessageInvalidPort
	}
	return nil
}

// LoadSettings will read and validate Settings from the DataSourceConfig
func LoadSettings(config backend.DataSourceInstanceSettings) (settings Settings, err error) {
	if err := json.Unmarshal(config.JSONData, &settings); err != nil {
		return settings, fmt.Errorf("%s: %w", err.Error(), ErrorMessageInvalidJSON)
	}
	val, ok := config.DecryptedSecureJSONData["password"]
	if !ok {
		return settings, settings.isValid()
	}
	settings.Password = val
	tlsCACert, ok := config.DecryptedSecureJSONData["tlsCACert"]
	if ok {
		settings.TlsCACert = tlsCACert
	}
	tlsClientCert, ok := config.DecryptedSecureJSONData["tlsClientCert"]
	if ok {
		settings.TlsClientCert = tlsClientCert
	}
	tlsClientKey, ok := config.DecryptedSecureJSONData["tlsClientKey"]
	if ok {
		settings.TlsClientKey = tlsClientKey
	}
	return settings, settings.isValid()
}
