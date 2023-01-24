pipeline {
    libraries {
        lib 'nbm'
    }

    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        skipStagesAfterUnstable()
        //timeout period for the Pipeline run, after which Jenkins should abort the Pipeline
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Start') {
            steps {
                // send build started notifications
                sendNotification 'STARTED'
            }
        }

        stage('Build development docker image') {
            when {
                anyOf {
                    branch 'dev';
                    branch 'test'
                }
            }
            steps {
                sh './scripts/build-dev.sh $BUILD_NUMBER $BRANCH_NAME'
            }
        }

        stage('Deploy development') {
            when {
                anyOf {
                    branch 'dev';
                    branch 'test'
                }
            }
            steps {
                script {
                    sshagent(['123.30.208.20']) {
                        script {
                          if (env.BRANCH_NAME == "test" ) {
                            sh 'ssh -o StrictHostKeyChecking=no -l root 10.0.200.131 \
                            "cd /data/env/apithiethai; bash -s" < ./scripts/deploy-dev.sh $BUILD_NUMBER $BRANCH_NAME'
                          } else {
                            sh 'ssh -o StrictHostKeyChecking=no -l root 10.0.200.131 \
                            "cd /data/env/apithiethai; bash -s" < ./scripts/deploy-dev.sh $BUILD_NUMBER'
                          }
                        }
                    }
                }
            }
        }


        stage('Build production docker image') {
            when {
                branch 'main'
            }
            steps {
                sh './scripts/build-prod.sh $BUILD_NUMBER'
            }
        }

        stage('Deploy production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sshagent(['123.30.208.20']) {
                        sh 'ssh -o StrictHostKeyChecking=no -l root 10.0.200.131 \
                        "cd /data/envproduction/apithiethai; bash -s" < ./scripts/deploy-prod.sh $BUILD_NUMBER'
                    }
                }
            }
        }
    }

    post {
        always {
            sendNotification currentBuild.result
        }
    }
}
