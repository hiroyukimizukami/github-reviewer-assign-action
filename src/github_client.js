const github = require('@actions/github')
const core = require('@actions/core')

module.exports = class GithubClient {
    constructor(token, pull_request) {
        this.octokit = github.getOctokit(token)
        this.owner = pull_request.owner
        this.repo = pull_request.repo
        this.pull_number = pull_request.number
    }

    async assignReviewers(reviewers) {
        return await this.octokit.pulls.requestReviewers({
            owner: this.owner,
            repo: this.repo,
            pull_number: this.pull_number,
            reviewers: reviewers
        })
    }

    async addAssignee(assignee) {
        return await this.octokit.issues.addAssignees({
            owner: this.owner,
            repo: this.repo,
            issue_number: this.pull_number,
            assigner: [assignee]
        })
    }

    async getConfigFile(path) {
        return await this.octokit.repos.getContent({
            owner: this.owner,
            repo: this.repo,
            path: path,
        })
    }
}
