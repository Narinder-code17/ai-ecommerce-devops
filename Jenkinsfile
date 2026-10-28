pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        PATH = "C:\\Program Files\\nodejs;${env.PATH}"
        IMAGE_NAME = 'shopstream:jenkins'
        COMPOSE_FILES = '-f docker/docker-compose.yml -f docker/docker-compose.override.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install, Test and Audit') {
            steps {
                bat 'npm --prefix application ci'
                bat 'npm --prefix application test'
                bat 'npm --prefix application audit --audit-level=high --omit=dev'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -f docker/Dockerfile -t shopstream:jenkins .'
            }
        }

        stage('Trivy Security Scan') {
            steps {
                bat 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.76.1 image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 shopstream:jenkins'
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker compose %COMPOSE_FILES% up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                bat 'powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri http://localhost:8085/health -UseBasicParsing -TimeoutSec 10; if ($r.StatusCode -ne 200) { exit 1 } } catch { exit 1 }"'
            }
        }
    }

    post {
        always {
            echo 'ShopStream Jenkins pipeline finished.'
        }
    }
}