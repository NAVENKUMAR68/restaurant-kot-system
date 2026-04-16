pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'navenkumars'
        FRONTEND_IMAGE = "${DOCKERHUB_USER}/smart-kot-frontend"
        BACKEND_IMAGE  = "${DOCKERHUB_USER}/smart-kot-backend"
        IMAGE_TAG      = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/NAVENKUMAR68/restaurant-kot-system'
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        echo "Building Frontend Image: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                        sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest"
                    }
                }
                stage('Build Backend') {
                    steps {
                        echo "Building Backend Image: ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend"
                        sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    echo "Logging into DockerHub..."
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
                
                echo "Pushing images to DockerHub..."
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG} || true"
                sh "docker push ${FRONTEND_IMAGE}:latest || true"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG} || true"
                sh "docker push ${BACKEND_IMAGE}:latest || true"
                echo "Push process finished (or skipped)."
            }
        }

        stage('Create .env File') {
            steps {
                echo "Creating .env file for deployment..."
                sh '''
                cat <<EOF > .env
MONGODB_URI=mongodb://mongodb:27017/kot
JWT_SECRET=secret123
RAZORPAY_KEY_ID=rzp_test_Se8eY9hlUP4j6p
RAZORPAY_KEY_SECRET=CL15kwHX1cjiRTyA6A6BIB0e
FRONTEND_URL=http://localhost:5173
EOF
                '''
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                echo "Deploying application..."
                sh '''
                docker compose down --remove-orphans || true
                docker compose up -d --build
                '''
            }
        }

        stage('Debug & Logs') {
            steps {
                echo "Listing running containers..."
                sh 'docker ps -a'
                echo "Fetching container logs..."
                sh 'docker compose logs --tail=50 || true'
            }
        }

        stage('Health Check') {
            steps {
                echo "Waiting for services to be ready..."
                sh 'sleep 15'
                echo "Checking Backend Health..."
                sh 'docker exec smart-kot-backend curl -f http://localhost:8000/api/health || (docker compose logs backend && exit 1)'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed! Review the logs above.'
            sh 'docker compose logs || true'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
