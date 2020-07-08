Assigner = require('../src/assigner')

const labels = [{name: 'domain1'}]
const pullRequest = {owner: 'pr_author', number: 6, repo: 'test'}

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
        labels,
        pullRequest,
        numberOfReviewers,
        numberOfReviewersFromDomain
    )
    expect(assigner.allReviewers).toEqual(['d1-reviewer1', 'd1-reviewer2', 'd2-reviewer1', 'd2-reviewer2'])
    expect(assigner.labels).toEqual(labels)
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
    const assigner = new Assigner(
        config.reviewers,
        labels,
        pullRequest,
        numberOfReviewers
    )
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
    const assigner = new Assigner(
        config.reviewers,
        labels,
        pullRequest,
        numberOfReviewers
    )
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
                "d2-reviewer2"
            ]
        }
    }
    const numberOfReviewersForDomain = 1
    const assigner = new Assigner(
        config.reviewers,
        labels,
        pullRequest,
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
                "d2-reviewer2"
            ]
        }
    }
    const numberOfReviewers = 2
    const assigner = new Assigner(
        config.reviewers,
        [],
        pullRequest,
        numberOfReviewers
    )
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
                "d2-reviewer2"
            ]
        }
    }
    const numberOfReviewers = 2
    const assigner = new Assigner(
        config.reviewers,
        [],
        pullRequest,
        numberOfReviewers
    )
    const author =  'pr_author'
    const reviewers = assigner._selectReviewers(
        [author, 'reviewer1', 'reviewer2'],
        2
    )
    expect(reviewers.length).toBe(2)
    expect(reviewers).not.toContain(author)
})
