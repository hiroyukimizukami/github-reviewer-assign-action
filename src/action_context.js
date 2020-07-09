const github = require('@actions/github')

module.exports = class ActionContext {
    constructor(context) {
        const labels = context.payload.labels ?? []
        this.labels = labels.map((label) => label.name)
        this.owner = context.issue.owner
        this.number = context.issue.number
        this.repo = context.issue.repo
    }
}
