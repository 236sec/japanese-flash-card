# Japanese Flash Card — Manifests (separate repo)

GitOps configuration repository for the Japanese Flash Card app.
**ArgoCD watches this repo** and syncs the cluster automatically.

```
manifest-repo/
├── base/                          # Shared Kubernetes resources
│   ├── deployment.yaml            # ← image tag updated by Jenkins
│   ├── service.yaml
│   └── kustomization.yaml
├── overlays/
│   ├── dev/                       # Dev environment
│   │   ├── deployment-patch.yaml  # 1 replica, small resources
│   │   └── kustomization.yaml
│   └── prod/                      # Production environment
│       ├── deployment-patch.yaml  # 3 replicas, more resources
│       └── kustomization.yaml
├── updatemanifest.Jenkinsfile     # Jenkins job that updates the tag
└── argocd-app.yaml                # ArgoCD Application definitions
```

---

## Setup

### 1. Create this as its own git repo

```bash
cd manifest-repo
git init
git remote add origin https://github.com/236sec/japanese-flash-card-manifests.git
git add .
git commit -m "init: base + dev/prod overlays"
git push -u origin main
```

### 2. Create the `updatemanifest` job in Jenkins

- **New Item** → Pipeline → name: `updatemanifest`
- **Pipeline** → Definition: *Pipeline script from SCM*
  - SCM: Git
  - Repository URL: `https://github.com/236sec/japanese-flash-card-manifests.git`
  - Script Path: `updatemanifest.Jenkinsfile`

### 3. Apply the ArgoCD Application

```bash
kubectl apply -f argocd-app.yaml
```

---

## How the full flow works

```
[App Repo]                    [Jenkins]                    [Manifest Repo]              [K8s]
    │                             │                              │                        │
    │ git push                    │                              │                        │
    ├─────────────────────────────►                              │                        │
    │                             │                              │                        │
    │                        ┌────┴────┐                         │                        │
    │                        │Build    │                         │                        │
    │                        │Push     │                         │                        │
    │                        │Trigger ─┼──► updatemanifest job   │                        │
    │                        └─────────┘                         │                        │
    │                                                  ┌─────────┴────────┐               │
    │                                                  │Clone manifest    │               │
    │                                                  │sed replace tag   │               │
    │                                                  │git commit + push │               │
    │                                                  └──────────────────┘               │
    │                                                                 ───► ArgoCD detects │
    │                                                                      commit and     │
    │                                                                      syncs cluster ◄┘
```

## Changing the image tag manually

```bash
# Clone the manifest repo
git clone https://github.com/236sec/japanese-flash-card-manifests.git
cd japanese-flash-card-manifests

# Edit the tag
sed -i 's|image: raj80dockerid/japanese-flash-card:.*|image: raj80dockerid/japanese-flash-card:abc1234|' \
    base/deployment.yaml

git add base/deployment.yaml
git commit -m "bump: rollback to abc1234"
git push
# ArgoCD syncs automatically
```
