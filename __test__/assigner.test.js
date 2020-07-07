fs = require('fs')
Assigner = require('../src/assigner')

const payloadFile = __dirname + '/payload.json'
const payload = JSON.parse(fs.readFileSync(payloadFile, 'utf-8')).payload

test('it stores instance variables from parameters', () => {
    const config = {
        "reviewers": {
            "domain1": [
                "d1-reviewer1",
                "d1-reviewer2"
            ],
            "domain2": [
                "d2-reviewer1",
                "d2-reviewer2"
            ]
        }
    }
    const numberOfReviewers = 2
    const numberOfReviewersFromDomain = 1
    const assigner = new Assigner(
        config.reviewers,
        payload.pull_request,
        numberOfReviewers,
        numberOfReviewersFromDomain
    )
    expect(assigner.allReviewers).toEqual(['d1-reviewer1', 'd1-reviewer2', 'd2-reviewer1', 'd2-reviewer2'])
    expect(assigner.domains).toEqual(['domain1', 'domain2'])
    expect(assigner.pullRequest).not.toBeNull()
    expect(assigner.ownerName).toBe('pr_author')
    expect(assigner.numberOfReviewers).toBe(numberOfReviewers)
    expect(assigner.numberOfReviewersFromDomain).toBe(numberOfReviewersFromDomain)
})

test('it assgins certain number of reviewers, 1 reviewer is from domain', () => {
    const config = {
        "reviewers": {
            "domain1": [
                "d1-reviewer1",
                "d1-reviewer2"
            ],
            "domain2": [
                "d2-reviewer1",
                "d2-reviewer2"
            ]
        }
    }
    const numberOfReviewers = 3
    const assigner = new Assigner(config.reviewers, payload.pull_request, numberOfReviewers)
    const reviewers = assigner.selectReviewers()
    expect(reviewers.length).toBe(3)
    expect(reviewers[0]).toMatch(/d1-/)
})

test('it assigns possible maximum number of reviewers', () => {
    const config = {
        "reviewers": {
            "domain1": [
                "d1-reviewer1",
                "d1-reviewer2"
            ],
            "domain2": [
                "d2-reviewer1",
                "d2-reviewer2"
            ]
        }
    }
    const numberOfReviewers = 100
    const assigner = new Assigner(config.reviewers, payload.pull_request, numberOfReviewers)
    const reviewers = assigner.selectReviewers()
    expect(reviewers.length).toBe(4)
    expect(reviewers[0]).toMatch(/d1-/)
})

test('it assigns expected number of reviewers from the domain', () => {
    const config = {
        "reviewers": {
            "domain1": [
                "d1-reviewer1",
                "d1-reviewer2"
            ],
            "domain2": [
                "d2-reviewer1",
                "d2-reviewer"
            ]
        }
    }
    const numberOfReviewersForDomain = 1
    const assigner = new Assigner(
        config.reviewers,
        payload.pull_request,
        2,
        numberOfReviewersForDomain
    )
    const reviewers = assigner._selectReviewersForDomain('domain1')
    expect(reviewers.length).toBe(numberOfReviewersForDomain)
    expect(reviewers[0]).toMatch(/d1-/)
})

test('it assigns certain number of random reviewers', () => {
    const config = {
        "reviewers": {
            "domain1": [
                "d1-reviewer1",
                "d1-reviewer2"
            ],
            "domain2": [
                "d2-reviewer1",
                "d2-reviewer"
            ]
        }
    }
    const numberOfReviewers = 2
    const assigner = new Assigner(config.reviewers, payload.pull_request, numberOfReviewers)
    const reviewers = assigner._selectReviewersFromAllReviewers()
    expect(reviewers.length).toBe(2)
})

test('does not assign an author of the PR as a reviewer', () => {
    const config = {
        "reviewers": {
            "domain1": [
                "pr_author",
                "d1-reviewer2"
            ],
            "domain2": [
                "d2-reviewer1",
                "d2-reviewer"
            ]
        }
    }
    const numberOfReviewers = 2
    const assigner = new Assigner(config.reviewers, payload.pull_request, numberOfReviewers)
    const author =  payload.pull_request.user.login
    const reviewers = assigner._selectReviewers(
        [author, 'reviewer1', 'reviewer2'],
        2
    )
    expect(reviewers.length).toBe(2)
    expect(reviewers).not.toContain(author)
})
