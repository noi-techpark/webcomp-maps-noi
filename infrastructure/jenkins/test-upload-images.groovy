pipeline{
    agent any
    environment{
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
    }
    stages{
        stage('Validate Trigger'){
            steps{
                script{
                    def causes = currentBuild.getBuildCauses()
                    def isGithub = causes[0].toString().contains("GitHubPushCause")
                    if (isGithub){
                        sh 'git diff HEAD~ -- ./resources | grep diff'
                    }
                }
            }
        }
        stage('Upload images'){
            steps{
                s3Upload(bucket: 'it.bz.noi.maps.images.test', acl: 'PublicRead', file: './resources')
            }
        }
    }
}
