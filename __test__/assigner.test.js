Assigner = require('../src/assigner')
ActionConfig = require('../src/action_config.js')
ActionContext = require('../src/action_context.js')

const defaultReviewers = {
    domain1: ["d1-reviewer1", "d1-reviewer2"],
    domain2: ["d2-reviewer1","d2-reviewer2"]
}

const mismatchReviewers = {
    domain2: ["d2-reviewer1", "d2-reviewer2"],
    domain3: ["d3-reviewer1","d3-reviewer2"]
}

const actionContext = new ActionContext({
    issue: {owner: 'pr_author', number: 6, repo: 'test'},
    payload: {labels: [{name: 'domain1'}]}
})

test('it stores instance variables from parameters', () => {
    const config = new ActionConfig({
        reviewers: defaultReviewers,
        numberOfReviewers: 2,
        numberOfReviewersFromDomain: 1
    })

    const assigner = new Assigner(actionContext, config)
    expect(assigner.allReviewers).toEqual(['d1-reviewer1', 'd1-reviewer2', 'd2-reviewer1', 'd2-reviewer2'])
    expect(assigner.labels).toEqual(actionContext.labels)
    expect(assigner.domains).toEqual(['domain1', 'domain2'])
    expect(assigner.pullRequest).not.toBeNull()
    expect(assigner.owner).toBe('pr_author')
    expect(assigner.numberOfReviewers).toBe(config.numberOfReviewers)
    expect(assigner.numberOfReviewersFromDomain).toBe(config.numberOfReviewersForDomain)
})

test('it assgins certain number of reviewers, 1 reviewer is from domain', () => {
    const config = new ActionConfig({
        reviewers: defaultReviewers,
        numberOfReviewers: 3,
        numberOfReviewersFromDomain: 1
    })

    const assigner = new Assigner(actionContext, config)
    const reviewers = assigner.selectReviewers()
    expect(reviewers.length).toBe(3)
    expect(reviewers[0]).toMatch(/d1-/)
})

test('it assigns possible maximum number of reviewers', () => {
    const config = new ActionConfig({
        reviewers: defaultReviewers,
        numberOfReviewers: 100,
        numberOfReviewersFromDomain: 1
    })

    const assigner = new Assigner(actionContext, config)
    const reviewers = assigner.selectReviewers()
    expect(reviewers.length).toBe(4)
    expect(reviewers[0]).toMatch(/d1-/)
})

test('it does not assign reviewers for a pr that does not have any of defined domains', () => {
    const config = new ActionConfig({
        reviewers: mismatchReviewers,
        numberOfReviewers: 2,
        numberOfReviewersFromDomain: 1
    })

    const assigner = new Assigner(actionContext, config)
    expect(assigner.selectReviewers).toThrow(Error)
})

test('_selectReviewerForDomain assigns expected number of reviewers from the domain', () => {
    const config = new ActionConfig({
        reviewers: defaultReviewers,
        numberOfReviewers: 2,
        numberOfReviewersFromDomain: 1
    })

    const assigner = new Assigner(actionContext, config)
    const reviewers = assigner._selectReviewersForDomain('domain1')
    expect(reviewers.length).toBe(config.numberOfReviewersForDomain)
    expect(reviewers[0]).toMatch(/d1-/)
})

test('_selectReviewerFromAllReviewers assigns certain number of reviewers', () => {
    const config = new ActionConfig({
        reviewers: mismatchReviewers,
        numberOfReviewers: 2,
        numberOfReviewersFromDomain: 1
    })

    const assigner = new Assigner(actionContext, config)
    const reviewers = assigner._selectReviewersFromAllReviewers()
    // _selectReviewersFromAllReviewers assigns reviewers whether the pr has any of defined domains
    expect(reviewers.length).toBe(2)
})

test('_selectReviewers does not assign an author of the PR as a reviewer', () => {
    const config = new ActionConfig({
        reviewers: defaultReviewers,
        numberOfReviewers: 0, // does not effect because this is a test for private method
        numberOfReviewersFromDomain: 0 // same here
    })
    const assigner = new Assigner(actionContext, config)
    const reviewers = assigner._selectReviewers(
        [actionContext.owner, 'reviewer1', 'reviewer2'],
        2
    )
    expect(reviewers.length).toBe(2)
    expect(reviewers).not.toContain(actionContext.owner)
})

test('doestRespondTo returns true if the pr have any of defined domains in the config file', () => {
    const config = new ActionConfig({
        reviewers: defaultReviewers,
        numberOfReviewers: 0,
        numberOfReviewersFromDomain: 0
    })
    expect(Assigner.doesRespondTo(actionContext, config)).toBe(true)
})

test('doestRespondTo returns false if the pr does not have any of defined domains in the config file', () => {
    const config = new ActionConfig({
        reviewers: mismatchReviewers,
        numberOfReviewers: 0,
        numberOfReviewersFromDomain: 0
    })
    expect(Assigner.doesRespondTo(actionContext, config)).toBe(false)
})
