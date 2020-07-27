const yaml = require('js-yaml')
const fs = require('fs')
const core = require('@actions/core')
const github = require('@actions/github')
const Assigner = require('./src/assigner')
const Client = require('./src/github_client')
const ActionConfig  = require('./src/action_config')
const ActionContext = require('./src/action_context')

const main = async () => {
    const token = core.getInput('repo-token', { required: true })
    const configFile = core.getInput('config-path', { required: true })

    const context = new ActionContext(github.context)
    const client = new Client(token, context)
    core.debug(JSON.stringify(client))

    const response  = await client.getConfigFile(configFile)
    const yamlString = Buffer.from(response.data.content, 'base64').toString()
    const config = new ActionConfig(yaml.safeLoad(yamlString))

    core.debug(JSON.stringify(context))
    core.debug(JSON.stringify(config))

    if (!Assigner.doesRespondTo(context, config)) {
        core.info('This pr does not have any of defined labels.')
        return
    }

    const assigner = new Assigner(context, config)

    const reviewers = assigner.selectReviewers()
    core.debug(reviewers)
    if (reviewers.length == 0) {
        core.warning("Failed to assign reviewers: ")
        return ;
    }

    const result = await client.assignReviewers(reviewers)
    core.info("Assigned reviewers:" + JSON.stringify(result))
}

main()
