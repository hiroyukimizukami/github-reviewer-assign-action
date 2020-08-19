Assigner = require('../src/assigner')
ActionConfig = require('../src/action_config.js')
ActionContext = require('../src/action_context.js')

const defaultReviewers = {
    domain1: ["d1-reviewer1", "d1-reviewer2"],
    domain2: ["d2-reviewer1","d2-reviewer2"],
    domain3: ["pr_author"],
}

const mismatchReviewers = {
    domain2: ["d2-reviewer1", "d2-reviewer2"],
    domain3: ["d3-reviewer1","d3-reviewer2"]
}

const defaultActionContext = new ActionContext({
    issue: {owner: 'repo_owner', number: 6, repo: 'test'},
    payload: {
        pull_request: {
            user: {login: 'pr_author'},
            labels: [{name: 'domain1'}],
            requested_reviewers: []
        }
    }
})

describe('instance variables', () => {
    test('it stores parameters as instance variables', () => {
        const config = new ActionConfig({
            reviewers: defaultReviewers,
            numberOfReviewers: 2,
            numberOfReviewersForDomain: 1
        })

        const assigner = new Assigner(defaultActionContext, config)
        expect(assigner.allReviewers).toEqual(['d1-reviewer1', 'd1-reviewer2', 'd2-reviewer1', 'd2-reviewer2', 'pr_author'])
        expect(assigner.labels).toEqual(defaultActionContext.labels)
        expect(assigner.domains).toEqual(['domain1', 'domain2', 'domain3'])
        expect(assigner.pullRequest).not.toBeNull()
        expect(assigner.owner).toBe('pr_author')
        expect(assigner.numberOfReviewers).toBe(config.numberOfReviewers)
        expect(assigner.numberOfReviewersForDomain).toBe(config.numberOfReviewersForDomain)
    })
})

describe('select reviewers: basic cases', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: {
                domain1: ['d1-reviewer1'],
                domain2: ['d2-reviewer1', 'd2-reviewer2', 'pr_author'],
            },
            numberOfReviewers: 3,
            numberOfReviewersForDomain: 1
        })

        const assigner = new Assigner(defaultActionContext, config)
        return assigner.selectReviewers()
    })()

    test('it assgins speficied number of reviewers', () => {
        expect(subject.length).toBe(3)
    })
    test('it assigns reviewers from the domain as many as possible', () => {
        expect(subject).toEqual(expect.arrayContaining(['d1-reviewer1']))
    })
    test('it does not assign pr author', () => {
        expect(subject).toEqual(expect.not.arrayContaining(['pr_author']))
    })
})

describe('select reviewers: default value of number of reviewers', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: defaultReviewers,
        })

        const assigner = new Assigner(defaultActionContext, config)
        return assigner.selectReviewers()
    })()

    test('it assgins speficied default number of reviewers', () => {
        expect(subject.length).toBe(1)
    })
})

describe('select reviewers: impossible number of reviewers', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: defaultReviewers,
            numberOfReviewers: 100,
        })

        const assigner = new Assigner(defaultActionContext, config)
        return assigner.selectReviewers()
    })()

    test('it assgins reviewers as many as possible', () => {
        expect(subject.length).toBe(4)
    })
    test('it does not assign pr author', () => {
        expect(subject).toEqual(expect.not.arrayContaining(['pr_author']))
    })
})

describe('select reviewers: not enough reviewers in the designated domain', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: {
                domain1: ['d1-reviewer1', 'd1-reviewer2'],
                domain2: ['pr_author', 'd2-reviewer1'],
            },
            numberOfReviewers: 3,
            numberOfReviewersForDomain: 2
        })

        const assigner = new Assigner(defaultActionContext, config)
        return assigner.selectReviewers()
    })()

    test('it assgins reviewers as many as possible', () => {
        expect(subject.length).toBe(3)
    })
    test('it assigns reviewers from the domain as many as possible', () => {
        expect(subject).toEqual(expect.arrayContaining(['d1-reviewer1', 'd1-reviewer2']))
    })
    test('it does not assign pr author', () => {
        expect(subject).toEqual(expect.not.arrayContaining(['pr_author']))
    })
})

describe('select reviewers: no suitable reviewers', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: {
                domain1: [],
                domain2: ['pr_author'],
                domain3: ['pr_author']
            },
        })

        const assigner = new Assigner(defaultActionContext, config)
        return assigner.selectReviewers()
    })()

    test('it does not assign reviewers', () => {
        expect(subject.length).toBe(0)
    })
})

