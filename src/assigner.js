const lodash = require('lodash')
const core = require('@actions/core')

const listAllReviewers = (teams) => {
    const accumulator = (h, v) => {
        h.push(v)
        return h
    }

    return Object.values(teams).reduce(accumulator, []).flat()
}

const findDomainLabelNames =  (domains,  labels) => {
    return labels
        .filter((label) => domains.includes(label.name))
        .map((label) => label.name)
}

module.exports = class Assgigner {
    constructor(
        reviewers,
        labels,
        pullRequest,
        numberOfReviewers,
        numberOfReviewersFromDomain = 1
    ) {

        core.debug("----Assigner---")
        core.debug(reviewers)
        core.debug(labels)
        core.debug(pullRequest)
        core.debug(numberOfReviewers)

        this.allReviewers = listAllReviewers(reviewers)
        this.reviewers = reviewers
        this.domains = Object.keys(reviewers)
        this.labels = labels
        this.ownerName = pullRequest.owner
        this.numberOfReviewers = numberOfReviewers
        this.numberOfReviewersFromDomain = numberOfReviewersFromDomain
    }

    selectReviewers() {
        const prDomainNames = findDomainLabelNames(this.domains, this.labels)
        if (prDomainNames.length == 0) {
            return this._selectReviewersFromAllReviewers()
        }

        // Currently only supports 1 domain label
        const reviewers = this._selectReviewersForDomain(prDomainNames[0])
        if (reviewers.length >= this.numberOfReviewers) {
            return reviewers
        }

        const sizeToFill = this.numberOfReviewers - reviewers.length
        const candidates = lodash.difference(this.allReviewers, reviewers)
        const substitutes = this._selectReviewers(candidates, sizeToFill)
        return reviewers.concat(substitutes)
    }

    _selectReviewersForDomain(domainName) {
        return this._selectReviewers(this.reviewers[domainName], this.numberOfReviewersFromDomain)

    }

    _selectReviewersFromAllReviewers() {
        return this._selectReviewers(this.allReviewers, this.numberOfReviewers)
    }

    _selectReviewers(reviewers, number) {
        const candidates = lodash.without(reviewers, this.ownerName)
        return lodash.sampleSize(candidates, number)
    }
}
