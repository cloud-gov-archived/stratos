package terminal

import (
	"fmt"
	"io/ioutil"
	"regexp"

	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces"
	"github.com/cloudfoundry-incubator/stratos/src/jetstream/plugins/kubernetes/api"
	"github.com/cloudfoundry-incubator/stratos/src/jetstream/repository/interfaces/config"

	log "github.com/sirupsen/logrus"
)

const (
	//serviceAccountTokenFile = "/var/run/secrets/kubernetes.io/serviceaccount/token"
	serviceAccountTokenFile = "./token"
	serviceHostEnvVar = "KUBERNETES_SERVICE_HOST"
	servicePortEnvVar = "KUBERNETES_SERVICE_PORT"

	stratosRoleLabel = "stratos-role"
	stratosKubeTerminalRole = "kube-terminal"
	stratosSessionAnnotation = "stratos-session"

	consoleContainerName = "kube-terminal"
)

// KubeTerminal supports spawning pods to provide a CLI environment to the user
type KubeTerminal struct {
	PortalProxy	interfaces.PortalProxy
	Namespace string `configName:"STRATOS_KUBERNETES_NAMESPACE"`
	Image     string `configName:"STRATOS_KUBERNETES_TERMINAL_IMAGE"`
	Token     []byte
	APIServer string
	Kube api.Kubernetes
}

// NewKubeTerminal checks that the environment is set up to support the Kube Terminal
func NewKubeTerminal(p interfaces.PortalProxy) *KubeTerminal {

	kt := &KubeTerminal{
		PortalProxy: p,
	}
	if err := config.Load(kt, p.Env().Lookup); err != nil {
		log.Warnf("Unable to load Kube Terminal configuration. %v", err)
		return nil
	}

	// Check that we have everything we need
	if len(kt.Image) == 0 || len(kt.Namespace) == 0 {
		log.Warn("Kube Terminal configuration is not complete")
		return nil
	}

	// Read the Kubernetes API Endpoint
	host, hostFound := p.Env().Lookup(serviceHostEnvVar)
	port, portFound := p.Env().Lookup(servicePortEnvVar)
	if !hostFound || !portFound {
		log.Warn("Kubernetes API Server configuration not found (host and/or port env vars not set)")
		return nil
	}
	kt.APIServer = fmt.Sprintf("https://%s:%s", host, port)

	// Read the Service Account Token
	token, err := ioutil.ReadFile(serviceAccountTokenFile)
	if err != nil {
		log.Warnf("Unable to load Service Account token. %v", err)
		return nil
	}

	kt.Token = token

	version := "v1.15+"

	reg, err := regexp.Compile("[^0-9\\.]+")
	if err == nil {
		version = reg.ReplaceAllString(version, "")
	}

	log.Info(version)	

	log.Debug("Kubernetes Terminal configured")
	return kt
}
