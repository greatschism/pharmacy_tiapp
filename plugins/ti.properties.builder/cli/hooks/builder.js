// Export supported versions
exports.cliVersion = ">=3.X";

var TAG = "PropertiesBuilder",
    fs = require("fs");

/**
 * The 3.0+ CLI doesn't properly pass the deploy type for Android,
 * so get it based on the target
 */
function mapTargetToDeployType(target) {
	switch(target) {
	case 'dist-playstore':
		return 'production';
	case 'device':
		return 'test';
	case 'emulator':
		return 'development';
	default:
		return 'development';
	}
}

// Main entry point for the hook;
// it is the version of Titanium that introduced and allow the hook js script to function.
exports.init = function(logger, config, cli, appc) {

	logger.info(TAG + " : initiated");

	var projectPath = cli.argv["project-dir"],
	    CONFIG_JSON = "app/config.json",
	    configJSONPath = projectPath + "/" + CONFIG_JSON;

	function writeFile(filename, data) {
		fs.writeFileSync(filename, data);
	};

	cli.on("build.pre.construct", function(build, done) {

		var deployType = mapTargetToDeployType(cli.argv["target"]);
		if (deployType != "production") {
			logger.info(TAG + " : ignored since deploy type is " + deployType);
			return done();
		}

		try {

			//update config
			var CONFIG_DATA = require(configJSONPath);
			CONFIG_DATA.global.buildDate = new Date().toString();
			writeFile(configJSONPath, JSON.stringify(CONFIG_DATA, null, 4));

			return done();

		} catch(e) {

			logger.error(TAG + " : " + e);
			return done();

		}

	});

};
