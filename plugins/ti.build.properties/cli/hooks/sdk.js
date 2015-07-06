//get tiapp.xml
var tiapp = require("tiapp.xml").load(__dirname + "/../../../../tiapp.xml");
console.log(tiapp.sdkVersion);