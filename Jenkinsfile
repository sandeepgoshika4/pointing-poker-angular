pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "sandeepgoshika4"
        IMAGE_NAME     = "poker-frontend"
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
                    docker run --privileged --rm tonistiigi/binfmt --install all

                    echo "Creating and bootstrapping buildx builder..."
                    docker buildx create --use --name mybuilder || true
                    docker buildx inspect --bootstrap
                '''
            }
        }

        stage('Build & Push ARM64 Angular Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                 usernameVariable: 'USER',
                                                 passwordVariable: 'PASS')]) {
                    sh '''
                        echo "$PASS" | docker login -u "$USER" --password-stdin

                        echo "Building ARM64 Docker image..."
                        docker buildx build \
                          --platform linux/arm64 \
                          -t $DOCKERHUB_USER/$IMAGE_NAME:latest \
                          --push \
                          -f Dockerfile \
                          .
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "Deploying Angular frontend to K8s..."
                    export KUBECONFIG=$KUBECONFIG

                    kubectl apply -n poker-app -f /home/jenkins/k8s/poker-app/frontend-deployment.yaml
                    kubectl apply -n poker-app -f /home/jenkins/k8s/poker-app/frontend-service.yaml
                '''
            }
        }
    }
}
