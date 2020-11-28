const core = require('@actions/core');
const github = require('@actions/github');

try {

    const context = github.context;

    const diff = octokit.repos.compareCommits({
        owner.repo.owner,
        context.repo.repo
        process.env.GITHUB_BASE_REF,
        context.sha,
      });
      
    core.setOutput("diff", diff);

} catch (error) {
    core.setFailed(error.message);
}