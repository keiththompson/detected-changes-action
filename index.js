const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs')

try { 
    const context = github.context.payload;
    const owner = context['repository']['owner']['login'];
    const repo = context['repository']['name'];
    const base = context['repository']['default_branch'];
    var head;
    if (github.context.eventName === 'pull_request') {
        head = context['pull_request']['head']['ref'];
    } else {
        head = context['ref'].replace("refs/heads/", "");
    }
    const token = core.getInput('repo-token');
    const octokit = github.getOctokit(token);
    const depth = core.getInput('depth');
    const buildAll = core.getInput('build-all');
    const targetDirectory = core.getInput('target-directory')
    if (targetDirectory && depth == 1) {
        depth = 2;
    }

    if (buildAll) {
        const directories = getDirectories(targetDirectory)
        const result = buildMatrix(directories)
        core.setOutput("is_empty", result['include'].length < 1)
        core.setOutput("build_matrix", JSON.stringify(result));
    } else {
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
            console.log(error);
            core.setFailed(error.message);
        });
    }

} catch (error) {
    console.log(error);
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
    let directories = [...new Set(changedDirectories)];
    let include = []
    for (directory of directories) {
        include.push({'directory': directory});
    }
    return {'include': include};
}

function getDirectories(path) {
    const isDirectory = fs.lstatSync(path).isDirectory()
    return fs.readdirSync(path, { withFileTypes: true})
        .filter(directory => fs.lstatSync(path + "/" + directory.name).isDirectory())
        .map(row => row['name'])
  }