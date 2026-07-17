pipeline {
    agent any

    parameters {
        string(
            name: 'DOCKERTAG',
            description: 'Docker image tag to set (e.g. git short SHA)'
        )
        string(
            name: 'IMAGE_NAME',
            defaultValue: 'raj80dockerid/japanese-flash-card',
            description: 'Full image name without tag'
        )
        string(
            name: 'MANIFEST_REPO',
            defaultValue: 'https://github.com/236sec/japanese-flash-card-manifests.git',
            description: 'Git URL of the manifest repository'
        )
        string(
            name: 'ENVIRONMENT',
            defaultValue: 'dev',
            description: 'Which environment to update (dev | prod)'
        )
    }

    environment {
        FULL_IMAGE = "${params.IMAGE_NAME}:${params.DOCKERTAG}"
    }

    stages {

        stage('Clone manifest repo') {
            steps {
                git url: params.MANIFEST_REPO, branch: 'main'
            }
        }

        stage('Update image tag') {
            steps {
                script {
                    sh """
                        echo "Before:"
                        grep 'image:' base/deployment.yaml

                        sed -i "s|image: ${params.IMAGE_NAME}:.*|image: ${FULL_IMAGE}|" \\
                            base/deployment.yaml

                        echo "After:"
                        grep 'image:' base/deployment.yaml
                    """
                }
            }
        }

        stage('Commit & push') {
            steps {
                script {
                    sh """
                        git config user.email  'jenkins@ci.local'
                        git config user.name   'Jenkins CI'

                        git add base/deployment.yaml
                        git diff --cached --quiet && exit 0
                        git commit -m \\
                            "bump(${params.ENVIRONMENT}): ${params.IMAGE_NAME} → ${params.DOCKERTAG}"
                        git push origin main
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Manifest updated — ArgoCD will sync ${params.ENVIRONMENT}"
        }
        failure {
            echo "❌ Failed to update manifest"
        }
    }
}
