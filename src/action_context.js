const github = require('@actions/github')
const utils = require('./utils')

module.exports = class ActionContext {
    constructor(context) {
        const labels = utils.valueOr(context.payload.pull_request.labels, [])
        this.labels = labels.map((label) => label.name)
        this.owner = context.payload.pull_request.user.name
        this.repo_owner = context.issue.owner
        this.number = context.issue.number
        this.repo = context.issue.repo
        this.numberOfReviewers = context.payload.pull_request.requested_reviewers.length
    }
}
