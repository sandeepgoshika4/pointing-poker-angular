pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "sandeepgoshika4"
        IMAGE_NAME     = "poker-frontend"
        KUBECONFIG     = credentials('kubeconfig-pi')
    }

    stages {

        /* ---------------------------------------------------
           CHECKOUT CODE
        --------------------------------------------------- */
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        /* ---------------------------------------------------
           PREPARE BUILDX FOR ARM64 BUILDS
        --------------------------------------------------- */
        stage('Prepare Buildx for ARM64') {
            steps {
                sh '''
                    echo "Installing ARM64 emulation..."
                    docker run --privileged --rm tonistiigi/binfmt --install all

                    echo "Creating buildx builder (safe if exists)..."
                    docker buildx create --use --name mybuilder || true

                    echo "Bootstrapping buildx..."
                    docker buildx inspect --bootstrap
                '''
            }
        }

        /* ---------------------------------------------------
           BUILD & PUSH DOCKER IMAGE (NO CACHE)
        --------------------------------------------------- */
        stage('Build & Push ARM64 Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )
                ]) {
                    sh '''
                        echo "Logging in to Docker Hub..."
                        echo "$PASS" | docker login -u "$USER" --password-stdin

                        echo "Building ARM64 Docker image with NO CACHE..."
                        docker buildx build \
                          --no-cache \
                          --platform linux/arm64 \
                          -t $DOCKERHUB_USER/$IMAGE_NAME:latest \
                          -f Dockerfile \
                          . \
                          --push
                    '''
                }
            }
        }

        /* ---------------------------------------------------
           DEPLOY TO KUBERNETES
        --------------------------------------------------- */
        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    echo "Deploying Angular frontend to K8s..."
                    export KUBECONFIG=$KUBECONFIG

                    # Apply deployment and service
                    kubectl apply -n poker-app -f /home/jenkins/k8s/poker-app/frontend-deployment.yaml
                    kubectl apply -n poker-app -f /home/jenkins/k8s/poker-app/frontend-service.yaml

                    echo "Forcing rollout to pick latest image..."
                    kubectl rollout restart deployment/poker-frontend -n poker-app
                '''
            }
        }
    }
}
