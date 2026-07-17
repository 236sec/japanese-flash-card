pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: bun
    image: oven/bun:1
    command: ['sleep']
    args: ['infinity']
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ['sleep']
    args: ['infinity']
    volumeMounts:
    - name: docker-config
      mountPath: /kaniko/.docker
  volumes:
  - name: docker-config
    secret:
      secretName: dockerhub-credentials
      items:
      - key: .dockerconfigjson
        path: config.json
"""
        }
    }

    // ── Parameters ──────────────────────────────────────────────
    parameters {
        string(
            name: 'IMAGE_TAG',
            defaultValue: '',
            description: 'Docker image tag (defaults to git short SHA)'
        )
        string(
            name: 'DOCKER_HUB_NAMESPACE',
            defaultValue: 'raj80dockerid',
            description: 'Docker Hub user or organisation'
        )
        booleanParam(
            name: 'SKIP_TESTS',
            defaultValue: false,
            description: 'Skip test and type-check stages'
        )
    }

    // ── Environment ────────────────────────────────────────────
    environment {
        IMAGE_NAME  = "${params.DOCKER_HUB_NAMESPACE}/japanese-flash-card"
        BUN_IMAGE   = 'oven/bun:1'
    }

    // ── Global options ─────────────────────────────────────────
    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()
    }

    // ── Stages ─────────────────────────────────────────────────
    stages {

        // ── 1. Checkout source ─────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.IMAGE_TAG = params.IMAGE_TAG
                        ? params.IMAGE_TAG
                        : sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.FULL_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
                    currentBuild.displayName = "#${BUILD_NUMBER} · ${IMAGE_TAG}"
                    echo "📦 Building ${FULL_IMAGE}"
                }
            }
        }

        // ── 2. Install + Type check ────────────────────────
        stage('Type Check') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                container('bun') {
                    sh 'bun install --frozen-lockfile'
                    sh 'bunx tsc --noEmit'
                }
            }
        }

        // ── 3. Run vitest tests ───────────────────────────
        stage('Test') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                container('bun') {
                    sh 'bun run test'
                }
            }
            post {
                always {
                    junit testResults: 'test-results/*.xml', allowEmptyResults: true
                }
            }
        }

        // ── 4. Build + push with Kaniko ───────────────────
        stage('Build & Push') {
            steps {
                container('kaniko') {
                    sh """
                        /kaniko/executor \\
                            --context ${env.WORKSPACE} \\
                            --dockerfile ${env.WORKSPACE}/Dockerfile \\
                            --destination ${FULL_IMAGE} \\
                            --cache=true \\
                            --cache-ttl=24h
                    """
                }
            }
        }

        // ── 5. Trigger manifest update ────────────────────
        stage('Trigger ManifestUpdate') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "🔄 Triggering updatemanifest with DOCKERTAG=${IMAGE_TAG}"
                    build job: 'updatemanifest', parameters: [
                        string(name: 'DOCKERTAG',  value: IMAGE_TAG),
                        string(name: 'IMAGE_NAME', value: IMAGE_NAME)
                    ], wait: false
                }
            }
        }
    }

    // ── Post actions ───────────────────────────────────────────
    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded — ${FULL_IMAGE} pushed, ArgoCD will sync shortly."
        }
        failure {
            echo "❌ Pipeline failed — check the logs above."
        }
    }
}
