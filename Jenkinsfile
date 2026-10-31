// Jenkins pipeline for the Settle backend (the server folder).
// It installs the packages, sets up a test database and runs the Jest tests on every new commit.
// The mobile app (the client folder) isn't built here.
pipeline {
    agent any

    // Check GitHub for new commits every 5 minutes. GitHub can't send a webhook to Jenkins on a laptop
    triggers {
        pollSCM('H/5 * * * *')
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
    }

    // Where Postgres is (DB_HOST, DB_PORT, DB_USERNAME) is set in Jenkins itself, under
    // Manage Jenkins > System > Environment variables, because it differs from one computer to another
    environment {
        NODE_ENV = 'test'
        // Jenkins gets its own test database, so it never clashes with tests run by hand
        DB_NAME_TEST = 'settle_test_jenkins'
        // The Postgres password is kept in Jenkins' credentials, never in the code
        DB_PASSWORD = credentials('settle-db-password')
        // Only used to sign tokens inside the tests, so it isn't a real secret
        JWT_SECRET = 'jenkins-test-secret'
    }

    stages {
        stage('Install') {
            steps {
                dir('server') {
                    runCommand('npm ci')
                }
            }
        }

        stage('Test database') {
            steps {
                dir('server') {
                    // Creating it fails when it's already there from an earlier build, and that's fine
                    runCommandAllowingFailure('npx sequelize-cli db:create --env test')
                    runCommand('npx sequelize-cli db:migrate --env test')
                }
            }
        }

        stage('Unit tests') {
            steps {
                dir('server') {
                    runCommand('npm test -- --ci --reporters=default --reporters=jest-junit')
                }
            }
        }
    }

    post {
        always {
            // Shows each test's result on the build page, and keeps the coverage report
            junit allowEmptyResults: true, testResults: 'server/junit.xml'
            archiveArtifacts artifacts: 'server/coverage/lcov-report/**', allowEmptyArchive: true
        }
    }
}

// Jenkins on Windows runs commands with bat, and on Mac or Linux with sh
def runCommand(String command) {
    if (isUnix()) {
        sh command
    } else {
        bat command
    }
}

def runCommandAllowingFailure(String command) {
    if (isUnix()) {
        sh(script: command, returnStatus: true)
    } else {
        bat(script: command, returnStatus: true)
    }
}