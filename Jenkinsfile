pipeline {
    agent any

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
        IMAGE_NAME      = "${params.DOCKER_HUB_NAMESPACE}/japanese-flash-card"
        IMAGE_TAG       = params.IMAGE_TAG
            ? params.IMAGE_TAG
            : sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        FULL_IMAGE      = "${IMAGE_NAME}:${IMAGE_TAG}"
        DOCKER_REGISTRY = 'https://index.docker.io/v1/'
        BUN_IMAGE       = 'oven/bun:1'
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
                script {
                    docker.image(BUN_IMAGE).inside {
                        sh 'bun install --frozen-lockfile'
                        sh 'bunx tsc --noEmit'
                    }
                }
            }
        }

        // ── 3. Run vitest tests ───────────────────────────
        stage('Test') {
            when {
                expression { !params.SKIP_TESTS }
            }
            steps {
                script {
                    docker.image(BUN_IMAGE).inside {
                        sh 'bun run test'
                    }
                }
            }
            post {
                always {
                    junit testResults: 'test-results/*.xml', allowEmptyResults: true
                }
            }
        }

        // ── 4. Build production Docker image ───────────────
        stage('Build Image') {
            steps {
                script {
                    dockerImage = docker.build(IMAGE_NAME, '--no-cache .')
                }
            }
        }

        // ── 5. Security scan (Trivy) ──────────────────────
        stage('Security Scan') {
            steps {
                script {
                    sh """
                        docker run --rm \\
                            -v /var/run/docker.sock:/var/run/docker.sock \\
                            aquasec/trivy image \\
                            --severity HIGH,CRITICAL \\
                            --no-progress \\
                            ${FULL_IMAGE} || true
                    """
                }
            }
        }

        // ── 6. Push to Docker Hub ─────────────────────────
        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry(DOCKER_REGISTRY, 'dockerhub') {
                        dockerImage.push(IMAGE_TAG)
                        echo "✅ Pushed ${FULL_IMAGE} to Docker Hub"
                    }
                }
            }
        }

        // ── 7. Trigger manifest update ────────────────────
        stage('Trigger ManifestUpdate') {
            steps {
                script {
                    echo "🔄 Triggering updatemanifest with DOCKERTAG=${IMAGE_TAG}"
                    build job: 'updatemanifest', parameters: [
                        string(name: 'DOCKERTAG',  value: IMAGE_TAG),
                        string(name: 'IMAGE_NAME', value: IMAGE_NAME)
                    ]
                }
            }
        }
    }

    // ── Post actions ───────────────────────────────────────────
    post {
        always {
            // Free disk space on the Jenkins agent
            script {
                sh "docker rmi ${FULL_IMAGE} || true"
            }
            cleanWs()
        }
        success {
            echo "✅ Pipeline succeeded — ${FULL_IMAGE} is ready for deployment."
            // Uncomment to notify via Slack:
            // slackSend(color: 'good', message: "✅ `${FULL_IMAGE}` built & pushed successfully.")
        }
        failure {
            echo "❌ Pipeline failed — check the logs above."
            // Uncomment to notify via Slack:
            // slackSend(color: 'danger', message: "❌ Build failed for `${FULL_IMAGE}`.")
        }
    }
}
