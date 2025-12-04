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

        stage('Install Dependencies & Build Angular') {
            steps {
                sh '''
                    echo "Installing npm dependencies..."
                    npm ci

                    echo "Building Angular app for production..."
                    npm run build --prod
                '''
            }
        }

        stage('Build & Push Docker Image (ARM64)') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                                                 usernameVariable: 'USER',
                                                 passwordVariable: 'PASS')]) {
                    sh '''
                        echo "Logging into Docker Hub..."
                        echo "$PASS" | docker login -u "$USER" --password-stdin

                        echo "Building ARM64 Docker image for Angular frontend..."
                        docker buildx build \
                          --platform linux/arm64 \
                          --file Dockerfile \
                          -t $DOCKERHUB_USER/$IMAGE_NAME:latest \
                          . \
                          --push
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "Deploying Angular frontend to Raspberry Pi Kubernetes cluster..."
                    export KUBECONFIG=$KUBECONFIG

                    kubectl apply -n poker-app -f /home/jenkins/k8s/poker-app/frontend-deployment.yaml
                    kubectl apply -n poker-app -f /home/jenkins/k8s/poker-app/frontend-service.yaml
                '''
            }
        }
    }
}
