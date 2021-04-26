pipeline {
	agent any
	options {
		ansiColor('xterm')
	}
	stages {
		stage('Agent: Node Docker') {
			agent {
				dockerfile {
					filename 'infrastructure/docker/node.dockerfile'
					additionalBuildArgs '--build-arg JENKINS_USER_ID=$(id -u jenkins) --build-arg JENKINS_GROUP_ID=$(id -g jenkins)'
				}
			}
			stages {
				stage('Dependencies') {
					steps {
						sh 'npm ci'
					}
				}
				stage('Build') {
					steps {
						sh 'npm run build'
					}
				}
			}
		}
		stage('CC: REUSE') {
			steps {
				sh 'reuse lint'
			}
		}
	}
}
