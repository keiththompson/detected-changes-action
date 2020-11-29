module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 456:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(105);
const github = __webpack_require__(82);

try { 
    const context = github.context.payload;
    const owner = context['repository']['owner']['name'];
    const repo = context['repository']['name'];
    const base = context['repository']['default_branch'];
    console.log(`ref: ${context['ref']}`)
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

/***/ }),

/***/ 105:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 82:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(456);
/******/ })()
;