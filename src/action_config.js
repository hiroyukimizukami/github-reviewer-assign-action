const utils = require('./utils')

const listAllReviewers = (teams) => {
    const accumulator = (h, v) => {
        h.push(v)
        return h
    }

    return Object.values(teams).reduce(accumulator, []).flat()
}

module.exports = class ActionConfig {
    constructor(configHash) {
        this.reviewers = configHash.reviewers
        this.allReviewers = listAllReviewers(configHash.reviewers)
        this.domains = Object.keys(configHash.reviewers)
        this.numberOfReviewers = utils.valueOr(configHash.numberOfReviewers, 1)
        this.numberOfReviewersForDomain = utils.valueOr(configHash.numberOfReviewersForDomain, 1)
    }
}
