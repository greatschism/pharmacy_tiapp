var args = arguments[0] || {};
var App= require("core");

$.msiLandingPage.backgroundColor = args.backgroundColor || Alloy.CFG.defaults.colors.backgroundColor;
Ti.API.info(args.text);
Ti.API.info(args.backgroundColor);
Ti.API.info(args.color);

$.label.applyProperties({
	text: args.text || "Sorry, no text",
	color: args.color || Alloy.CFG.defaults.colors.borderColor
});


for(var i in args.menuItems){
	var menuItem = Ti.UI.createLabel({
		width: 100,
		height:100,
		text:args.menuItems[i],
		borderRadius:10,
		left:20,
		right:20,
		top:20,
		bottom:20,
		backgroundColor:Alloy.CFG.defaults.colors.backgroundColor,
		borderColor:Alloy.CFG.defaults.colors.borderColor,
		borderWidth:2,
		textAlign:"center",
		color:Alloy.CFG.defaults.colors.textColor
	});
	$.menuContainer.add(menuItem);
}




function nextWindow(){
	// App.Navigator.open("pageTwo", {
		// backgroundColor: "red",
		// text: "Back"
	// });

}
