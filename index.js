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
    const depth = core.getInput('depth');
    const targetDirectory = core.getInput('target-directory')
    if (targetDirectory && depth == 1) {
        depth = 2;
    }

    octokit.repos.compareCommits({owner, repo, base, head})
    .then(data => {
        const changedDirectories = data['data']['files']
        .map(file => file['filename'])
        .filter(file => reduceFile(file, targetDirectory))
        .map(file => parseDirectories(file, depth, targetDirectory))
        .filter(directory => directory.length > 0);
        const result = buildMatrix(changedDirectories)
        core.setOutput("is_empty", result['include'].length < 1)
        core.setOutput("build_matrix", JSON.stringify(result));
    }).catch(error => {
        core.setFailed(error.message);
    });

} catch (error) {
    core.setFailed(error.message);
}

function reduceFile(file, targetDirectory) {
    if (targetDirectory) {
        return file.startsWith(targetDirectory);
    } else {
        return file;
    }
}

function parseDirectories(file, depth, targetDirectory) {
    let parts = file.split("/");
    var directory = "";
    for (let i = 0; i < parts.length && i < depth; i++) {
        directory = directory.concat(parts[i]);
        if (i != parts.length - 1 && i != depth - 1) {
            directory = directory.concat('/');
        }
    }
    if (targetDirectory) {
        directory = directory.replace(targetDirectory + '/', "");
    }
    return directory;
}

function buildMatrix(changedDirectories) {
    include = [];
    var directory;
    for (directory of changedDirectories) {
        include.push({'directory': directory});
    }
    return {'include': include};
}