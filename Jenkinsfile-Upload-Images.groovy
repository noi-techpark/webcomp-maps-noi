pipeline{
    agent any
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
                s3Upload(bucket: 'it.bz.opendatahub.noi.map.planimetry', acl: 'PublicRead', file: './resources')
            }
        }
    }
}
