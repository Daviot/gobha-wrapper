'use strict';
/////
// Dependencies
/////
var Metalsmith = require('metalsmith'),
	assets = require('metalsmith-assets'),
	jetpack = require('fs-jetpack'),
	template = require('./../../gobha-template/lib'),
	fileToPath = require('./../../gobha-file-to-path/lib'),
	navigation = require('./../../gobha-navigation/lib'),
	partials = require('./../../gobha-partials/lib'),
	//handlePage = require('./../../gobha-handle-page/lib'),
	meta = require('./../../gobha-meta/lib')

/////
// Helper
/////
var startTime = new Date()
var output = (name) => {
	return (files, metalsmith, done) => {
	console.log(name, '-------------------')
		//console.log(files)
		done()
	}
}

// expose plugin
module.exports = wrapper

/////
// Wrapper
/////
function wrapper(opts, final) {
	// default values
    opts = opts || {}
    final = final || function(err) {
		if (err) {
			console.log(err);
		}
	}

	var dir = opts.dir || './../../',
		metadata = opts.metadata || require('./metadata.json'),
		sourceDir = opts.sourceDir || './src',
		buildDir = opts.buildDir || './build',
		partialDir = opts.partialDir || 'partials',
		clean = opts.clean || true,
		assetsSourceDir = opts.assetsSourceDir || './assets',
		assetsBuildDir = opts.assetsBuildDir || './assets',
		phpSourceDir = opts.phpSourceDir || './php',
		phpBuildDir = opts.phpBuildDir || './php',
		logging = opts.logging || false

	Metalsmith(dir)
		.metadata(metadata) // get basic informations
		.source(sourceDir) // set source path relative to the working directory 
		.destination(buildDir) // set output path relative to the working directory
		.clean(clean) // clears the directory
		// move assets to the build directory
		.use(assets({ // copy assets into the destionation path
			source: assetsSourceDir, // relative to the working directory 
			destination: assetsBuildDir // relative to the build directory 
		}))
		.use(assets({ // copy material design components into the destionation path
			source: './node_modules/material-components-web/dist/', // relative to the working directory 
			destination: assetsBuildDir + '/material' // relative to the build directory 
		}))
		// build meta data
		.use(meta({
			logging: logging
		}))
		// modify content
		.use(fileToPath({ // create permalinks and modify the file extension based on the settings in the file "ext: html"
			logging: logging
		})) 
		// has to be after filtopath otherwise the wrong paths will be generated
		.use(navigation({ // create navigation out of the setting in the file "nav: header"
			logging: logging
		})) 
		.use(partials({ // convert partials and handlebar code in the page files itself
			partials: partialDir,
			partialExtension: '.hbs',
			logging: logging
		}))
		// .use(output('before layouts'))
		.use(template({
			path: sourceDir,
			partials: partialDir,
			partialExtension: '.hbs',
			logging: logging
		}))
		.use(assets({ // copy php scripts into the destionation path
			source: phpSourceDir, // relative to the working directory 
			destination: phpBuildDir // relative to the build directory 
		}))
		// .use(output('after layouts'))
		.build(final)
}