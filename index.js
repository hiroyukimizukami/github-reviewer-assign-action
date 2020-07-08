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
    core.info(JSON.stringify(context.issue))

    const client = new Client(token, context.issue)
    core.debug(configFile)

    const config  = await client.getConfigFile(configFile)
    core.info(Object.keys(config))
    core.info(config.data)
    core.info(config.data.content)

    const assigner = new Assigner(config.reviewers, context.payload, config.numberOfReviewers)

    const reviewers = assigner.selectReviewers()
    if (reviewers.length == 0) {
        core.error("Failed to assign reviewers: ")
        throw new Error('Failed to assign reviewers.')
    }

    const result = await client.assignReviewers(reviewers)
    core.info(result)
}

main()
