const lodash = require('lodash')
const core = require('@actions/core')

class Assigner {
    constructor(context, config) {
        this.labels = context.labels
        this.owner = context.owner

        this.allReviewers = config.allReviewers
        this.reviewers = config.reviewers
        this.domains = config.domains
        this.numberOfReviewers = config.numberOfReviewers
        this.numberOfReviewersForDomain = config.numberOfReviewersForDomain
    }

    selectReviewers() {
        // If the issue does not have any of defined labels, do not assign reviewers
        const reviewDomains = lodash.intersection(this.domains, this.labels)
        if (reviewDomains.length == 0) {
            throw new Error('ValidLabelNotFound')
        }

        // Currently only supports 1 domain label
        const reviewers = this._selectReviewersForDomain(reviewDomains[0])
        if (reviewers.length >= this.numberOfReviewers) {
            return reviewers
        }

        const sizeToFill = this.numberOfReviewers - reviewers.length
        const candidates = lodash.difference(this.allReviewers, reviewers)
        const substitutes = this._selectReviewers(candidates, sizeToFill)
        return reviewers.concat(substitutes)
    }

    _selectReviewersForDomain(domainName) {
        //  A domain that does not have reviewers is covered by all reviewers.
        // This is for a spec that to allow a config file to define genneral domain like 'all, or misc'
        const reviewersForDomain = this.reviewers[domainName]
        if (!(reviewersForDomain && reviewersForDomain.length > 0)) {
            return this._selectReviewersFromAllReviewers()
        }
        return this._selectReviewers(reviewersForDomain, this.numberOfReviewersForDomain)
    }

    _selectReviewersFromAllReviewers() {
        return this._selectReviewers(this.allReviewers, this.numberOfReviewers)
    }

    _selectReviewers(reviewers, number) {
        const candidates = lodash.without(reviewers, this.owner)
        return lodash.sampleSize(candidates, number)
    }
}

Assigner.doesRespondTo = (context, config)  => {
    if (lodash.intersection(config.domains, context.labels).length == 0) {
        return false
    }
    if (context.numberOfReviewers >= config.numberOfReviewers) {
        return false
    }
    return true
}

module.exports = Assigner
