exports.cliVersion = ">=4.1";

var TAG = "TSSTrimmer",
    fs = require("fs-extra"),
    logger,
    opts;

/**
 * get all js files
 * excluding those which matches
 * exclude param
 */
function getAllJSFilesRecursive(dir, exclude, data) {
	var files = fs.readdirSync(dir);
	for (var i in files) {
		var file = dir + "/" + files[i];
		if (fs.lstatSync(file).isDirectory()) {
			getAllJSFilesRecursive(file, exclude, data);
		} else if (file.substr(file.lastIndexOf(".")) === ".js" && file.indexOf(exclude) === -1) {
			data.push(file);
		}
	}
}

function preComplieHook(data, done) {
	/**
	 * Our app.tss is too huge and copying
	 * it to all TSS makes the app size
	 * too huge. So remove app.tss content from
	 * all js files inside complied
	 * styles folder under Resources/PLATFORM_NAME/alloy
	 * By doing this still the app.tss content
	 * is accessible from XML files. APP has to
	 * take care of injecting the theme content
	 * to other styles(js) files at run time
	 */
	logger.info(TAG + ": initated");

	//styles dir
	var stylesDir = opts.projectDir + "/Resources/" + (opts.platform === "ios" ? "iphone" : "android") + "/alloy/styles";

	/**
	 * we don't have any UI comp
	 * on index.tss so it won't have any
	 * additional tss but
	 * just the complied app.tss
	 */
	var strToExclude = fs.readFileSync(stylesDir + "/index.js", "utf-8").replace("];", "");

	/**
	 * exclude index.js from list
	 * it will just as source
	 * for style injection
	 * at run time
	 */
	var tiStyleSheets = [];
	getAllJSFilesRecursive(stylesDir, "index.js", tiStyleSheets);

	/**
	 * process exclution
	 */
	var exitCode = 0;
	for (var i in tiStyleSheets) {
		var tiStyleSheet = tiStyleSheets[i];
		logger.debug(TAG + ": trimming " + tiStyleSheet);
		var tiStyleSheetStr = fs.readFileSync(tiStyleSheet, "utf-8").replace(strToExclude, "");
		if (tiStyleSheetStr.charAt(0) === ",") {
			tiStyleSheetStr = tiStyleSheetStr.substr(1);
		}
		if (tiStyleSheetStr.indexOf("module.exports") != -1) {
			logger.error(TAG + ": error while processing " + tiStyleSheet + ". \n Try to avoid using class names in your tss file.");
			exitCode = 1;
			break;
		} else {
			fs.writeFileSync(tiStyleSheet, "module.exports = [" + tiStyleSheetStr);
		}
	}

	if (!exitCode) {
		logger.info(TAG + ": finished trimming.");
	}

	done(exitCode);

};

exports.init = function(appclogger, config, cli, nodeappc) {
	logger = appclogger;
	opts = config.appc.opts;
	cli.on("build.pre.compile", preComplieHook);
};
