const ActionContext = require('../src/action_context')
const defaultContext = {
    payload: {
        action: "labeled",
        pull_request: {
            user: {name: "pr_author"},
            labels: [
                {name: "All"}
            ],
            requested_reviewers: [
                {name: "reviewer_1"}
            ]
        }
    },
    issue: {
        owner: "repo_owner",
        number: 1,
        repo: "repo_name",
    }
}

test('it stores data', () => {
    const config = new ActionContext(defaultContext)
    expect(config.labels).toEqual(['All'])
    expect(config.owner).toBe('pr_author')
    expect(config.repo_owner).toBe('repo_owner')
    expect(config.number).toBe(1)
    expect(config.repo).toBe('repo_name')
    expect(config.numberOfReviewers).toBe(1)

})
