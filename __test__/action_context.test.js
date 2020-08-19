const fs = require('fs')
const ActionContext = require('../src/action_context')

const createTextContext = () => {
    let json = JSON.parse(fs.readFileSync('__test__/payload.json', 'utf8'))
    json['issue'] = {
        owner: 'repo_owner',
        number: 122,
        repo: 'my_repo',
    }
    return json
}

test('it stores data', () => {
    const config = new ActionContext(createTextContext())
    expect(config.labels).toEqual(['domain1'])
    expect(config.owner).toBe('pr_author')
    expect(config.repo_owner).toBe('repo_owner')
    expect(config.number).toBe(122)
    expect(config.repo).toBe('my_repo')
    expect(config.numberOfReviewers).toBe(0)
})
