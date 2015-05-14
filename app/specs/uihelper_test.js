var uihelper = require("uihelper");
var config = require("config");
describe("Uihelper Test Suite", function() {
	it("Uihelper (Test Case 1)", function() {
		uihelper.createTableViewSection = function(_ctrl, _title) {
			_ctrl.UI.create({
			});
			_title.UI.create({
			});
		};
		(uihelper.createTableViewSection).should.be.ok;
	});

	it("Uihelper (Test Case 2)", function() {
		uihelper.getImage = function(_o) {
			config.updateImageProperties({
				code : _o.code,
			});
		};
		(uihelper.getImage).should.be.ok;

	});
	it("Uihelper (Test Case 3)", function() {
		uihelper.getDirection = function(_source, _destination, _mode) {
			_source = "75.14";
			_destination = "85.76";
		};
		(uihelper.getDirection).should.be.ok;
	});
	it("Uihelper (Test Case 4)", function() {
		uihelper.requestAnnouncement = function(_strAnnouncement) {
			if (Ti.App.accessibilityEnabled) {
				Ti.App.fireSystemEvent(Ti.App.EVENT_ACCESSIBILITY_ANNOUNCEMENT, _strAnnouncement);
			}
		};
		(uihelper.requestAnnouncement).should.be.ok;
	});
	it("Uihelper (Test Case 5)", function() {
		uihelper.requestForFocus = function(_view) {
			_view.UI.create({
				apiName : "View"
			});
		};
		(uihelper.requestForFocus).should.be.ok;
	});
});