describe('select reviewers: undefined labels', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: defaultReviewers
        })

        const context = new ActionContext({
            issue: {owner: 'repo_owner', number: 6, repo: 'test'},
            payload: {
                pull_request: {
                    user: {login: 'pr_author'},
                    labels: [{name: 'unrealistic-label'}],
                    requested_reviewers: []
                }
            }
        })

        const assigner = new Assigner(context, config)
        return assigner.selectReviewers()
    })

    test('it throws an error', () => {
        // Note: this case should be checked before calling this method by checking 'doesRespondTo'
        expect(subject).toThrowError(/ValidLabelNotFound/)
    })
})

describe('select reviewers: 1 valid label and 1 invalid label', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: {
                domain1: ['d1-reviewer1', 'pr_author'],
                domain2: ['d2-reviewer1', 'd2-reviewer3'],
                numberOfReviewers: 3
            }
        })

        const context = new ActionContext({
            issue: {owner: 'repo_owner', number: 6, repo: 'test'},
            payload: {
                pull_request: {
                    user: {login: 'pr_author'},
                    labels: [{name: 'domain1'}, {name: 'invalid-label'}],
                    requested_reviewers: []
                }
            }
        })

        const assigner = new Assigner(context, config)
        return assigner.selectReviewers()
    })()

    test('it assigns a reviewer(as the defualt value)', () => {
        expect(subject.length).toBe(1)
    })

    test('it assigns a reviewer from the designated domain', () => {
        expect(subject).toEqual(expect.arrayContaining(['d1-reviewer1']))
    })
})

describe('select reviewers: the designated domain does not have reviewers', () => {
    const subject = (() => {
        const config = new ActionConfig({
            reviewers: {
                domain1: [],
                domain2: ['pr_author'],
                domain3: ['d3-reviewer1'],
                domain4: ['d4-reviewer1'],
            },
            numberOfReviewers: 2
        })

        const assigner = new Assigner(defaultActionContext, config)
        return assigner.selectReviewers()
    })()

    test('it assigns a reviewer from all reviewers', () => {
        expect(subject.length).toBe(2)
    })

    test('it still does not assign pr author', () => {
        expect(subject).toEqual(expect.not.arrayContaining(['pr_author']))
    })
})

describe('doesRespondTo', () => {
    test('it returns true if the pr has any of defined domains in the config file', () => {
        const config = new ActionConfig({
            reviewers: defaultReviewers,
            numberOfReviewers: 0,
            numberOfReviewersForDomain: 0
        })
        expect(Assigner.doesRespondTo(defaultActionContext, config)).toBe(true)
    })

    test('it returns false if the pr does not have any of defined domains in the config file', () => {
        const config = new ActionConfig({
            reviewers: mismatchReviewers,
            numberOfReviewers: 0,
            numberOfReviewersForDomain: 0
        })
        expect(Assigner.doesRespondTo(defaultActionContext, config)).toBe(false)
    })

    test('it returns true if the pr has reviewers lesser than the designated number', () => {
        const config = new ActionConfig({
            reviewers: defaultReviewers,
            numberOfReviewers: 2,
            numberOfReviewersForDomain: 1
        })

        const context = new ActionContext({
            issue: {owner: 'repo_owner', number: 6, repo: 'test'},
            payload: {
                pull_request: {
                    user: {login: 'pr_author'},
                    labels: [{name: 'domain1'}],
                    requested_reviewers: [
                        {"login": "other_user", "id": 1},
                    ]
                }
            }
        })

        expect(Assigner.doesRespondTo(context, config)).toBe(true)
    })

    test('it returns false if the pr has reviewers more than or equal to the designated number', () => {
        const config = new ActionConfig({
            reviewers: defaultReviewers,
            numberOfReviewers: 2,
            numberOfReviewersForDomain: 1
        })

        const context = new ActionContext({
            issue: {owner: 'repo_owner', number: 6, repo: 'test'},
            payload: {
                pull_request: {
                    user: {login: 'pr_author'},
                    labels: [{name: 'domain1'}],
                    requested_reviewers: [
                        {"login": "other_user", "id": 1},
                        {"login": "other_user2","id": 2}
                    ]
                }
            }
        })

        expect(Assigner.doesRespondTo(context, config)).toBe(false)
    })
})
