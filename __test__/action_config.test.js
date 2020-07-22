const ActionConfig = require('../src/action_config')

const defaultConfigHash = {
    reviewers: {
        domain1: ["d1-reviewer1", "d1-reviewer2"],
        domain2: ["d2-reviewer1","d2-reviewer2"]
    },
    numberOfReviewers: 2,
    numberOfReviewersForDomain: 1
}

test('it stores data', () => {
    const config = new ActionConfig(defaultConfigHash)
    expect(config.allReviewers).toEqual(['d1-reviewer1', 'd1-reviewer2', 'd2-reviewer1', 'd2-reviewer2'])
    expect(config.reviewers.domain1).toEqual(["d1-reviewer1", "d1-reviewer2"])
    expect(config.reviewers.domain2).toEqual(["d2-reviewer1", "d2-reviewer2"])
    expect(config.domains).toEqual(['domain1', 'domain2'])
    expect(config.numberOfReviewers).toBe(2)
    expect(config.numberOfReviewersForDomain).toBe(1)
})

test('it removes duplicated reviewers', () => {
    const config = new ActionConfig({
        reviewers: {
            domain1: ["d1-reviewer1", "d1-reviewer2", "d1-reviewer2"],
            domain2: ["d2-reviewer1","d2-reviewer2", "d1-reviewer2"]
        },
        numberOfReviewers: 2,
        numberOfReviewersForDomain: 1
    })

    expect(config.allReviewers).toEqual(['d1-reviewer1', 'd1-reviewer2', 'd2-reviewer1', 'd2-reviewer2'])
    expect(config.reviewers.domain1).toEqual(["d1-reviewer1", "d1-reviewer2"])
    expect(config.reviewers.domain2).toEqual(["d2-reviewer1", "d2-reviewer2", "d1-reviewer2"])
})

test('it throws an error if number of reviewer is lesser than number of reviewers for domain', () => {
    const initializer = () => {
        new ActionConfig({
            reviewers: {
                domain1: ["d1-reviewer1", "d1-reviewer2"],
                domain2: ["d2-reviewer1","d2-reviewer2"]
            },
            numberOfReviewers: 2,
            numberOfReviewersForDomain: 3
        })
    }

    expect(initializer).toThrow(Error)
})
