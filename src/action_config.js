const utils = require('./utils')
const lodash = require('lodash')

const listAllReviewers = (teams) => {
    const accumulator = (h, v) => {
        h.push(v)
        return h
    }

    return lodash.uniq(Object.values(teams).reduce(accumulator, []).flat())
}

module.exports = class ActionConfig {
    constructor(configHash) {
        let reviewers = {}
        for (let key in configHash.reviewers) {
            reviewers[key] = lodash.uniq(configHash.reviewers[key])
        }
        this.reviewers = reviewers
        this.allReviewers = listAllReviewers(configHash.reviewers)
        this.domains = Object.keys(configHash.reviewers)
        this.numberOfReviewers = utils.valueOr(configHash.numberOfReviewers, 1)
        this.numberOfReviewersForDomain = utils.valueOr(configHash.numberOfReviewersForDomain, 1)
    }
}
