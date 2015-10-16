exports.cliVersion = ">=3.2";

var TAG = "TSSTrimmer",
    path = require("path"),
    fs = require("fs-extra");

/**
 * get all js files
 * excluding those which matches
 * exclude param
 */
function getAllStyleFilesRecursive(dir, exclude, data) {
	var files = fs.readdirSync(dir);
	for (var i in files) {
		var file = dir + "/" + files[i];
		if (fs.lstatSync(file).isDirectory()) {
			getAllStyleFilesRecursive(file, exclude, data);
		} else if (file.substr(file.lastIndexOf(".")) === ".js" && (!exclude || file.indexOf(exclude) === -1)) {
			data.push(file);
		}
	}
}

exports.init = function(logger, config, cli, nodeappc) {

	var opts = config.appc.opts;

	cli.on("build.pre.compile", function(data, done) {
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
		var alloyDir = path.normalize(opts.projectDir + "/Resources/" + (opts.platform === "ios" ? "iphone" : "android") + "/alloy");
		/**
		 * we don't have any UI comp
		 * on index so it won't have any
		 * additional tss but just the
		 * complied app.tss
		 */
		var stylesDir = alloyDir + "/styles",
		    strToExclude = fs.readFileSync(stylesDir + "/index.js", "utf-8").replace("];", "");

		/**
		 * exclude index.js from list
		 * it will just as source
		 * for style injection
		 * at run time
		 */
		var exitCode = 0,
		    tiStyleSheets = [];
		getAllStyleFilesRecursive(stylesDir, "index.js", tiStyleSheets);

		/**
		 * process exclusion
		 */
		for (var i in tiStyleSheets) {
			var tiStyleSheet = tiStyleSheets[i];
			logger.debug(TAG + ": trimming " + tiStyleSheet);
			var tiStyleSheetStr = fs.readFileSync(tiStyleSheet, "utf-8").replace(strToExclude, "");
			if (tiStyleSheetStr.charAt(0) === ",") {
				tiStyleSheetStr = tiStyleSheetStr.substr(1);
			}
			if (tiStyleSheetStr.indexOf("module.exports") != -1 || tiStyleSheetStr.length > strToExclude.length) {
				logger.error(TAG + ": error while processing " + tiStyleSheet + ". \n Try to avoid using class or component names in your tss file");
				exitCode = 1;
				break;
			} else {
				fs.writeFileSync(tiStyleSheet, "module.exports = [" + tiStyleSheetStr);
			}
		}

		/**
		 * process widgets
		 * styles
		 *
		 * nl.fokkezb.drawer doesn't
		 * have any ui comp, so it
		 * won't have any styles but
		 * just process app.tss
		 */
		var defaultWidget = "nl.fokkezb.drawer",
		    widgets = JSON.parse(fs.readFileSync(path.normalize(opts.projectDir + "/app/config.json")), "utf-8").dependencies;
		if (widgets[defaultWidget]) {
			/**
			 * find string to exclude
			 */
			var startDelimeter = "module.exports = [",
			    endDelimeter = "];";
			strToExclude = fs.readFileSync(alloyDir + "/widgets/nl.fokkezb.drawer/styles/widget.js", "utf-8");
			var subStartIndex = strToExclude.lastIndexOf(startDelimeter) + startDelimeter.length;
			strToExclude = strToExclude.substr(subStartIndex, ((strToExclude.lastIndexOf(endDelimeter) - endDelimeter.length) - subStartIndex) + 1);
			/**
			 * process widgets
			 */
			for (var widget in widgets) {
				var widgetTiStyleSheets = [];
				getAllStyleFilesRecursive(alloyDir + "/widgets/" + widget + "/styles", null, widgetTiStyleSheets);
				for (var i in widgetTiStyleSheets) {
					var widgetTiStyleSheet = widgetTiStyleSheets[i];
					logger.debug(TAG + ": trimming " + widgetTiStyleSheet);
					var widgetTiStyleSheetStr = fs.readFileSync(widgetTiStyleSheet, "utf-8").replace(strToExclude, "").replace("[,", "[");
					fs.writeFileSync(widgetTiStyleSheet, widgetTiStyleSheetStr);
					/**
					 * if still string is too long
					 * then something went wrong
					 */
					if (widgetTiStyleSheetStr.length > strToExclude.length) {
						exitCode = 1;
						logger.error(TAG + ": Something went wrong, please check your tss and try to avoid using class or component names");
						break;
					}
				}
				/**
				 * break if current
				 * widget failed
				 */
				if (exitCode) {
					break;
				}
			}
		} else {
			exitCode = 1;
			logger.error(TAG + ": default widget not found " + defaultWidget);
		}

		if (!exitCode) {
			logger.info(TAG + ": finished trimming");
		}

		done(exitCode);
	});
};
