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
                        sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ."
                        sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest"
                    }
                }
                stage('Build Backend') {
                    steps {
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
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                }
                sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${FRONTEND_IMAGE}:latest"
                sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${BACKEND_IMAGE}:latest"
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose down --remove-orphans || true'
                sh 'docker-compose pull'
                sh 'docker-compose up -d'
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 10'
                sh 'docker ps --filter "name=smart-kot"'
                sh 'docker exec smart-kot-backend curl -f http://localhost:8000/api/health || exit 1'
                sh 'docker-compose logs --tail=20'
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully! Images pushed and containers running.'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above for details.'
            sh 'docker-compose logs || true'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
