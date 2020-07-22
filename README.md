# Github Reviewers Assign Action

This is a github action script. it assignes reviewers based on pull request's labels. You can group reviewers for each label by a config file. With this, you can use a label to describe a domain that's related with the PR and group reviewers under each domain for example.

## Config file
This script accepts a config file path via one of parameters, `config-path` that defined in [action.yml](./action.yml).

`reviewers`, You can define groups that correspond to pull requeust's labels by this property. Each label can have 0 to multiple reviewers. If a group does not have reviewers and a PR uses the corresponding label, this script select reviewers from all of reviewers who are in other groups. `numberOfReviewers` describes how many reviewers you want for a PR. `numberOfReviewersForDomain` describes how many reviewers you want fron a group. Thus, `numberOfReviewers` must be greater than (or equal to) `numberOfReviewersForDmain`. Unlike `reviewers`, `numberOfReviewers` and `numberOfReviewersForDomain` are optional property, `1` will be assigned if you omit either of them.

For more details, see [assigner.test.js](./__test__/assigner.test.js)

## Action.yml
This scripts requires 2 parameters, `repo-token` and `config-path`. For `repo-token`, it must have `repo` scope. For `config-path`, the defaul value is `.github/reviewer_config.yml`.
