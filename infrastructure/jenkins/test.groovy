pipeline {
	agent any
	environment {
		DOCKER_IMAGE = "755952719952.dkr.ecr.eu-west-1.amazonaws.com/webcompbuild:latest"
		ODH_BASE_URL = "https://mobility.api.opendatahub.bz.it/v2/flat/NOI-Place"
		ODH_RESOURCE_URL = "https://images.maps.noi.opendatahub.testingmachine.eu"
	}
	options {
		ansiColor('xterm')
	}
	stages {
		stage('AWS ECR login') {
			steps {
				sh '''
					aws ecr get-login --region eu-west-1 --no-include-email | bash
				'''
			}
		}
		stage('Agent: Docker webcompbuild') {
			agent {
				docker {
					alwaysPull true
					image "${DOCKER_IMAGE}"
				}
			}
			stages {
				stage('Prepare') {
					steps {
						sh '''
							cp /webcompbuild/.env .env
							rm -rf $(jq -r ".dist.basePath" wcs-manifest.json)
							echo "ODH_BASE_URL=$ODH_BASE_URL" >> .env
							echo "ODH_RESOURCE_URL=$ODH_RESOURCE_URL" >> .env
						'''
					}
				}
				stage("Dependencies") {
					steps {
						sh '''
							npm ci
						'''
					}
				}
				stage("Build") {
					steps {
						sh '''
							npm run build
						'''
					}
				}
				stage("Update manifest") {
					steps {
						sh "/webcompbuild/wcstorecli.sh -u"
					}
				}
				stage('Deploy') {
					steps {
						sshagent (credentials: ['tomcatkey', 'jenkins_github_ssh_key']) {
							sh '''
								WHEN=$(date "+%Y%m%dT%H%M")
								WC_NAME=${GIT_URL##*/}
								WC_NAME=${WC_NAME%.git}
								/webcompbuild/wcstorecli.sh -d "${WC_NAME}" "${BRANCH_NAME}-${BUILD_NUMBER}-${WHEN}"
							'''
						}
					}
				}
			}
		}
	}
}
