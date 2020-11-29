const core = require('@actions/core');
const github = require('@actions/github');

try { 
    const context = github.context.payload;
    const owner = context['repository']['owner']['name'];
    const repo = context['repository']['name'];
    const base = context['repository']['default_branch'];
    const head = context['ref'].replace("refs/heads/", "");
    
    const token = core.getInput('repo-token');
    const octokit = github.getOctokit(token);

    octokit.repos.compareCommits({owner, repo, base, head})
    .then(data => {
        const files = data['data']['files'].map(file => file['filename']);
        core.setOutput("files_changed", JSON.stringify(files));
    }).catch(error => {
        core.setFailed(error.message);
    });

} catch (error) {
    core.setFailed(error.message);
}