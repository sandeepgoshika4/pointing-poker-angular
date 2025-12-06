pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "sandeepgoshika4"
        IMAGE_NAME     = "poker-frontend"
        IMAGE_TAG      = "v${BUILD_NUMBER}"
        KUBECONFIG     = credentials('kubeconfig-pi')
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Buildx for ARM64') {
            steps {
                sh '''
                    echo "Installing ARM64 emulation..."
                    docker run --privileged --rm tonistiigi/binfmt --install all || true

                    echo "Creating Buildx builder..."
                    docker buildx create --use --name mybuilder || true

                    echo "Bootstrapping Buildx..."
                    docker buildx inspect --bootstrap
                '''
            }
        }

        stage('Build & Push Docker Image (Versioned Tag)') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                 usernameVariable: 'USER',
                                                 passwordVariable: 'PASS')]) {

                    sh '''
                        echo "Logging into Docker Hub..."
                        echo "$PASS" | docker login -u "$USER" --password-stdin

                        echo "Building Docker image with tag: ${IMAGE_TAG}"
                        docker buildx build \
                            --platform linux/arm64 \
                            --no-cache \
                            -t $DOCKERHUB_USER/$IMAGE_NAME:${IMAGE_TAG} \
                            -t $DOCKERHUB_USER/$IMAGE_NAME:latest \
                            --push \
                            -f Dockerfile .
                    '''
                }
            }
        }

        stage('Update Kubernetes Deployment') {
            steps {
                sh '''
                    echo "Deploying new image to Kubernetes..."

                    export KUBECONFIG=$KUBECONFIG

                    # Patch deployment with new image tag
                    kubectl set image deployment/poker-frontend \
                        poker-frontend=$DOCKERHUB_USER/$IMAGE_NAME:${IMAGE_TAG} -n poker-app

                    # Force refresh
                    kubectl rollout restart deployment poker-frontend -n poker-app

                    echo "Deployment updated to image tag: ${IMAGE_TAG}"
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully with tag ${IMAGE_TAG}"
        }
    }
}
