const yaml = require('js-yaml')
const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')
const Assigner = require('./src/assigner')
const Client = require('./src/github_client')

const main = async () => {
    const context = github.context
    const token = core.getInput('repo-token', { required: true })
    const configFile = core.getInput('config-path', { required: true })
    const client = new Client(token, context.issue)

    const response  = await client.getConfigFile(configFile)
    const yamlString = Buffer.from(response.data.content, 'base64').toString()
    const config = yaml.safeLoad(yamlString)

    const assigner = new Assigner(config.reviewers, context.payload.labels, context.issue, config.numberOfReviewers)

    const reviewers = assigner.selectReviewers()
    if (reviewers.length == 0) {
        core.error("Failed to assign reviewers: ")
        throw new Error('Failed to assign reviewers.')
    }

    const result = await client.assignReviewers(reviewers)
    core.info(result)
}

main()
