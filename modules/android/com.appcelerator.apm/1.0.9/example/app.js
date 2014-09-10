// An Example app to show usage of the Crittercism APIs
// this does not currently contain best practices for
// Crittercism in conjunction with Titanium
// 
// Updated 12-12-2013

Ti.API.info("Ti App: importing Crittercism...");
var crittercism = require('com.appcelerator.apm');
Ti.API.info("module is => " + crittercism + "\n");

var didCrash;
// Note: initializing differently for each platform is a work around until the single appcelerator
// platform is available on Crittercism.
if (Titanium.Platform.osname == 'android')
{
	Ti.API.info("Ti App: initializing Crittercism Android...");
	// Note: this is a temporary work around until a single Crittercism App ID is available for Titanium Apps
	Ti.App.Properties.setString('com-appcelerator-apm-id', '52ab39fb97c8f23279000001');
	// Note: initializing with an AppID in the init call will take precedence over the com-crittercism-id
	// For example: crittercism.init("5004e9d1be790e78f2000006");
	crittercism.init();
	didCrash = crittercism.didCrashOnLastAppLoad();
}
else if (Titanium.Platform.osname == 'iphone' || Titanium.Platform.osname == 'ipad')
{
	Ti.API.info("Ti App: initializing Crittercism iOS...");
	Ti.App.Properties.setString('com-appcelerator-apm-id', '5004e9aa6c36f94dc7000003');
	crittercism.init();
	didCrash = crittercism.didCrashOnLastAppLoad();
}
Ti.API.info("Ti App: Crittercism initialized\n");

// Note: this currently does not trigger for iOS
var crashed = (didCrash)?"Yes":"No";
Ti.API.info("Ti App: didCrashOnLastLoad: " + crashed + "\n");

Ti.API.info("Ti App: Crittercism UUID: " + crittercism.getUUID() + "\n");

// Android Only
Ti.API.info("Ti App: Crittercism Notification Title: " + crittercism.getNotificationTitle() + "\n");

var win = Titanium.UI.createWindow({
	title : 'Crittercism Test',
	backgroundColor : '#fff'
});
crittercism.leaveBreadcrumb("Creating window");

var topLabel = Titanium.UI.createLabel({
	top:10,
	color : '#999',
	text : 'Crittercism Test App!',
	font : {
		fontSize : 16,
		fontFamily : 'Helvetica Neue'
	},
	width : 'auto'
});

win.add(topLabel);

var setMetaData = Titanium.UI.createButton({
	top:35,
	width:301,
	height:100,
	title:'Set Metadata'
});

setMetaData.addEventListener('click', function()
{
	Ti.API.info("setMetaData // Setting Username");
	crittercism.leaveBreadcrumb("setMetaData // Setting Username");
	crittercism.setUsername("TheCritter");
	
	Ti.API.info("setMetaData // Setting Arbitrary Single Set Metadata");
	crittercism.setMetadata("gameLevel", "6");
	crittercism.setMetadata("playerID", "9491824");
});

win.add(setMetaData);

var crashButton = Titanium.UI.createButton({
	top:140,
	width:301,
	height:100,
	title:'Crash'
});

crashButton.addEventListener('click', function()
{
	crittercism.leaveBreadcrumb("Clicking the crash button");
	doSomething();
});

win.add(crashButton);

var handledButton = Titanium.UI.createButton({
	top:245,
	width:301,
	height:100,
	title:'Send Handled Exception'
});

handledButton.addEventListener('click', function()
{	
	var error = new Error("A Custom Error!");
	crittercism.logHandledException(error);

	try {
		crittercism.leaveBreadcrumb("Attempting some awesome task...");
		doSomething();
	} catch (err){
		crittercism.leaveBreadcrumb("Oh no, it failed! Log it...");
		crittercism.logHandledException(err);
	}
});

win.add(handledButton);

var doSomething = function doSomething () {
	crittercism.leaveBreadcrumb("doSomething // Entered");
	foo();
}

function foo () {
	crittercism.leaveBreadcrumb("Foo // Entered");
	bar();
}

function bar () {
	crittercism.leaveBreadcrumb("Bar // Entered");
	something();
}

var something = function() {
	crittercism.leaveBreadcrumb("Something // Entered");
	// create an array with an invalid size
	var a = new Array(0x100000000);
	
	var array = new Array();
	
	win.add(array[0]); // this gets caught because the object is undefined and not a proxy
	
	// throw a custom exception
	var er = new Error("My Awesome Uncaught Error!");
	throw er;
}

var status = false;

var optOutToggle = Titanium.UI.createButton({
	top:350,
	width:301,
	height:100,
	title:'Toggle OptOut Status: No'
});

optOutToggle.addEventListener('click', function()
{
	// Set the status
	crittercism.setOptOutStatus(status = !status);
	
	// change the status in the button title for visibility
	var stringStatus = crittercism.getOptOutStatus() ? "Yes" : "No";
	optOutToggle.title = 'Toggle OptOut Status: ' + stringStatus;
});

win.add(optOutToggle);

// iOS Only
var asyncBreadcrumbToggle = Titanium.UI.createButton({
	top:455,
	width:301,
	height:100,
	title:'Toggle Async BreadCrumbs: No'
});

asyncBreadcrumbToggle.addEventListener('click', function()
{
	// Set the status
	crittercism.setAsyncBreadcrumbMode(status = !status);
	
	// change the status in the button title for visibility
	var stringStatus = status? "Yes" : "No";
	asyncBreadcrumbToggle.title = 'Toggle Async BreadCrumbs: ' + stringStatus;
});

win.add(asyncBreadcrumbToggle);

win.open();
