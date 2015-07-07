/**
 * Usage: node PATH_TO_PROJECT/plugins/ti.build.properties/cli/hooks/sdk.js
 * returns the sdk-version value form tiapp.xml
 * Executed by Jenkins to pickup the right sdk version for ti build command.
 */
var tiapp = require("tiapp.xml").load(__dirname + "/../../../../tiapp.xml");
console.log(tiapp.sdkVersion);
