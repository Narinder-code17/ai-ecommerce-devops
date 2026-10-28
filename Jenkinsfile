pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
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

        stage('Deploy and Health Check') {
            steps {
                bat 'docker compose %COMPOSE_FILES% up -d --build'

                powershell '''
                    $ok = $false

                    for ($i = 1; $i -le 15; $i++) {
                        try {
                            $response = Invoke-WebRequest -Uri "http://localhost:8085/health" -UseBasicParsing -TimeoutSec 5

                            if ($response.StatusCode -eq 200) {
                                $ok = $